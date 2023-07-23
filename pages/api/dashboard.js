const ObjectID = require('mongodb').ObjectID;

import withMiddleware from '~/libs/middleware';
import { FriendlyError } from '~/libs/services/errors';

const isOkay = (req, res) => {
  if (!req.isAuth) {
    res.status(401).json({ success: false, message: 'You are not signed in.' });
    return false;
  }
  return true;
}

const Dashboard = async (req, res) => {

  if (!isOkay(req, res)) {
    return;
  }
  try {
    const userId = req.user._id;
    const db = req.db;
    const dashboard = req.json?.dashboard;
    if (req.method === 'POST') {
      let freshDashboard = { 'userId': ObjectID(userId), widgets: [], name: dashboard.name };
      const result = await db.collection('Dashboard').insertOne(freshDashboard);
      freshDashboard._id = result.insertedId;
      return res.status(200).json({ success: true, dashboard: freshDashboard });
    }
    return res.status(404).json({ success: true, message: 'This method is not supported.' });
  }
  catch (err) {
    if (err instanceof FriendlyError) {
      return res.status(200).json({ success: false, message: err.message });
    }
    if (err instanceof FriendlyError) {
      return res.status(200).json({ success: false, message: err.message });
    }
    console.log(err);
    return res.status(500).json({ success: false, message: 'There was an error.' });
  }
}

export default withMiddleware(Dashboard);
