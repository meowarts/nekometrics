const ObjectID = require('mongodb').ObjectID;

import withMiddleware from '~/libs/middleware';
import { getUserOnAccess, getWidgets, resetCacheForUser } from '~/libs/helpers-srv';

const getServiceLinks = async () => {
  return [
    {
      name: 'google',
      mode: 'oauth'
    }, {
      name: 'twitter',
      mode: 'oauth'
    }, {
      name: 'mailchimp',
      mode: 'oauth'
    }, {
      name: 'woocommerce',
      title: 'WooCommerce',
      mode: 'dialog'
    }, {
      name: 'edd',
      title: 'Easy Digital Downloads',
      mode: 'dialog'
    }, {
      name: 'facebook',
      mode: 'oauth'
    }
  ];
}

const getDashboards = async (db, user) => {
  // TODO: This is not optimized at all yet
  let dashboards = await db.collection('Dashboard').find({ 'userId': ObjectID(user._id) }).toArray();
  if (dashboards.length) {
    for (let dashboard of dashboards) {
      dashboard.widgets = await getWidgets({ db }, dashboard._id, dashboard);
    }
  }
  else {
    let dashboard = { 'userId': ObjectID(user._id), widgets: [], name: 'Dashboard' };
    const result = await db.collection('Dashboard').insertOne(dashboard);
    dashboard._id = result.insertedId;
    dashboards.push(dashboard);
  }
  return dashboards;
};

const getAccount = async (db, user) => {
  const settings = {};
  const services = await db.collection('Service').find({ userId: ObjectID(user._id) }).toArray();
  const serviceLinks = await getServiceLinks();
  const dashboards = await getDashboards(db, user);
  return { dashboards, services, serviceLinks, settings };
}

const Account = async (req, res) => {

  if (!req.isAuth) {
    return res.status(401).json({ success: false, message: 'You are not signed in.' });
  }
  const db = req.db;
  let user = req.user;

  if (req.method === 'GET') {
    const freshUser = getUserOnAccess(req, user._id);
    let account = await getAccount(db, user);
    delete freshUser.password;
    return res.status(200).json({ success: true, user: freshUser, ...account });
  }
  else if (req.method === 'PUT') {
    let { account } = req.json;
    if (!account) {
      return res.status(500).json({ success: false, message: 'The account is required.' });
    }

    await req.db.collection('User').updateOne({ _id: user._id }, { $set: { 
      lastName: account.lastName, 
      firstName: account.firstName,
      updatedOn: new Date()
    }});
    const freshUser = await resetCacheForUser(req, user._id);
    const freshAccount = await getAccount(db, freshUser);
    return res.status(200).json({ success: true, user: freshUser, ...freshAccount });
  }
  return res.status(500).json({ success: false, message: `This method (${req.method}) is not implemented.` });
}

export default withMiddleware(Account);
