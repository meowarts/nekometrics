import withMiddleware from '~/libs/middleware';
import Services from '~/libs/services';
import { FriendlyError } from '~/libs/services/errors';

const HandleOauth = async (req, res) => {
  if (!req.isAuth) {
    return res.status(401).json({ success: false, message: 'You are not signed in.' });
  }

  try {
    const svc = new Services(req.db);
    const service = await svc.handleOauth(req.json.service, req.user, req.json);
    if (service) {
      return res.status(200).json({ success: true, service });
    }
  }
  catch (err) {
    if (err instanceof FriendlyError) {
      return res.status(200).json({ success: false, message: err.message });
    }
    console.log(err);
    return res.status(200).json({ success: false, message: 'Failed.' });
  }
}

export default withMiddleware(HandleOauth);
