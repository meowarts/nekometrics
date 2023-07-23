const ObjectID = require('mongodb').ObjectID;

import { getWidget } from '~/libs/helpers-srv';
import withMiddleware from '~/libs/middleware';

const isOkay = (req, res, widget) => {
  if (!req.isAuth) {
    res.status(401).json({ success: false, message: 'You are not signed in.' });
    return false;
  }
  else if (!widget) {
    res.status(404).json({ success: false, message: 'This widget does not exist.' });
    return false;
  }
  else if (req.user.accountType !== 'admin' && req.user._id.toString() !== widget.userId.toString()) {
    res.status(401).json({ success: false, message: 'This widget is not yours.' });
    return false;
  }
  return true;
}

const Widget = async (req, res) => {
  const now = new Date();
  const { widgetId } = req.query;
  const { db } = req;
  const storedWidget = await req.db.collection('Widget').findOne({ _id: ObjectID(widgetId) });

  if (!isOkay(req, res, storedWidget)) {
    return;
  }
  try {
    if (req.method === 'GET') {
      const widget = await getWidget(req, widgetId);
      return res.status(200).json({ success: true, widget });
    }
    if (req.method === 'PUT') {
      // Duplicated and clean the data of the sent widget, then update it
      const { widget } = req.json;
      let updatedWidget = { ...widget, enabled: true };
      delete updatedWidget._id;
      delete updatedWidget.userId;
      delete updatedWidget.service;
      delete updatedWidget.type;
      delete updatedWidget.refreshDaily;
      delete updatedWidget.createdOn;
      delete updatedWidget.refreshedOn;
      updatedWidget.updatedOn = now;
      await db.collection('Widget').updateOne({ '_id': ObjectID(widgetId) }, { $set: updatedWidget });
      return res.status(200).json({ success: true, widget: { ...widget, updatedOn: now } });
    }
    return res.status(404).json({ success: true, message: 'This method is not supported.' });
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'There was an error.' });
  }
}

export default withMiddleware(Widget);
