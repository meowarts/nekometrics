const ObjectID = require('mongodb').ObjectID;

import { getUserOnAccess } from '~/libs/helpers-srv';
import withMiddleware from '~/libs/middleware';

const Service = async (req, res) => {
  const { db } = req;
  const job = await db.collection('Job').findOne({ type: 'users', status: 'running' });
  if (job)
    return res.status(503).json({ success: false, message: 'A job is already running.', job });
  const newJob = await db.collection('Job').insertOne({ type: 'users', status: 'running', startedOn: new Date(), finishedOn: null });
  const jobId = newJob.insertedId;

  const users = await db.collection('User').find().toArray();
  for (let user of users) {
    getUserOnAccess(req, user._id, true);
  }

  db.collection('Job').updateOne({ _id: ObjectID(jobId) }, { $set: { status: 'finished', finishedOn: new Date() } });
  return res.status(200).json({ success: true });
}

export default withMiddleware(Service);
