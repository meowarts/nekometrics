const ObjectID = require('mongodb').ObjectID;
const CFG = require('~/config');
const DayJS = require('dayjs');

import { fetchIt } from '~/libs/helpers';
import { FriendlyError } from './errors';

let singleton = null;

class MailchimpService {

	db = null;
	clientId = CFG.services.mailchimp.client_id;
	clientSecret = CFG.services.mailchimp.client_secret;
	redirectUri = `${CFG.app.url}/oauth/mailchimp`;

	constructor(db) {
		if (!singleton) {
			singleton = this;
			this.db = db;
		}
		return singleton;
	}

	handleOauth = async (user, params) => {
		const { code } = params;
		if (!code) {
			throw new FriendlyError('The code has not been returned by Mailchimp.');
		}
		const body = `code=${code}&client_id=${this.clientId}&client_secret=${this.clientSecret}` +
			`&grant_type=authorization_code&redirect_uri=${this.redirectUri}`
		const data = await fetchIt('https://login.mailchimp.com/oauth2/token', {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			method: 'POST',
			body: body
		});
		const { access_token } = data;
		if (!access_token) {
			throw new FriendlyError('The access_token has not been returned by Mailchimp.'); 
		}
		const now = new Date();
		let service = { 
			userId: ObjectID(user._id),
			name: 'Mailchimp',
			service: 'mailchimp',
			data: {
				access_token: access_token, // This never expires.
			},
			createdOn: now,
			updatedOn: now
		}

		const mcInfo = await this.getUserAndAccounts(service);
		const listsCount = mcInfo.lists.length;
		service.name = `Mailchimp (${listsCount} lists)`;
		service.data.username = mcInfo.user.login.login_email;
		service.data.user_id = mcInfo.user.login.user_id;
		service.data.api_endpoint = mcInfo.user.api_endpoint;
		service.data.lists = mcInfo.lists.map(x => ({ id: x.id, name: x.name }));
		const sameServices = await this.db.collection('Service').find({ 'data.username': service.data.username, service: 'mailchimp' }).toArray();
		if (sameServices.some(x => x.userId.toString() === user._id.toString())) {
			throw new FriendlyError('A service has been already enabled between your Nekometrics account and your Mailchimp account.');
		}
		const res = await this.db.collection('Service').insertOne(service);
		service._id = res.insertedId;
		console.log(`[MC] Added Service for ${service.data.username} (${service._id})`);
		return service;
	}

	getUserAndAccounts = async (service) => {
		const { access_token } = service.data;
		const user = await fetchIt('https://login.mailchimp.com/oauth2/metadata', {
			headers: {  'Authorization': 'OAuth ' + access_token }
		});
		const apiEndpoint = user.api_endpoint;
		const lists = await fetchIt(`${apiEndpoint}/3.0/lists/`, {
			headers: {  'Authorization': 'OAuth ' + access_token }
		});
		return { user, lists: lists.lists };
	}

	getAuthUrl = async () => {
		let mailchimpAuthUrl = `https://login.mailchimp.com/oauth2/authorize?client_id=${this.clientId}&grant_type=authorization_code&response_type=code&redirect_uri=${this.redirectUri}`;
		return mailchimpAuthUrl;
	}

	refreshSubscribers = async (params) => {
		const { serviceId, listId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		if (!listId)
			throw new FriendlyError('A list has to be selected.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');
		const accessToken = service.data.access_token;
		if (!accessToken)
			throw new FriendlyError('The access_token for the selected service could not be found.');
		const endpoint = service.data.api_endpoint;
		if (!endpoint)
			throw new FriendlyError('The endpoint for the selected service could not be found.')

		const now = new Date();
		const today = DayJS().endOf('day').toDate();
		let data = await fetchIt(`${endpoint}/3.0/lists/${listId}`, {
			headers: { 'Authorization': 'OAuth ' + accessToken }
		});
		if (!data || !data.stats) {
			console.log('Mailchimp got no data', data);
			return;
		}
		const value = data.stats.member_count;
		const metric = await this.db.collection('Metric').findOne({ listId: params.listId, metric: 'members', date: today });
		if (metric && metric.value !== value) {
			console.log('[MC] Update', metric.value, '->', value);
			this.db.collection('Metric').updateOne({ '_id': ObjectID(metric._id) }, { $set: {  'value': value, 'updatedOn': now }});
		}
		else if (!metric) {
			console.log('[MC] New', value);
			let newMetric = {
				serviceId: ObjectID(service._id),
				listId: params.listId,
				date: today,
				metric: 'members',
				value: value,
				createdOn: now,
				updatedOn: now
			};
			await this.db.collection('Metric').insertOne(newMetric);
		}
	};

	getSubscribers = async (params) => {
		const { serviceId, listId, period } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		if (!listId)
			throw new FriendlyError('The list is required by Mailchimp.');
		if (!period)
			throw new FriendlyError('The period is required by Mailchimp.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');
		
		const toDate = DayJS().add(1, 'day').toDate();
		const fromDate = DayJS().subtract(params.period.length, params.period.unit).toDate();
		const dbMetrics = await this.db.collection('Metric').find({ 
			listId: listId,
			metric: 'members',
			date: { $gte: fromDate, $lte: toDate }
		}).sort({ date: 1 }).toArray();
		return dbMetrics.map(x => ({ _id: x._id, date: x.date, metric: x.metric, value: x.value }));
	}

	refreshService = async (service) => {
		const now = new Date();
		const { user, lists } = await this.getUserAndAccounts(service);
		const listsCount = lists.length;
		service.name = `Mailchimp (${listsCount} lists)`;
		service.data.username = user.login.login_email;
		service.data.user_id = user.login.user_id;
		service.data.api_endpoint = user.api_endpoint;
		service.data.lists = lists.map(x => ({ id: x.id, name: x.name }));
		service.updatedOn = now;
		this.db.collection('Service').updateOne({ _id: ObjectID(service._id) }, { 
			$set: { name: service.name, data: service.data, updatedOn: now } 
		});
		return service;
	}
}

export default MailchimpService;