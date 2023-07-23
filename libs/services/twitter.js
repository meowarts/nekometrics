const ObjectID = require('mongodb').ObjectID;
const CFG = require('~/config');
const DayJS = require('dayjs');
const Crypto = require('crypto');
const Oauth10a = require('oauth-1.0a');

import { FriendlyError } from './errors';

let singleton = null;

class TwitterService {

	db = null;
	clientId = CFG.services.twitter.client_id;
	clientSecret = CFG.services.twitter.client_secret;
	redirectUri = `${CFG.app.url}/oauth/twitter`;

	constructor(db) {
		if (!singleton) {
			singleton = this;
			this.db = db;
		}
		return singleton;
	}

	// Return Oauth Headers (usually for POST)
	buildOauthHeaders = (url, params, method = 'POST', token = null) => {
		const nonce = Crypto.randomBytes(16).toString('hex');
		let mainParams = {
			oauth_nonce: nonce,
			oauth_signature_method: 'HMAC-SHA1',
			oauth_consumer_key: this.clientId,
			oauth_timestamp: Math.floor(Date.now() / 1000),
			oauth_version: '1.0'
		};
		params = { ...mainParams, ...params };
		const shittyOauth = Oauth10a({
			consumer: { key: this.clientId, secret: this.clientSecret },
			signature_method: 'HMAC-SHA1',
			hash_function(str, key) { return Crypto.createHmac('sha1', key).update(str).digest('base64') }
		});
		const authorization = shittyOauth.authorize({ url, method: method, data: params }, token);
		const headers = shittyOauth.toHeader(authorization);
		return { headers, nonce };
	}

	handleOauth = async (user, params) => {
		const { oauth_token, oauth_verifier } = params;
		const url = 'https://api.twitter.com/oauth/access_token';
		const { headers } = this.buildOauthHeaders(url, { oauth_token, oauth_verifier }, 'POST');
		const resTwitter = await fetch(url, { headers: headers, method: 'POST' }).then(async (response) => {
			return await response.text();
		});
		const resParams = new URLSearchParams(resTwitter);
		const final_oauth_token = resParams.get('oauth_token');
		const final_oauth_token_secret = resParams.get('oauth_token_secret');
		if (!final_oauth_token || !final_oauth_token_secret) {
			throw new FriendlyError('The access_token has not been returned by Twitter.'); 
		}
		const now = new Date();
		let service = { 
			userId: ObjectID(user._id),
			name: 'Twitter',
			service: 'twitter',
			data: {
				oauth_token: final_oauth_token,
				oauth_token_secret: final_oauth_token_secret,
			},
			createdOn: now,
			updatedOn: now
		}

		const mcInfo = await this.getCredentials(service);
		service.name = `Twitter (${mcInfo.name})`;
		service.data.username = mcInfo.screen_name;
		service.data.user_id = mcInfo.id;
		const sameServices = await this.db.collection('Service').find({ 'data.user_id': service.data.user_id, service: 'twitter' }).toArray();
		if (sameServices.some(x => x.userId.toString() === user._id.toString())) {
			throw new FriendlyError('A service has been already enabled between your Nekometrics account and your Twitter account.');
		}
		const res = await this.db.collection('Service').insertOne(service);
		service._id = res.insertedId;
		console.log(`[TR] Added Service for ${service.data.username} (${service._id})`);
		return service;
	}

	getCredentials = async (service) => {
		const { oauth_token, oauth_token_secret } = service.data;
		const token = { key: oauth_token, secret: oauth_token_secret };
		const url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
		const { headers } = this.buildOauthHeaders(url, {}, 'GET', token);
		const json = await fetch(url, { headers }).then(async (response) => { return await response.json() });
		return json;
	}

	// https://developer.twitter.com/en/docs/authentication/oauth-1-0a/obtaining-user-access-tokens
	getAuthUrl = async () => {
		const url = 'https://api.twitter.com/oauth/request_token';
		const { headers } = this.buildOauthHeaders(url, { oauth_callback: this.redirectUri }, 'POST');
		const resTwitter = await fetch(url, { headers: headers, method: 'POST' }).then(async (response) => {
			return await response.text();
		});
		const resParams = new URLSearchParams(resTwitter);
		const oauth_token = resParams.get('oauth_token');
		let twitterAuthUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`;
		return twitterAuthUrl;
	}

	refreshFollowers = async (params) => {
		const { serviceId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');

		const now = new Date();
		const today = DayJS().endOf('day').toDate();

		const data = await this.getCredentials(service);
		if (!data) {
			throw new FriendlyError(`Twitter has no data for this serviceId (${serviceId}).`);
		}
		const value = data.followers_count;
		const metric = await this.db.collection('Metric').findOne({ userId: service.data.user_id, metric: 'followers', date: today });
		if (metric && metric.value !== value) {

			if (value === undefined || value === null ) {
				throw new FriendlyError(`There is no data coming from this serviceId (${serviceId}).`);
			}

			console.log('[TR] Update', metric.value, '->', value);
			this.db.collection('Metric').updateOne({ '_id': ObjectID(metric._id) }, { $set: {  'value': value, 'updatedOn': now }});
		}
		else if (!metric) {
			console.log('[TR] New', value);
			let newMetric = {
				userId: service.data.user_id,
				date: today,
				metric: 'followers',
				value: value,
				createdOn: now,
				updatedOn: now
			};
			await this.db.collection('Metric').insertOne(newMetric);
		}
	};

	getFollowers = async (params) => {
		const { serviceId, period } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		if (!period)
			throw new FriendlyError('The period is required by Twitter.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');
		
		const toDate = DayJS().add(1, 'day').toDate();
		const fromDate = DayJS().subtract(params.period.length, params.period.unit).toDate();
		const dbMetrics = await this.db.collection('Metric').find({ 
			userId: service.data.user_id,
			metric: 'followers',
			date: { $gte: fromDate, $lte: toDate }
		}).sort({ date: 1 }).toArray();
		return dbMetrics.map(x => ({ _id: x._id, date: x.date, metric: x.metric, value: x.value }));
	}

	refreshService = async (service) => {
		const now = new Date();
		const mcInfo = await this.getCredentials(service);
		service.name = `Twitter (${mcInfo.name})`;
		service.data.username = `${mcInfo.screen_name}`;
		service.data.user_id = mcInfo.id;
		service.updatedOn = now;
		this.db.collection('Service').updateOne({ _id: ObjectID(service._id) }, { 
			$set: { name: service.name, data: service.data, updatedOn: now } 
		});
		return service;
	}
}

export default TwitterService;