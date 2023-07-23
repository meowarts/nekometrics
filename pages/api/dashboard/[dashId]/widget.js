const ObjectID = require('mongodb').ObjectID;

import { DAILY_REFRESH_WIDGETS } from '~/libs/constants';
import withMiddleware from '~/libs/middleware';

const isOkay = (res, req, dashboard) => {
  if (!req.isAuth) {
    res.status(401).json({ success: false, message: 'You are not signed in.' });
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
  return true;
}

const AddWidget = async (req, res) => {
  const now = new Date();
  const { dashId } = req.query;
  const { widget } = req.json;
  const dashboard = await req.db.collection('Dashboard').findOne({ _id: ObjectID(dashId) });

  if (!isOkay(res, req, dashboard)) {
    return;
  }
  try {
    if (req.method === 'POST') {
      // Duplicated and clean the data of the sent widget, then update it
      const db = req.db;
      widget.userId = req.user._id;
      widget.refreshDaily = DAILY_REFRESH_WIDGETS.includes(`${widget.service}-${widget.type}`);
      widget.updatedOn = now;
      widget.createdOn = now;
      widget.settings = {};
      const result = await db.collection('Widget').insertOne(widget);
      widget._id = result.insertedId;
      await db.collection('Dashboard').update( { _id: ObjectID(dashId) }, { $addToSet: { widgets: ObjectID(widget._id) } });
      return res.status(200).json({ success: true, widget });
    }
    return res.status(404).json({ success: true, message: 'This method is not supported.' });
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'There was an error.' });
  }
}

export default withMiddleware(AddWidget);
