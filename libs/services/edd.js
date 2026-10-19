const ObjectID = require('mongodb').ObjectID;
const DayJS = require('dayjs');
const Url = require('url');

import { fetchIt } from '~/libs/helpers';
import { FriendlyError } from './errors';

let singleton = null;

const roundValue = (num) => {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}

const CURVE_DAYS = 28;
const CURVE_MAX_PAGES = 30;
const CURVE_MAX_AGE_HOURS = 20;
const RECENT_DAYS = 3;
const RECENT_MAX_PAGES = 5;

const dayOfSale = (sale) => String(sale.date).slice(0, 10);

// For each hour of the store's day, the share of a day's earnings usually made
// by the end of it. EDD dates sales in the store's own timezone, so the hours
// are the store's.
const dayCurveOf = (sales, firstDay, lastDay) => {
	const perHour = new Array(24).fill(0);
	let count = 0;
	for (const sale of sales) {
		const day = dayOfSale(sale);
		const total = Number(sale.total) || 0;
		if (day < firstDay || day > lastDay || total <= 0) {
			continue;
		}
		const hour = DayJS(sale.date).hour();
		if (isNaN(hour)) {
			continue;
		}
		perHour[hour] += total;
		count++;
	}
	const sum = perHour.reduce((a, b) => a + b, 0);
	if (!sum) {
		return null;
	}
	let running = 0;
	const shares = perHour.map(x => Math.round((running += x) / sum * 1000) / 1000);
	return { shares, sales: count, updatedOn: new Date() };
};

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
		// Bonuses for the Yesterday & Today view, so they never fail the refresh.
		try {
			await this.refreshRecentDays(service);
			await this.refreshDayCurve(service);
		}
		catch (err) {
			console.error('[EDD] Could not read the recent sales.', err.message);
		}
	}

	// Sales come newest first, so paging stops once a page reaches back past firstDay.
	fetchSalesSince = async (service, firstDay, maxPages) => {
		const sales = [];
		for (let page = 1; page <= maxPages; page++) {
			const data = await fetchIt(service.data.endpoint + '/sales', { method: 'GET' }, {
				token: service.data.token,
				key: service.data.key,
				number: 100,
				page
			});
			const batch = Array.isArray(data?.sales) ? data.sales : [];
			sales.push(...batch);
			if (!batch.length || dayOfSale(batch[batch.length - 1]) < firstDay) {
				break;
			}
		}
		return sales;
	}

	// The stats endpoint cuts its days in UTC, so for a store in Japan "today"
	// started at 9am. The sales carry the store's own time, so the last few days
	// are summed from them instead, as the store's dashboard does.
	refreshRecentDays = async (service) => {
		const firstDay = DayJS().subtract(RECENT_DAYS, 'day').format('YYYY-MM-DD');
		const sales = await this.fetchSalesSince(service, firstDay, RECENT_MAX_PAGES);
		const days = {};
		for (const sale of sales) {
			const day = dayOfSale(sale);
			const total = Number(sale.total) || 0;
			if (day >= firstDay && total > 0) {
				days[day] = roundValue((days[day] || 0) + total);
			}
		}
		const recentDays = { days, updatedOn: new Date() };
		service.recentDays = recentDays;
		await this.db.collection('Service').updateOne({ _id: ObjectID(service._id) }, { $set: { recentDays } });
	}

	// Read once a day from the sales of the last four weeks.
	refreshDayCurve = async (service) => {
		const updatedOn = service.dayCurve?.updatedOn;
		if (updatedOn && DayJS().diff(updatedOn, 'hour') < CURVE_MAX_AGE_HOURS) {
			return;
		}
		const sales = await this.fetchSalesSince(service,
			DayJS().subtract(CURVE_DAYS + 1, 'day').format('YYYY-MM-DD'), CURVE_MAX_PAGES);
		if (!sales.length) {
			return;
		}
		// The newest day is still running, so the curve stops the day before it.
		const lastDay = DayJS(dayOfSale(sales[0])).subtract(1, 'day');
		const firstDay = lastDay.subtract(CURVE_DAYS - 1, 'day');
		const dayCurve = dayCurveOf(sales, firstDay.format('YYYY-MM-DD'), lastDay.format('YYYY-MM-DD'));
		if (dayCurve) {
			await this.db.collection('Service').updateOne({ _id: ObjectID(service._id) }, { $set: { dayCurve } });
			console.log(`[EDD] Day curve read from ${dayCurve.sales} sales for ${service.data.username}.`);
		}
	}

	getLive = async (params) => {
		const { serviceId } = params;
		if (!serviceId) {
			return null;
		}
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) },
			{ projection: { recentDays: 1, dayCurve: 1 } });
		return service ? { days: service.recentDays?.days || null, shares: service.dayCurve?.shares || null } : null;
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
