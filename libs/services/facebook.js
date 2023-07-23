const ObjectID = require('mongodb').ObjectID;
const DayJS = require('dayjs');
const CFG = require('~/config');

import { ServiceDisconnectedError, FriendlyError, ServiceNotAuthorizedError } from './errors';
import { fetchIt } from '~/libs/helpers';
import { script_v1 } from 'googleapis';

let singleton = null;

// Facebook API
// https://developers.facebook.com/docs/graph-api/changelog/

class FacebookService {

	db = null;
	clientId = CFG.services.facebook.client_id;
	clientSecret = CFG.services.facebook.client_secret;
	fbApiUrl = 'https://graph.facebook.com/v6.0';
	redirectUri = `${CFG.app.url}/oauth/facebook`;

	constructor(db) {
		if (!singleton) {
			singleton = this;
			this.db = db;
		}
		return singleton;
	}

	/*
		FACEBOOK: page-likes
	*/

	// https://developers.facebook.com/docs/instagram-api/reference/user/insights/
	fetchPageLikesForPeriod = async (service, pageToken, pageId, fromDate, toDate) => {
		let days = DayJS(toDate).diff(DayJS(fromDate), 'days');
		if (days > 90) {
			fromDate = DayJS(toDate).subtract(91, 'day'); // Facebook limits the requests to a range of 90 days
		}
		let since = DayJS(fromDate).format('YYYY-MM-DD');
		let until = DayJS(toDate).format('YYYY-MM-DD');

		const res = await this.fetchItForFacebook(service, 
			`${this.fbApiUrl}/${pageId}/insights`, {}, {
				access_token: pageToken,
				metric: ['page_fans'], // page_impressions
				since,
				until
			}
		);
		if (!res) {
			throw new FriendlyError(`Facebook (PageLikesCount) has no data for this pageId (${pageId}).`);
		}
		const page_fans = res.data.find(x => x.name === 'page_fans');
		if (!page_fans?.values) {
			return [];
		}
		return page_fans.values.map(x => ({ date: DayJS(x.end_time).endOf('day').toDate(), metric: 'likes', value: x.value }));
	};

	fetchPageLikesCurrent = async (service, pageToken, pageId) => {
		const res = await this.fetchItForFacebook(service, 
			`${this.fbApiUrl}/${pageId}`, {}, {
				access_token: pageToken,
				fields: ['fan_count']
			}
		);
		if (!res) {
			throw new FriendlyError(`Facebook (fetchPageLikesCurrent) has no data for this pageId (${pageId}).`);
		}
		return res?.fan_count;
	};

