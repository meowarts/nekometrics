const ObjectID = require('mongodb').ObjectID;

import withMiddleware from '~/libs/middleware';

const isOkay = (req, res, dashboard, widget) => {
  if (!req.isAuth) {
    res.status(401).json({ success: false, message: 'You are not signed in.' });
    return false;
  }
  else if (!widget) {
    res.status(404).json({ success: false, message: 'This widget does not exist.' });
    return false;
  }
  else if (!dashboard) {
    res.status(404).json({ success: false, message: 'This dashboard does not exist.' });
    return false;
  }
  else if (req.user._id.toString() !== dashboard.userId.toString()) {
    res.status(401).json({ success: false, message: 'This dashboard is not yours.' });
    return false;
  }
  else if (req.user._id.toString() !== widget.userId.toString()) {
    res.status(401).json({ success: false, message: 'This widget is not yours.' });
    return false;
  }
  return true;
}

const Metrics = async (req, res) => {
  const { dashId, widgetId } = req.query;
  const dashboard = await req.db.collection('Dashboard').findOne({ _id: ObjectID(dashId) });
  const widget = await req.db.collection('Widget').findOne({ _id: ObjectID(widgetId) });

  if (!isOkay(req, res, dashboard, widget)) {
    return;
  }
  try {
    if (req.method === 'DELETE') {
      const db = req.db;
      await db.collection('Dashboard').updateOne({ '_id': ObjectID(dashId) }, { $pull: { 'widgets': ObjectID(widgetId) } });
      await db.collection('Widget').deleteOne({ '_id': ObjectID(widgetId) });
      return res.status(200).json({ success: true });
    }
    return res.status(404).json({ success: true, message: 'This method is not supported.' });
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'There was an error.' });
  }
}

export default withMiddleware(Metrics);
