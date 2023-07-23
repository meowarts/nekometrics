import withMiddleware from '~/libs/middleware'

const Status = async (req, res) => {

  if (!req.isAuth) {
    return res.status(401).json({ success: false, message: 'You are not signed in.' });
  }

  return res.status(200).json({ success: true, user: req.user });
}

export default withMiddleware(Status);