	getPageLikes = async (params, isReset = false) => {
		const { accountId, serviceId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		if (!accountId)
			throw new FriendlyError('A Facebook page has to be selected.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');

		const fromDate = DayJS().subtract(params.period.length, params.period.unit).toDate();
		const dateTo = DayJS().add(1, 'day').startOf('day').toDate();
		let dbMetrics = await this.db.collection('Metric').find({ 
			serviceId: ObjectID(serviceId),
			accountId: accountId,
			metric: 'page-likes',
			date: { $gt: fromDate, $lt: dateTo }
		}).sort({ date: 1 }).toArray();

		// If there is nothing, let's try to get the latest data
		if (!dbMetrics.length && !isReset) {
			dbMetrics = await this.resetPageLikes(params);
		}

		return dbMetrics.map(x => ({ _id: x._id, date: x.date, metric: x.metric, value: x.value }));
	}

	resetPageLikes = async (params) => {
		const { accountId, serviceId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		if (!accountId)
			throw new FriendlyError('A Facebook page has to be selected.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The data source does not exist anymore.');
		const account = service.data.accounts.find(x => x.id.toString() === accountId.toString());
		const pageToken = account.access_token;
		if (!pageToken)
			throw new FriendlyError('The pageToken for the selected account could not be found.');

		const now = new Date();
		await this.db.collection('Metric').deleteMany({ serviceId: service._id, accountId, metric: 'page-likes' });
		let fromDate = DayJS().subtract(90, 'day');
		let dateTo = DayJS().add(1, 'day');
		let maxLoops = 12; // 3 years (but seems limited to 2 years)
		let data = [];
		let hasMoreData = true;
		while (maxLoops-- && hasMoreData) {
			const freshData = await this.fetchPageLikesForPeriod(service, pageToken, accountId, fromDate.toDate(), dateTo.toDate());
			fromDate = fromDate.subtract(90, 'day');
			dateTo = dateTo.subtract(90, 'day');
			if (freshData.length > 0) {
				data = [...freshData, ...data];
			}
			hasMoreData = freshData.length >= 90;
		}

		const forDb = data.map(x => ({
			serviceId: service._id,
			accountId: accountId,
			date: x.date,
			metric: 'page-likes',
			value: x.value,
			createdOn: now,
			updatedOn: now
		}));
		await this.db.collection('Metric').insertMany(forDb);
		return this.getPageLikes(params, true);
	};

	refreshPageLikes = async (params) => {
		const { accountId, serviceId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		if (!accountId)
			throw new FriendlyError('A Facebook page has to be selected.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');	
		const account = service.data.accounts.find(x => x.id === accountId);
		if (!account)
			throw new FriendlyError('The account it was linked to does not exist anymore.');	
		const pageToken = account.access_token;
		if (!pageToken)
			throw new FriendlyError('The pageToken for the selected account could not be found.');	

		const now = new Date();
		const today = DayJS().endOf('day').toDate();
		const value = await this.fetchPageLikesCurrent(service, pageToken, accountId);
		const metric = await this.db.collection('Metric').findOne({
			serviceId: ObjectID(serviceId),
			accountId: accountId,
			metric: 'page-likes',
			date: today
		});
		if (metric && metric.value !== value) {
			console.log('[FB] Update', metric.value, '->', value);
			this.db.collection('Metric').updateOne({ '_id': ObjectID(metric._id) }, { $set: {  'value': value, 'updatedOn': now }});
		}
		else if (!metric) {
			console.log('[FB] New', value);
			let newMetric = {
				serviceId: ObjectID(serviceId),
				accountId: accountId,
				date: today,
				metric: 'page-likes',
				value: value,
				createdOn: now,
				updatedOn: now
			};
			const res = await this.db.collection('Metric').insertOne(newMetric);
			newMetric._id = res.insertedId;
			return newMetric;
		}
	};

	/*
		INSTAGRAM: ig-followers
	*/

	getIgFollowers = async (params) => {
		const { period, accountId, igBusinessId, serviceId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		if (!igBusinessId)
			throw new FriendlyError('A Instagram account has to be selected.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The data source does not exist anymore.');

		const dateTo = DayJS().add(1, 'day').toDate();
		const fromDate = DayJS().subtract(period.length, period.unit).toDate();
		let dbMetrics = await this.db.collection('Metric').find({ 
			serviceId: ObjectID(serviceId),
			igBusinessId: igBusinessId,
			metric: 'followers',
			date: { $gte: fromDate, $lte: dateTo }
		}).sort({ date: 1 }).toArray();
		
		// If there is nothing, let's try to get the latest data
		if (!dbMetrics.length) {
			dbMetrics = await this.refreshIgFollowers({ accountId, serviceId, igBusinessId });
			dbMetrics = dbMetrics ? [dbMetrics] : [];
		}

		return dbMetrics.map(x => ({ _id: x._id, date: x.date, metric: x.metric, value: x.value }));
	};

	getIgFollowersCount = async (service, pageToken, igBusinessId) => {
		let data = await this.fetchItForFacebook(service, `${this.fbApiUrl}/${igBusinessId}`, {}, {
			access_token: pageToken,
			fields: [ 'followers_count' ] // follows_count, media_count
		});
		if (!data) {
			throw new FriendlyError(`Facebook (IgFollowersCount) has no data for this igBusinessId (${igBusinessId}).`);
		}
		return data.followers_count;
	};

	refreshIgFollowers = async (params) => {
		const { accountId, igBusinessId, serviceId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		if (!igBusinessId)
			throw new FriendlyError('A Instagram account has to be selected.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');	
		const account = service.data.accounts.find(x => x.id === accountId);
		if (!account)
			throw new FriendlyError('The account it was linked to does not exist anymore.');	
		const pageToken = account.access_token;
		if (!pageToken)
			throw new FriendlyError('The pageToken for the selected account could not be found.');	

		const now = new Date();
		const today = DayJS().endOf('day').toDate();
		const value = await this.getIgFollowersCount(service, pageToken, igBusinessId);
		const metric = await this.db.collection('Metric').findOne({
			serviceId: ObjectID(serviceId),
			igBusinessId: igBusinessId,
			metric: 'followers',
			date: today
		});
		if (metric && metric.value !== value) {
			console.log('[IG] Update', metric.value, '->', value);
			this.db.collection('Metric').updateOne({ '_id': ObjectID(metric._id) }, { $set: {  'value': value, 'updatedOn': now }});
		}
		else if (!metric) {
			console.log('[IG] New', value);
			let newMetric = {
				serviceId: ObjectID(serviceId),
				igBusinessId: igBusinessId,
				date: today,
				metric: 'followers',
				value: value,
				createdOn: now,
				updatedOn: now
			};
			const res = await this.db.collection('Metric').insertOne(newMetric);
			newMetric._id = res.insertedId;
			return newMetric;
		}
	};

	/*
		FACEBOOK: ??
	*/

	// getAdsMetrics = async (params) => {
	// 	const { period, adsAccountId, serviceId } = params;
	// 	if (!serviceId)
	// 		throw new FriendlyError('Not linked to a data source yet.');
	// 	if (!adsAccountId)
	// 		throw new FriendlyError('A Ads Account has to be selected.');
	// 	const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
	// 	if (!service)
	// 		throw new FriendlyError('The service it was linked to does not exist anymore.');

	// 	const fromDate = DayJS().subtract(period.length, period.unit).toDate();
	// 	const dateTo = DayJS().add(1, 'day').toDate();
	// 	let since = DayJS(fromDate).format('YYYY-MM-DD');
	// 	let until = DayJS(dateTo).format('YYYY-MM-DD');
	// 	let dbMetrics = [];
	// 	const pageToken = await this.getPageToken(service);
	// 	let data = await this.fetchItForFacebook(`${this.fbApiUrl}/${adsAccountId}/insights`, {}, {
	// 		access_token: pageToken,
	// 		fields: [ 'spend', 'ctr' ], // SPEND BY DAY AND CTR (percentage of times people saw your ad and performed a click)
	// 		time_increment: 1,
	// 		time_range: { since, until }
	// 	});
	// 	dbMetrics = data.data.map(x => ({ date: x.date_start, metric: 'spend', value: x.spend }));
	// 	while (data.paging.next) {
	// 		data = await this.fetchItForFacebook(data.paging.next, {}, null);
	// 		dbMetrics = dbMetrics.concat(data.data.map(x => ({ date: x.date_start, metric: 'spend', value: x.spend })));
	// 	}
	// 	return dbMetrics.map(x => ({ _id: x._id, date: new Date(x.date), metric: x.metric, value: x.value }));
	// };

	getUserAndPages = async (service) => {
		const { access_token } = service.data;
		let data = await this.fetchItForFacebook(service, `${this.fbApiUrl}/me`, {}, {
			access_token: access_token
			//fields: [ 'id', 'name' ]
		});
		if (!data) {
			console.error('[Facebook] Could not get /me data for this service.', { service, data });
			throw new Error("[Facebook] Could not get /me data for this service.");
		}
		const { id: userid, name: username } = data;
		// Get accounts (pages)
		data = await this.fetchItForFacebook(service, `${this.fbApiUrl}/me/accounts`, {}, {
			access_token: access_token
		});
		const accounts = data.data.map(x => ({ id: x.id, name: x.name, access_token: x.access_token }));
		// Page AccessToken has no expiry
		for (let account of accounts) {
			data = await this.fetchItForFacebook(service, `${this.fbApiUrl}/${account.id}`, {}, {
				access_token: access_token,
				fields: 'instagram_business_account'
			});
			//console.log('getUserAndPages - Account Data', { username, data });
			if (data?.instagram_business_account?.id) {
				const instagramId = data.instagram_business_account.id;
				data = await this.fetchItForFacebook(service, `${this.fbApiUrl}/${instagramId}`, {}, {
					access_token: access_token,
					fields: ['username'] // 'followers_count', 'follows_count', 'media_count', 
				});
				account.instagram = {
					user_id: instagramId,
					user_name: data.username
				};
			}
		}
		console.log('[Facebook] getUserAndPages - Username', { username });
		return { userid, username, accounts };
	}

	refreshService = async (service) => {
		console.log('[FB] Refresh Service');
		const now = new Date();
		const { userid, username, accounts } = await this.getUserAndPages(service);
		const pagesCount = accounts ? accounts.length : 0;
		const igCount = pagesCount ? accounts.filter(x => !!x.instagram).length : 0;
		service.name = `Facebook (${pagesCount} page${pagesCount ? 's' : ''}, ${igCount} instagram profile${igCount ? 's' : ''})`;
		service.data.userid = userid;
		service.data.username = username;
		service.data.accounts = accounts;
		service.updatedOn = now;
		this.db.collection('Service').updateOne({ _id: ObjectID(service._id) }, { 
			$set: { name: service.name, data: service.data, updatedOn: now } 
		});
		return service;
	}

	// CORE: Helpers, Auth, etc.

	fetchItForFacebook = async (service, path, fetchOpts = {}, params = null) => {
		const reply = await fetchIt(path, fetchOpts, params);

		// TODO: WE SHOULD DO THE PAGING HERE
		// dbMetrics = data.data.map(x => ({ date: x.date_start, metric: 'spend', value: x.spend }));
		// while (data.paging.next) {
		// 	data = await this.fetchItForFacebook(data.paging.next, {}, null);
		// 	dbMetrics = dbMetrics.concat(data.data.map(x => ({ date: x.date_start, metric: 'spend', value: x.spend })));
		// }

		if (reply.error) {
			if (reply.error.code === 190 && reply.error.error_subcode === 458) {
				console.error('Error 458 with Facebook: App not Authorized!', { path, params, error: reply.error });
				await this.db.collection('Service').updateOne({ _id: service._id }, { $set: { 'status': 'not-authorized' } });
				throw new ServiceNotAuthorizedError();
			}
			else if (reply.error.code === 190 && reply.error.error_subcode === 460) {
				console.error('Error 460 with Facebook: Disconnected!', { path, params, error: reply.error });
				await this.db.collection('Service').updateOne({ _id: service._id }, { $set: { 'status': 'disconnected' } });
				throw new ServiceDisconnectedError();
			}
			else {
				console.error('Unhandled error with FetchIt Facebook', { path, params, error: reply.error });
			}
			return null;
		}
		return reply;
	}

	getAuthUrl = async () => {
		return encodeURI(`${this.fbApiUrl}/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=instagram_basic,pages_show_list,read_insights,public_profile,pages_read_engagement,pages_show_list`);
	}

	handleOauth = async (user, params) => {
		const { code } = params;
		if (!code) {
			throw new FriendlyError('The code has not been returned by Facebook.');
		}
		const firstReq = await fetchIt(`${this.fbApiUrl}/oauth/access_token`, {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			method: 'POST',
			body: `code=${code}&client_id=${this.clientId}&client_secret=${this.clientSecret}&redirect_uri=${this.redirectUri}`
		});
		const { access_token: exchange_token } = firstReq;
		const secondReq = await fetchIt(`${this.fbApiUrl}/oauth/access_token`, {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			method: 'POST',
			body: `code=${code}&client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=fb_exchange_token&fb_exchange_token=${exchange_token}&redirect_uri=${this.redirectUri}`
		});
		const { access_token } = secondReq;
		const now = new Date();
		if (!access_token) {
			throw new FriendlyError('The access_token has not been returned by Facebook.'); 
		}
		const service = { 
			userId: ObjectID(user._id),
			name: 'Facebook',
			service: 'facebook',
			data: {
				access_token: access_token,
				expires_at: DayJS().add(60, 'days').toDate(),
			},
			createdOn: now,
			updatedOn: now
		}
		const { userid, username, accounts } = await this.getUserAndPages(service);
		const sameServices = await this.db.collection('Service').find({ 'data.username': username, service: 'facebook' }).toArray();
		if (sameServices.some(x => x.userId.toString() === user._id.toString())) {
			let svc = sameServices.find(x => x.userId.toString() === user._id.toString());
			await this.db.collection('Service').updateOne({ _id: svc._id }, { $set: { data: {
				access_token: access_token,
				expires_at: DayJS().add(60, 'days').toDate(),
			} }});
			throw new FriendlyError('A service has been already enabled between your Nekometrics account and your Facebook account. The token has been refreshed (' + access_token + ').');
		}
		const pagesCount = accounts ? accounts.length : 0;
		const igCount = pagesCount ? accounts.filter(x => !!x.instagram).length : 0;
		service.name = `Facebook (${pagesCount} page${pagesCount ? 's' : ''}, ${igCount} instagram profile${igCount ? 's' : ''})`;
		service.data.userid = userid;
		service.data.username = username;
		service.data.accounts = accounts;
		const res = await this.db.collection('Service').insertOne(service);
		service._id = res.insertedId;
		console.log(`[FB] Added Service for ${service.data.username} (${service._id})`);
		return service;
	}
}

export default FacebookService;