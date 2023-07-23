const ObjectID = require('mongodb').ObjectID;

import withMiddleware from '~/libs/middleware';
import Services from '~/libs/services';
import { FriendlyError, ServiceDisconnectedError, ServiceNotAuthorizedError } from '~/libs/services/errors';

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

const Metrics = async (req, res) => {
  const { widgetId } = req.query;
  const force = req?.json?.force;

  if (req.method === 'POST') {
    const widget = await req.db.collection('Widget').findOne({ _id: ObjectID(widgetId) });
    if (!isOkay(req, res, widget)) {
      return;
    }
    try {
      const svc = new Services(req.db);
      if (force) {
        await svc.refresh(widget);
      }
      const data = await svc.getMetrics(widget);
      // TODO: I don't really like this request only to get the RefreshedOn, maybe there is a better idea.
      const refreshedWidget = await req.db.collection('Widget').findOne({ _id: ObjectID(widgetId) });
      return res.status(200).json({ success: true, data, refreshedOn: refreshedWidget.refreshedOn });
    }
    catch (err) {
      if (err instanceof FriendlyError) {
        return res.status(200).json({ success: false, message: err.message });
      }
      else if (err instanceof ServiceDisconnectedError) {
        return res.status(200).json({ success: false, message: err.message });
      }
      else if (err instanceof ServiceNotAuthorizedError) {
        return res.status(200).json({ success: false, message: err.message });
      }
      return res.status(500).json({ success: false, message: 'There was an error.' });
    }
  }
  return res.status(404).json({ success: true, message: 'This method is not supported.' });
}

export default withMiddleware(Metrics);
