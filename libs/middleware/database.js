import { MongoClient } from 'mongodb';
const CFG = require('../../config');

const useDatabase = async (req) => {
  if (!global.client) {
    global.client = new MongoClient(CFG.db.url, { useNewUrlParser: true, poolSize: 10, useUnifiedTopology: true });
    await global.client.connect();
    console.log('Connected to DB.');
    global.db = global.client.db(CFG.db.database);

    // Remove tasks which seem to be stuck on running
    global.db.collection('Job').removeMany({ status: 'running' });

    // Update widgets which are still using old types
    global.db.collection('Widget').updateMany({ service: 'google', type: 'history-users' }, 
      { $set: { type: 'analytics-visits' } });
    global.db.collection('Widget').updateMany({ service: 'facebook', type: 'page-historical' }, 
      { $set: { type: 'page-likes' } });
    global.db.collection('Widget').updateMany({ service: 'facebook', type: 'ig-historical' }, 
      { $set: { type: 'ig-followers' } });
    global.db.collection('Widget').updateMany({ service: 'mailchimp', type: 'historical' }, 
      { $set: { type: 'subscribers' } });
    global.db.collection('Widget').updateMany({ service: 'edd', type: 'historical' }, 
      { $set: { type: 'earnings' } });
    global.db.collection('Widget').updateMany({ service: 'twitter', type: 'historical' }, 
      { $set: { type: 'followers' } });
    global.db.collection('Widget').updateMany({ service: 'woocommerce', type: 'historical' }, 
      { $set: { type: 'sales' } });
  }
  else if (!global.client.isConnected()) {
    await global.client.connect();
    console.log('Reconnected to DB.');
    global.db = global.client.db(CFG.db.database);
  }

  req.dbClient = global.client;
  req.db = global.db;
}

export default useDatabase;
