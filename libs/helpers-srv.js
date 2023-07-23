const ObjectID = require('mongodb').ObjectID;
const DayJS = require('dayjs');

async function resetCacheForUser(req, userId) {
  const { db, cache } = req;
  const freshUser = await db.collection('User').findOne({ _id: userId });
  if (!freshUser) {
    console.error("resetCacheForUser: Could not find the user.");
    return;
  }
  await db.collection('Token').updateMany({ 'user._id': userId }, { $set: { user: freshUser } });
  let tokens = await db.collection('Token').find({ 'user._id': userId }, { token: 1 }).toArray();
  tokens = tokens.map(x => x.token);
  await cache.del(tokens);
  return freshUser;
}

function isCompedAccount(user) {
  return (user.accountType === 'friend' || user.accountType === 'admin');
}

async function getUserOnAccess(req, userId, serverSide = false) {
  const { db } = req;

  const now = new Date();
  let user = await db.collection('User').findOne({ _id: userId });
  let madeChanges = false;
  if (!user.accountType) {
    user.accountType = 'trial';
    await db.collection('User').updateOne({ _id: userId }, 
      { $set: { accountType: user.accountType, updatedOn: now }});
    madeChanges = true;
  }

  const isComped = isCompedAccount(user);

  // This is only for upgrade
  if (user.expireOn) {
    user.expiresOn = user.expireOn;
    await db.collection('User').updateOne({ _id: userId },
      { $set: { expiresOn: user.expiresOn, updatedOn: now }
    });
    await db.collection('User').updateOne({ _id: userId },
      { $unset: { expireOn: '', autoRefresh: '' }});
    madeChanges = true;
  }
  if (user.maxWidgets === undefined) {
    user.maxWidgets = 15;
    await db.collection('User').updateOne({ _id: userId }, 
      { $set: { maxWidgets: user.maxWidgets, updatedOn: now }});
    madeChanges = true;
  }
  if (user.isActive === undefined) {
    user.isActive = true;
    await db.collection('User').updateOne({ _id: userId }, 
      { $set: { isActive: user.isActive, updatedOn: now }});
    madeChanges = true;
  }
  if (user.isExpiring === undefined) {
    user.isExpiring = false;
    await db.collection('User').updateOne({ _id: userId }, 
      { $set: { isExpiring: user.isExpiring, updatedOn: now }});
    madeChanges = true;
  }

  if (!isComped && !user.expiresOn)  {
    user.expiresOn = DayJS(user.createdOn).add(1, 'month').toDate();
    await db.collection('User').updateOne({ _id: userId },
      { $set: { expiresOn: user.expiresOn, updatedOn: now }});
    madeChanges = true;
  }
  // 7 days left - set the account to Expiring, we should also send an email.
  // TODO: Send an email
  if (!isComped && !user.isExpiring && DayJS(user.expiresOn).diff(now, 'day') < 7) {
    console.log(`Account for ${user.email} is expiring.`);
    user.isExpiring = true;
    await db.collection('User').updateOne({ _id: userId },
      { $set: { isExpiring: user.isExpiring, updatedOn: now }});
    madeChanges = true;
  }
  // Account has expired.
  if (!isComped && user.isActive && DayJS(user.expiresOn).diff(now, 'day') < 0) {
    console.log(`Account for ${user.email} has expired.`);
    user.isActive = false;
    await db.collection('User').updateOne({ _id: userId },
      { $set: { isActive: user.isActive, updatedOn: now }});
    madeChanges = true;
  }
  if (madeChanges) {
    user = await resetCacheForUser(req, userId);
  }
  if (!serverSide) {
    delete user.password;
    db.collection('User').updateOne({ _id: user._id }, { $set: { accessedOn: now}});
  }
  return user;
}

// I think we can remove the async and await here
const getWidget = async (req, widgetId) => {
  const { db } = req;
  return await db.collection('Widget').findOne({ _id: ObjectID(widgetId) });
};

const getWidgets = async (req, dashboardId, dashboard = null) => {
  const { db } = req;
  dashboard = dashboard ? dashboard : await db.collection('Dashboard').findOne({ '_id': ObjectID(dashboardId) });
  let promises = dashboard.widgets.map(widgetId => getWidget(req, widgetId));
  dashboard.widgets = await Promise.all(promises);
  dashboard.widgets = dashboard.widgets.filter(x => x !== null);
  return dashboard.widgets;
}

export { resetCacheForUser, getWidget, getWidgets, getUserOnAccess, isCompedAccount };
