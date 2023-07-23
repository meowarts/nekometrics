const ObjectID = require('mongodb').ObjectID;
const DayJS = require('dayjs');
const Url = require('url');

import { fetchIt } from '~/libs/helpers';
import { FriendlyError } from './errors';

let singleton = null;

const roundValue = (num) => {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}

class EDDService {

	db = null;

	constructor(db) {
		if (!singleton) {
			singleton = this;
			this.db = db;
		}
		return singleton;
	}

	// getService = async (user) => {
	// 	const service = user.services.find(x => x.service === 'edd');
	// 	if (!service) { 
	// 		throw new Error('Could not find service for Easy Digital Downloads.'); 
	// 	}
	// 	return service;
	// }

	createNew = async (user, params) => {
		const now = new Date();
		const endpoint = params.endpoint.replace(/\/+$/, "");
		const domain = Url.parse(endpoint).hostname;
		let service = { 
			userId: ObjectID(user._id),
			name: `Easy Digital Downloads (${domain})`,
			service: 'edd',
			data: {
				username: domain,
				endpoint: endpoint,
				token: params.token,
				key: params.key
			},
			createdOn: now,
			updatedOn: now
		}
		const res = await this.db.collection('Service').insertOne(service);
		service._id = res.insertedId;
		console.log(`[EDD] Added Service for ${service.data.username} (${service._id})`);
		return service;
	}

	refreshEarnings = async (params) => {
		const { serviceId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');

		const now = new Date();
		const oneWeekAgo = DayJS().endOf('day').subtract(8, 'day');
		const data = await fetchIt(service.data.endpoint + '/stats', {
			method: 'GET'
		}, {
			token: service.data.token,
			key: service.data.key,
			type: 'earnings',
			date: 'range',
			startdate: oneWeekAgo.format('YYYYMMDD'),
			enddate: DayJS().endOf('day').format('YYYYMMDD')
		});
		// Get the past week data from the DB
		const freshMetrics = Object.entries(data.earnings);
		const metrics = await this.db.collection('Metric').find({ serviceId: ObjectID(service._id), 
			metric: 'earnings', date: { $gte: oneWeekAgo.subtract(1, 'day').toDate() }}).toArray();
		for (let [date, value] of freshMetrics) {
			value = roundValue(value);
			date =  DayJS(date).endOf('day');
			//console.log('[EDD] Look for date', date.toDate(), 'from DB', metrics.length, 'in', freshMetrics.length);
			let dbMetric = metrics.find(x => DayJS(x.date).isSame(date));
			if (!dbMetric) {
				// The metric doesn't exist, let's create it.
				console.log('[EDD] New', date.format('YYYYMMDD'), value);
				let newMetric = { serviceId: ObjectID(service._id), date: date.toDate(),
					metric: 'earnings', value: value, createdOn: now, updatedOn: now
				};
				await this.db.collection('Metric').insertOne(newMetric);
			}
			else if (dbMetric && dbMetric.value !== value) {
				// The metric exists, but the value is different, let's update it.
				console.log('[EDD] Update', date.format('YYYYMMDD'), dbMetric.value, '->', value);
				await this.db.collection('Metric').updateOne({ '_id': ObjectID(dbMetric._id) }, { $set: {  'value': value, 'updatedOn': now }});
			}
		}
	}

	getEarnings = async (params) => {
		const { serviceId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');

		const fromDate = DayJS().subtract(params.period.length, params.period.unit).toDate();
		const dateTo = DayJS().add(1, 'day').startOf('day').toDate();
		const dbMetrics = await this.db.collection('Metric').find({ 
			serviceId: ObjectID(serviceId),
			metric: 'earnings',
			date: { $gt: fromDate, $lt: dateTo }
		}).sort({ date: 1 }).toArray();
		return dbMetrics.map(x => ({ _id: x._id, date: x.date, metric: x.metric, value: x.value }));
	}

	resetEarnings = async (params) => {
		const { serviceId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');

		const now = new Date();
		let data = await fetchIt(service.data.endpoint + '/stats', {
			method: 'GET'
		}, {
			token: service.data.token,
			key: service.data.key,
			type: 'earnings',
			date: 'range',
			startdate: '20160101',
			enddate: DayJS().endOf('day').format('YYYYMMDD')
		});
		await this.db.collection('Metric').deleteMany({ serviceId: ObjectID(service._id), metric: 'earnings' });
		let earnings = Object.entries(data.earnings);
		earnings = earnings.filter(([, value ]) => value !== 0);
		earnings = earnings.map(([ key, value ]) => ({ date: DayJS(key).endOf('day').toDate(), value: roundValue(value) }));
		let forDb = earnings.map(x => ({
			serviceId: ObjectID(service._id),
			date: x.date,
			metric: 'earnings',
			value: x.value,
			createdOn: now,
			updatedOn: now
		}));
		await this.db.collection('Metric').insertMany(forDb);
		return this.getEarnings(params);
	}

	refreshService = async (service) => {
		const now = new Date();
		let data = await fetchIt(service.data.endpoint + '/products', {
			method: 'GET'
		}, {
			token: service.data.token,
			key: service.data.key
		});
		const productsCount = data?.products ? data.products.length : 0;
		service.name = `Easy Digital Downloads (${productsCount} product${productsCount ? 's' : ''})`;
		service.updatedOn = now;
		this.db.collection('Service').updateOne({ _id: ObjectID(service._id) }, { 
			$set: { name: service.name, updatedOn: now } 
		});
		return service;
	}
}

export default EDDService;
