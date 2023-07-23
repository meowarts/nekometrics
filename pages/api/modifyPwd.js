const BCrypt = require('bcryptjs');

import withMiddleware from '~/libs/middleware';

const ModifyPwd = async (req, res) => {
  const { password } = req.json;
  
  if (!req.isAuth) {
    return res.status(401).json({ success: false, message: 'You are not signed in.' });
  }

  if (password) {
    const now = new Date();
    let salts = await BCrypt.genSalt(10);
    const cryptedPassword = await BCrypt.hash(password, salts);
    await req.db.collection('User').updateOne({ email: req.user.email }, { $set: { password: cryptedPassword, updatedOn: now } });
    return res.status(200).json({ success: true, message: 'The password has been updated.' });
  }
  return res.status(200).json({ success: false, message: 'The new password is required.' });
}

export default withMiddleware(ModifyPwd);
