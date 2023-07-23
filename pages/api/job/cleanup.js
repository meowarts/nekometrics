const ObjectID = require('mongodb').ObjectID;

import withMiddleware from '~/libs/middleware';
const debugMode = false;

const Service = async (req, res) => {
  const { db } = req;
  const job = await db.collection('Job').findOne({ type: 'cleanup', status: 'running' });
  if (job)
    return res.status(503).json({ success: false, message: 'A job is already running.', job });
  const newJob = await db.collection('Job').insertOne({ type: 'cleanup', status: 'running', startedOn: new Date(), finishedOn: null });
  const jobId = newJob.insertedId;
  let deleted = 0;

  // Cleanup useless dashboards
  const dashboards = await db.collection('Dashboard').find().toArray();
  for (let dashboard of dashboards) {
    const user = await db.collection('User').findOne({ _id: ObjectID(dashboard.userId) });
    if (!user) {
      for (let widgetId of dashboard.widgets) {
        const widget = await db.collection('Widget').findOne({ _id: ObjectID(widgetId) });
        if (widget) {
          if (!debugMode) {
            await db.collection('Widget').deleteOne({ _id: ObjectID(widget._id) });
          }
          console.log('Deleted widget', widget.name);
          deleted++;
        }
      }
      if (!debugMode) {
        await db.collection('Dashboard').deleteOne({ _id: ObjectID(dashboard._id) });
      }
      console.log('Deleted dashboard', dashboard.name);
      deleted++;
    }
  }

  // Cleanup useless services
  const services = await db.collection('Service').find().toArray();
  for (let service of services) {
    const user = await db.collection('User').findOne({ _id: ObjectID(service.userId) });
    if (!user) {
      if (!debugMode) {
        await db.collection('Service').deleteOne({ _id: ObjectID(service._id) });
      }
      console.log('Deleted service', service.name);
      deleted++;
    }
  }

  // // Cleanup useless widgets
  // const widgets = await db.collection('Widget').toArray();
  // for (let widget of widgets) {
  //   const user = await db.collection('Widget').findOne({ _id: ObjectID(widget.userId) });
  //   if (!user) {
  //     console.log('Should delete widget', widget.name);
  //   }
  // }

  // Cleanup useless data
  //const widgets = await db.collection('Widget').toArray();

  // Cleanup useless widgets

  db.collection('Job').updateOne({ _id: ObjectID(jobId) }, { $set: { status: 'finished', finishedOn: new Date(), deletions: deleted } });
  return res.status(200).json({ success: true, deletions: deleted });
}

export default withMiddleware(Service);
