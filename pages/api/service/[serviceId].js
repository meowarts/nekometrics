const ObjectID = require('mongodb').ObjectID;

import withMiddleware from '~/libs/middleware';
import Services from '~/libs/services';
import { FriendlyError, ServiceNotAuthorizedError, ServiceDisconnectedError } from '~/libs/services/errors';

const isOkay = (req, res, service) => {
  if (!req.isAuth) {
    res.status(401).json({ success: false, message: 'You are not signed in.' });
    return false;
  }
  else if (!service) {
    res.status(404).json({ success: false, message: 'This service does not exist.' });
    return false;
  }
  else if (req.user._id.toString() !== service.userId.toString()) {
    res.status(401).json({ success: false, message: 'This service is not yours.' });
    return false;
  }
  return true;
}

const Service = async (req, res) => {
  const { serviceId } = req.query;
  const service = await req.db.collection('Service').findOne({ _id: ObjectID(serviceId) });

  if (!isOkay(req, res, service)) {
    return;
  }
  try {
    const db = req.db;
    if (req.method === 'GET' && service.service === 'google') {
      const svc = new Services(db);
      const newService = await svc.googleService.refreshService(service);
      return res.status(200).json({ success: true, service: newService });
    }
    else if (req.method === 'GET' && service.service === 'facebook') {
      const svc = new Services(db);
      const newService = await svc.facebookService.refreshService(service);
      return res.status(200).json({ success: true, service: newService });
    }
    else if (req.method === 'GET' && service.service === 'mailchimp') {
      const svc = new Services(db);
      const newService = await svc.mailchimpService.refreshService(service);
      return res.status(200).json({ success: true, service: newService });
    }
    else if (req.method === 'GET' && service.service === 'twitter') {
      const svc = new Services(db);
      const newService = await svc.twitterService.refreshService(service);
      return res.status(200).json({ success: true, service: newService });
    }
    else if (req.method === 'GET' && service.service === 'woocommerce') {
      const svc = new Services(db);
      const newService = await svc.wooCommerceService.refreshService(service);
      return res.status(200).json({ success: true, service: newService });
    }
    else if (req.method === 'GET' && service.service === 'edd') {
      const svc = new Services(db);
      const newService = await svc.eddService.refreshService(service);
      return res.status(200).json({ success: true, service: newService });
    }
    else if (req.method === 'DELETE') {
      await db.collection('Service').deleteOne({ '_id': ObjectID(serviceId) });
      return res.status(200).json({ success: true });
    }
    return res.status(404).json({ success: false, message: 'This method is not supported.' });
  }
  catch (err) {
    if (err instanceof FriendlyError) {
      return res.status(200).json({ success: false, message: err.message });
    }
    else if (err instanceof ServiceDisconnectedError) {
      return res.status(200).json({ success: false, message: err.message });
    }
    else if (err instanceof ServiceNotAuthorizedError) {
      await req.db.collection('Service').updateOne({ _id: ObjectID(serviceId) }, { $set: { 'status': 'not-authorized' } });
      return res.status(200).json({ success: false, message: err.message });
    }
    console.log(err);
    return res.status(500).json({ success: false, message: 'There was an error.' });
  }
}

export default withMiddleware(Service);
