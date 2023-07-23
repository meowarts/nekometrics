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
  const { service } = req.query;

  if (!isOkay(req, res)) {
    return;
  }

  try {
    let url = null;
    let srv = new Services(req.db);
    if (service === 'google') {
      url = await srv.googleService.getAuthUrl();
    }
    else if (service === 'facebook') {
      url = await srv.facebookService.getAuthUrl();
    }
    else if (service === 'mailchimp') {
      url = await srv.mailchimpService.getAuthUrl();
    }
    else if (service === 'twitter') {
      url = await srv.twitterService.getAuthUrl();
    }
    else {
      res.status(401).json({ success: false, message: 'This service does not exist on Nekometrics.' });
      return false;
    }
    //console.log('Redirect to ' + url);
    res.writeHead(302, { Location: url }).end();
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
