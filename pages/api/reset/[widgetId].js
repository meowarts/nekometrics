const ObjectID = require('mongodb').ObjectID;

import withMiddleware from '~/libs/middleware';
import Services from '~/libs/services';
import { FriendlyError, ServiceDisconnectedError, ServiceNotAuthorizedError } from '~/libs/services/errors';

const isOkay = (res, req, widget) => {
  if (!req.isAuth) {
    res.status(401).json({ success: false, message: 'You are not signed in.' });
    return false;
  }
  else if (!widget) {
    res.status(404).json({ success: false, message: 'This widget does not exist.' });
    return false;
  }
  else if (req.user._id.toString() !== widget.userId.toString()) {
    res.status(401).json({ success: false, message: 'This widget is not yours.' });
    return false;
  }
  return true;
}

const ResetMetrics = async (req, res) => {
  const { widgetId } = req.query;

  const widget = await req.db.collection('Widget').findOne({ _id: ObjectID(widgetId) });
  if (!isOkay(res, req, widget)) {
    return;
  }
  try {
    const svc = new Services(req.db);
    const data = await svc.resetMetrics(widget);
    return res.status(200).json({ success: true, data });
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
    else if (err.name === 'AbortError') {
      return res.status(200).json({ success: false, message: 'Timeout!' });
    }
    console.log(err);
    return res.status(500).json({ success: false, message: 'There was an error.' });
  }
}

export default withMiddleware(ResetMetrics);
