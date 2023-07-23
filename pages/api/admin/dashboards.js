const ObjectID = require('mongodb').ObjectID;
import withMiddleware from '~/libs/middleware';

const isOkay = (req, res) => {
  if (!req.isAuth || req.user.accountType !== 'admin') {
    //res.status(401).json({ success: false, message: 'You are not signed in.' });
    res.redirect('/');
    return false;
  }
  return true;
}

const Dashboard = async (req, res) => {
  const { userId } = req.query;
  if (!isOkay(req, res)) {
    return;
  }
  try {
    const db = req.db;
    if (req.method === 'GET') {
      const dashboards = await db.collection('Dashboard').find({ userId: ObjectID(userId) }, { 
        projection: {
          name: 1, 
          widgets: 1
        } 
      }).toArray();
      return res.status(200).json({ success: true, dashboards });
    }
    return res.status(404).json({ success: true, message: 'This method is not supported.' });
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'There was an error.' });
  }
}

export default withMiddleware(Dashboard);
