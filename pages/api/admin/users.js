import DayJS from 'dayjs';
import { isCompedAccount } from '~/libs/helpers-srv';
import withMiddleware from '~/libs/middleware';

const isOkay = (req, res) => {
  if (!req.isAuth || req.user.accountType !== 'admin') {
    //res.status(401).json({ success: false, message: 'You are not signed in.' });
    res.redirect('/');
    return false;
  }
  return true;
}

const Users = async (req, res) => {
  if (!isOkay(req, res)) {
    return;
  }
  try {
    const now = new Date();
    const db = req.db;
    if (req.method === 'GET') {
      const users = await db.collection('User').find({}, { 
        projection: { 
          email: 1,
          isActive: 1,
          isExpiring: 1,
          invitationCode: 1,
          accountType: 1,
          maxWidgets: 1,
          createdOn: 1,
          updatedOn: 1, 
          expiresOn: 1,
          accessedOn: 1
        } 
      }).toArray();
      for (let user of users) {
        const isComped = isCompedAccount(user);
        user.daysLeft = (!isComped && !user.isExpiring) ? DayJS(user.expiresOn).diff(now, 'day') : null;
      }
      return res.status(200).json({ success: true, users });
    }
    return res.status(404).json({ success: true, message: 'This method is not supported.' });
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'There was an error.' });
  }
}

export default withMiddleware(Users);
