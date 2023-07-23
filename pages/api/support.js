import { sendEmailToSupport } from '~/libs/mailer';
import withMiddleware from '~/libs/middleware';
import { FriendlyError } from '~/libs/services/errors';

const Support = async (req, res) => {
  try {
    const { email, name, subject, message } = req.json;
    if (req.method === 'POST') {
      const formattedMessage = message.replace(/(?:\r\n|\r|\n)/g, '<br>');
      await sendEmailToSupport(email, name, subject, formattedMessage);
      return res.status(200).json({ success: true });
    }
    return res.status(404).json({ success: false, message: 'This method is not supported.' });
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

export default withMiddleware(Support);
