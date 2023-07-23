import withMiddleware from '~/libs/middleware';
import Services from '~/libs/services';
import { FriendlyError } from '~/libs/services/errors';

const isOkay = (req, res) => {
  if (!req.isAuth) {
    res.status(401).json({ success: false, message: 'You are not signed in.' });
    return false;
  }
  return true;
}

const Service = async (req, res) => {
  const { service } = req.json;

  if (!isOkay(req, res)) {
    return;
  }
  try {
    const db = req.db;
    if (req.method === 'POST') {
      const svc = new Services(db);
      const newService = await svc.createNew(service, req.user, req.json);
      return res.status(200).json({ success: true, service: newService });
    }
    return res.status(404).json({ success: true, message: 'This method is not supported.' });
  }
  catch (err) {
    if (err instanceof FriendlyError) {
      return res.status(200).json({ success: false, message: err.message });
    }
    if (err instanceof FriendlyError) {
      return res.status(200).json({ success: false, message: err.message });
    }
    console.log(err);
    return res.status(500).json({ success: false, message: 'There was an error.' });
  }
}

export default withMiddleware(Service);
