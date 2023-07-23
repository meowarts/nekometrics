const ObjectID = require('mongodb').ObjectID;
const DayJS = require('dayjs');
const Url = require('url');
const WC_API = require('@woocommerce/woocommerce-rest-api').default;

import { FriendlyError } from './errors';

let singleton = null;

const roundValue = (num) => {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}

class WooCommerceService {

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
	// 		throw new Error('Could not find service for WooCommerce.'); 
	// 	}
	// 	return service;
	// }

	createNew = async (user, params) => {
		const now = new Date();
		const endpoint = params.endpoint.replace(/\/+$/, "");
		const domain = Url.parse(endpoint).hostname;
		let service = { 
			userId: ObjectID(user._id),
			name: `WooCommerce (${domain})`,
			service: 'woocommerce',
			data: {
				username: domain,
				endpoint: endpoint,
				secret: params.secret,
				key: params.key
			},
			createdOn: now,
			updatedOn: now
		}
		const res = await this.db.collection('Service').insertOne(service);
		service._id = res.insertedId;
		console.log(`[WC] Added Service for ${service.data.username} (${service._id})`);
		return service;
	}

	refreshSales = async (params) => {
		const { serviceId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');
		const now = new Date();

		// Get the past week data from the API
		const api = this.initApi(service);
		const oneWeekAgo = DayJS().endOf('day').subtract(8, 'day');
		const data = await this.fetchSales(api, oneWeekAgo, DayJS().endOf('day'));

		// Match with DB
		const metrics = await this.db.collection('Metric').find({ serviceId: ObjectID(service._id), 
			metric: 'earnings', date: { $gte: oneWeekAgo.subtract(1, 'day').toDate() }}).toArray();
		for (let entry of data) {
			let date =  DayJS(entry.date).endOf('day');
			//console.log('[WC] Look for date', date.toDate(), 'from DB', metrics.length, 'in', freshMetrics.length);
			let dbMetric = metrics.find(x => DayJS(x.date).isSame(date));
			if (!dbMetric) {
				// The metric doesn't exist, let's create it.
				console.log('[WC] New', date.format('YYYYMMDD'), entry.value, date.toDate());
				let newMetric = { serviceId: ObjectID(service._id), date: date.toDate(),
					metric: 'earnings', value: entry.value, createdOn: now, updatedOn: now
				};
				await this.db.collection('Metric').insertOne(newMetric);
			}
			else if (dbMetric && dbMetric.value !== entry.value) {
				// The metric exists, but the value is different, let's update it.
				console.log('[WC] Update', date.format('YYYYMMDD'), dbMetric.value, '->', entry.value);
				await this.db.collection('Metric').updateOne({ '_id': ObjectID(dbMetric._id) }, { $set: {  'value': entry.value, 'updatedOn': now }});
			}
		}
	}

	resetSales = async (params) => {
		const { serviceId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');
		const api = this.initApi(service);
		const oneMonthAgo = DayJS().endOf('day').subtract(1, 'month');
		const data = await this.fetchSales(api, oneMonthAgo, DayJS().endOf('day'));
		let forDb = [];
		const now = new Date();
		for (let entry of data) {
			forDb.push({
				serviceId: ObjectID(service._id),
				date: entry.date,
				metric: 'earnings',
				value: entry.value,
				createdOn: now,
				updatedOn: now
			});
		}
		await this.db.collection('Metric').deleteMany({ serviceId: ObjectID(service._id), metric: 'earnings' });
		await this.db.collection('Metric').insertMany(forDb);
		return this.getSales(params);
	}

	getSales = async (params) => {
		const { serviceId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');

		const fromDate = DayJS().subtract(params.period.length, params.period.unit).toDate();
		const dateTo = DayJS().add(1, 'day').startOf('day').toDate();
		const dbMetrics = await this.db.collection('Metric').find({ 
			serviceId: ObjectID(service._id),
			metric: 'earnings',
			date: { $gt: fromDate, $lt: dateTo }
		}).sort({ date: 1 }).toArray();
		return dbMetrics.map(x => ({ _id: x._id, date: x.date, metric: x.metric, value: x.value }));
	}

	/* API */

	initApi = (service) => {
		const api = new WC_API({
			url: service.data.endpoint.replace('wp-json', ''),
			consumerKey: service.data.key,
			consumerSecret: service.data.secret,
			version: "wc/v3"
		});
		return api;
	}

	fetchSales = async (api, from, to) => {
		let res = await api.get('reports/sales', { 
			date_min: from.format('YYYY-MM-DD'), 
			date_max: to.format('YYYY-MM-DD'),
		});
		const results = [];
		for (const [key, value] of Object.entries(res.data[0].totals)) {
			results.push({
				date: DayJS(key).endOf('day').toDate(),
				value: roundValue(parseFloat(value.sales)),
			});
		}
		return results;
	}

	refreshService = async (service) => {
		const now = new Date();
		const api = this.initApi(service);
		const res = await api.get('settings/general/woocommerce_store_city');
		const storeCity = res.data?.value ? res.data.value : 'Store city unknown';
		service.name = `WooCommerce (${storeCity})`;
		service.updatedOn = now;
		this.db.collection('Service').updateOne({ _id: ObjectID(service._id) }, { 
			$set: { name: service.name, updatedOn: now } 
		});
		return service;
	}
}

export default WooCommerceService;
