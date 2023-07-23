const ObjectID = require('mongodb').ObjectID;

import { getWidgets } from '~/libs/helpers-srv';
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
  else if (req.user.accountType !== 'admin' && req.user._id.toString() !== dashboard.userId.toString()) {
    res.status(401).json({ success: false, message: 'This dashboard is not yours.' });
    return false;
  }
  return true;
}

const Dashboard = async (req, res) => {
  const now = new Date();
  const { dashId } = req.query;
  const dashboard = await req.db.collection('Dashboard').findOne({ _id: ObjectID(dashId) });

  if (!isOkay(res, req, dashboard)) {
    return;
  }
  try {
    if (req.method === 'GET') {
      dashboard.widgets = await getWidgets(req, dashboard._id, dashboard);
      return res.status(200).json({ success: true, dashboard });
    }
    else if (req.method === 'POST') {
      const db = req.db;
      const { dashboard: updatedDashboard } = req.json;
      updatedDashboard.name = updatedDashboard.name.trim();
      await db.collection('Dashboard').update( { _id: ObjectID(dashId) }, { $set: { 
        name: updatedDashboard.name,
        settings: {
          backImageSrc: updatedDashboard?.settings?.backImageSrc ?? null
        },
        updatedOn: now
      }});
      dashboard.name = updatedDashboard.name;
      dashboard.settings = {
        backImageSrc: updatedDashboard?.settings?.backImageSrc ?? null
      };
      dashboard.updatedOn = now;
      dashboard.widgets = await getWidgets(req, dashboard._id, dashboard);
      return res.status(200).json({ success: true, dashboard });
    }
    else if (req.method === 'DELETE') {
      const db = req.db;
      await db.collection('Dashboard').deleteOne({ _id: ObjectID(dashId) });
      return res.status(200).json({ success: true });
    }
    return res.status(404).json({ success: true, message: 'This method is not supported.' });
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'There was an error.' });
  }
}

export default withMiddleware(Dashboard);
