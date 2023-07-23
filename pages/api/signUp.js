const Generator = require('generate-password');
const BCrypt = require('bcryptjs');
const DayJS = require('dayjs');

import withMiddleware from '~/libs/middleware';
import { sendWelcomeWithPassword } from '~/libs/mailer';

const SignUp = async (req, res) => {
  let { email, invitationCode } = req.json;
  let accountType = 'trial'; // 'admin', 'customer', 'friend'
  let freeMonths = 1;

  if (invitationCode === 'MEOW_METRICS_GO') {
    accountType = 'customer';
    freeMonths = 3;
  }
  else if (invitationCode === 'TEAM_MEOW_NAKAI') {
    accountType = 'friend';
    freeMonths = 720;
  }
  else {
    return res.status(200).json({ success: false, message: 'You need a valid invitation code to create an account on Nekometrics.' });
  }

  if (email) {
    email = email.toLowerCase();
    if (await req.db.collection('User').find({ email }).count()) {
      return res.status(200).json({ success: false, message: 'There is already an account for this email.' });
    }
    const now = new Date();
    const password = Generator.generate({ length: 12, numbers: true });
    const salts = BCrypt.genSaltSync(10);
    const crypted = BCrypt.hashSync(password, salts);
    const expiresOn = DayJS().add(freeMonths, 'month').toDate()
    const isActive = true;
    const isExpiring = false;
    let maxWidgets = 15;

    const user = { email, password: crypted, accountType, isExpiring, isActive, invitationCode, maxWidgets, expiresOn, createdOn: now, updatedOn: now };
    let result = await req.db.collection('User').insertOne(user);
    user._id = result.insertedId;
    sendWelcomeWithPassword(email, password);
    return res.status(200).json({ success: true, message: 'The account was created and an email was sent.' });
  }
  return res.status(200).json({ success: false, message: 'An email is required.' });
}

export default withMiddleware(SignUp);
