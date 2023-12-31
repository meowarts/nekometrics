const ObjectID = require('mongodb').ObjectID;
const DayJS = require('dayjs');
import PQueue from 'p-queue';

const GetRefreshPool = new PQueue({ concurrency: 5 });

import withMiddleware from '~/libs/middleware';
import Services from '~/libs/services';
import { FriendlyError } from '~/libs/services/errors';

const refreshWidgets = async (db, widgets) => {
  if (!widgets)
    return;
  const svc = new Services(db);
  const promises = [];
  for (let widget of widgets) {
    promises.push(GetRefreshPool.add(async () => {
      try { 
        await svc.refresh(widget); 
      }
      catch (err) { 
        const isFriendlyError = err instanceof FriendlyError;
        if (!isFriendlyError) {
          console.error(err);
        }
       }
    }));
  }
  return Promise.all(promises);
};

const cleanOldJobs = async (db) => {
  const oneMonthAgo = process.env.NODE_ENV === 'production' ? 
      DayJS().subtract(1, 'month').toDate() : DayJS().subtract(15, 'minutes').toDate();
  db.collection('Job').deleteMany({ startedOn: { $lt: oneMonthAgo } });
  // oldRunningJobs.deletedCount
}

const detectTimedOutJobs = async (db) => {
  const haltedAt = new Date();
  const fifteenMinutesAgo = process.env.NODE_ENV === 'production' ? 
    DayJS().subtract(15, 'minutes').toDate() : DayJS().subtract(15, 'seconds').toDate();
  const timedOutJobs = await db.collection('Job').updateMany({
    type: 'refresh', status: 'running', startedOn: { $lt: fifteenMinutesAgo }
  }, { $set: { status: 'timeout', haltedAt } });
  if (timedOutJobs.modifiedCount > 0) {
    console.error(`${timedOutJobs.modifiedCount} jobs timed out.`);
  }
}

const Service = async (req, res) => {
  const { db } = req;
  const job = await db.collection('Job').findOne({ type: 'refresh', status: 'running' }, { sort: { startedOn: -1 } });
  detectTimedOutJobs(db);
  if (job) {
    
    return res.status(503).json({ success: false, message: 'A job is already running.', job });
  }

  const startedOn = new Date();
  const newJob = await db.collection('Job').insertOne({ type: 'refresh', status: 'running', startedOn, finishedOn: null });
  const jobId = newJob.insertedId;
  const fifteenMinutesAgo = process.env.NODE_ENV === 'production' ? 
    DayJS().subtract(15, 'minutes').toDate() : DayJS().subtract(5, 'seconds').toDate();
  const widgets = await db.collection('Widget').find({
    refreshDaily: true, 
    enabled: true,
    $or: [ { refreshedOn: { $lt: fifteenMinutesAgo } }, { refreshedOn: { $exists: false } } ]
  }).toArray();

  if (widgets.length > 0) {
    await refreshWidgets(db, widgets);
  }
  const finishedOn = new Date();
  const elapsedMs = finishedOn.getTime() - startedOn.getTime();
  db.collection('Job').updateOne({ _id: ObjectID(jobId) }, { $set: { 
    status: 'finished',
    updates: widgets.length,
    finishedOn,
    elapsedMs
  }});

  cleanOldJobs(db);

  return res.status(200).json({ success: true, updates: widgets.length });
}

export default withMiddleware(Service);
