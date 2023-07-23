const BCrypt = require('bcryptjs');
const UID = require('uid-safe');

import withMiddleware from '~/libs/middleware';

const SignIn = async (req, res) => {
  let email = req.json?.email;
  const password = req.json?.password;

  if (email && password) {
    email = email.toLowerCase();
    const user = await req.db.collection('User').findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User does not exist.' });
    }
    const match = await BCrypt.compare(password, user.password);
    if (match) {
      delete user.password;
      const token = UID.sync(18);
      await req.db.collection('Token').insertOne({ token: token, user: user, createdOn: new Date() });
      await req.cache.set(token, user);
      res.setHeader("Set-Cookie", "nekometrics_token=" + token + "; path=/; Expires=0");
      return res.status(200).json({ success: true, user });
    }
    else {
      return res.status(401).json({ success: false, message: 'Wrong password.' });
    }
  }
  return res.status(401).json({ success: false, message: 'Missing credentials.' });
}

export default withMiddleware(SignIn);
