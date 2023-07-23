const ObjectID = require('mongodb').ObjectID;

import withMiddleware from '~/libs/middleware';

const isOkay = (req, res, widget, fromDashboard, toDashboard) => {
  if (!req.isAuth) {
    res.status(401).json({ success: false, message: 'You are not signed in.' });
    return false;
  }
  else if (!widget) {
    res.status(404).json({ success: false, message: 'This widget does not exist.' });
    return false;
  }
  else if (!fromDashboard) {
    res.status(404).json({ success: false, message: 'This fromDashboard does not exist.' });
    return false;
  }
  else if (!toDashboard) {
    res.status(404).json({ success: false, message: 'This toDashboard does not exist.' });
    return false;
  }
  else if (req.user._id.toString() !== widget.userId.toString()) {
    res.status(401).json({ success: false, message: 'This widget is not yours.' });
    return false;
  }
  else if (req.user._id.toString() !== fromDashboard.userId.toString()) {
    res.status(401).json({ success: false, message: 'This fromDashboard is not yours.' });
    return false;
  }
  else if (req.user._id.toString() !== toDashboard.userId.toString()) {
    res.status(401).json({ success: false, message: 'This toDashboard is not yours.' });
    return false;
  }
  return true;
}

const Widget = async (req, res) => {
  const now = new Date();
  const db = req.db;
  const { widgetId } = req.query;
  const { fromDashboardId, toDashboardId, x, y } = req.json;
  const storedWidget = await req.db.collection('Widget').findOne({ _id: ObjectID(widgetId) });
  const fromDashboard = await req.db.collection('Dashboard').findOne({ _id: ObjectID(fromDashboardId) });
  const toDashboard = await req.db.collection('Dashboard').findOne({ _id: ObjectID(toDashboardId) });

  if (!isOkay(req, res, storedWidget, fromDashboard, toDashboard)) {
    return;
  }
  try {
    if (req.method === 'POST') {
      await db.collection('Widget').updateOne({ '_id': ObjectID(widgetId) }, { $set: { x, y, updatedOn: now } });
      await db.collection('Dashboard').updateOne({ '_id': ObjectID(fromDashboardId) }, { 
        $pull: { 'widgets': ObjectID(widgetId) }, $set: { updatedOn: now } });
      await db.collection('Dashboard').updateOne( { '_id': ObjectID(toDashboardId) }, { 
        $addToSet: { 'widgets': ObjectID(widgetId) }, $set: { updatedOn: now } });
      return res.status(200).json({ success: true });
    }
    return res.status(404).json({ success: true, message: 'This method is not supported.' });
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'There was an error.' });
  }
}

export default withMiddleware(Widget);
