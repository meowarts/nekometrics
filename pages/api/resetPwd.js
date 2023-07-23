const Generator = require('generate-password');
const BCrypt = require('bcryptjs');

import withMiddleware from '~/libs/middleware';
import { sendPasswordReset } from '~/libs/mailer';

const ResetPwd = async (req, res) => {
  let { email } = req.json;

  email = email.toLowerCase();
  const user = await req.db.collection('User').findOne({ email });
  if (!user) {
    return res.status(401).json({ success: false, message: 'User does not exist.' });
  }

  if (email) {
    const now = new Date();
    const password = Generator.generate({ length: 12, numbers: true });
    let salts = await BCrypt.genSalt(10);
    const cryptedPassword = await BCrypt.hash(password, salts);
    await req.db.collection('User').updateOne({ email: email }, { $set: { password: cryptedPassword, updatedOn: now } });
    sendPasswordReset(email, password);
    return res.status(200).json({ success: true, message: 'The password has been reset.' });
  }
  return res.status(200).json({ success: false, message: 'The new password is required.' });
}

export default withMiddleware(ResetPwd);
