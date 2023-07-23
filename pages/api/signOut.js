import withMiddleware from '~/libs/middleware';

const SignOut = async (req, res) => {
  const token = req.cookies['nekometrics_token'];
  if (token) {
    await req.db.collection('Token').deleteOne({ token: token });
    await req.cache.del(token);
  }
  res.setHeader("Set-Cookie", "nekometrics_token=expired; path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  return res.status(200).json({ success: true, message: 'See you soon, my friend.' });
}

export default withMiddleware(SignOut);
