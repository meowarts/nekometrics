import withCache from './middleware/cache';
import withDatabase from './middleware/database';
import withAuth from './middleware/auth';
import withJson from './middleware/json';

const Manager = (handler) => async (req, res) => {
  await withCache(req, res);
  await withDatabase(req, res);
  await withAuth(req, res);
  await withJson(req, res);
  return handler(req, res);
}

export default Manager;
