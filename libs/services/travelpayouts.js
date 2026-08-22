const ObjectID = require('mongodb').ObjectID;
const DayJS = require('dayjs');

import { fetchIt } from '~/libs/helpers';
import { FriendlyError } from './errors';

let singleton = null;

const API = 'https://api.travelpayouts.com/statistics/v1';
const MAX_HISTORY_DAYS = 730;

// Names taken from get_fields_list, checked against what the Travelpayouts
// dashboard shows for the same month so the widgets cannot quietly disagree
// with the site. Clicks are `redirects_count`: `clicks_count` exists and is
// always zero.
const METRICS = {
	clicks: { field: 'redirects_count', name: 'Clicks', money: false },
	bookings: { field: 'actions_count', name: 'Bookings', money: false },
	earnings: { field: 'paid_profit_usd_sum', name: 'Earnings', money: true },
	potential: { field: 'processing_profit_usd_sum', name: 'Potential earnings', money: true }
};

const metricKeyOf = (settings) => `travelpayouts:${settings.metric || 'clicks'}`;

const roundValue = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

class TravelPayoutsService {

	db = null;

	constructor(db) {
		if (!singleton) {
			singleton = this;
			this.db = db;
		}
		return singleton;
	}

	query = async (token, body) => {
		let data = null;
		try {
			data = await fetchIt(`${API}/execute_query`, {
				method: 'POST',
				headers: { 'X-Access-Token': token, 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
		}
		catch (err) {
			if (err instanceof FriendlyError) {
				throw err;
			}
			throw new FriendlyError('Could not reach Travelpayouts.');
		}
		if (!data || !Array.isArray(data.results)) {
			throw new FriendlyError(data && data.error
				? String(data.error)
				: 'Travelpayouts refused the token, or returned nothing.');
		}
		return data.results;
	}

	getService = async (serviceId) => {
		if (!serviceId) {
			throw new FriendlyError('Not linked to a data source yet.');
		}
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service) {
			throw new FriendlyError('The service it was linked to does not exist anymore.');
		}
		return service;
	}

	createNew = async (user, params) => {
		const now = new Date();
		const token = (params.token || '').trim();
		if (!token) {
			throw new FriendlyError('The API token is required.');
		}
		// A one day query is the cheapest way to prove the token works.
		await this.query(token, {
			fields: [ 'redirects_count' ],
			filters: [ { field: 'date', op: 'ge', value: DayJS().format('YYYY-MM-DD') } ],
			limit: 1
		});

		let service = {
			userId: ObjectID(user._id),
			name: 'Travelpayouts',
			service: 'travelpayouts',
			data: { username: 'travelpayouts', token },
			createdOn: now,
			updatedOn: now
		};
		const res = await this.db.collection('Service').insertOne(service);
		service._id = res.insertedId;
		console.log(`[TP] Added Service (${service._id})`);
		return service;
	}

	checkSettings = (settings) => {
		if (settings.metric && !METRICS[settings.metric]) {
			throw new FriendlyError('That metric does not exist in Travelpayouts.');
		}
	}

	fetchSeries = async (service, settings, from, to) => {
		const metric = METRICS[settings.metric || 'clicks'];
		const rows = await this.query(service.data.token, {
			fields: [ 'date', metric.field ],
			filters: [
				{ field: 'date', op: 'ge', value: from.format('YYYY-MM-DD') },
				{ field: 'date', op: 'le', value: to.format('YYYY-MM-DD') }
			],
			group: [ 'date' ],
			sort: [ { field: 'date', order: 'asc' } ],
			limit: 10000
		});
		return rows
			.filter(x => x.date)
			.map(x => ({ date: DayJS(x.date).endOf('day'), value: roundValue(parseFloat(x[metric.field]) || 0) }));
	}

	upsert = async (serviceId, metric, entries) => {
		const now = new Date();
		if (!entries.length) {
			return;
		}
		const oldest = entries[0].date.subtract(1, 'day').toDate();
		const stored = await this.db.collection('Metric').find({
			serviceId: ObjectID(serviceId), metric: metric, date: { $gte: oldest }
		}).toArray();
		for (const entry of entries) {
			const dbMetric = stored.find(x => DayJS(x.date).isSame(entry.date));
			if (!dbMetric) {
				await this.db.collection('Metric').insertOne({
					serviceId: ObjectID(serviceId), date: entry.date.toDate(),
					metric: metric, value: entry.value, createdOn: now, updatedOn: now
				});
			}
			else if (dbMetric.value !== entry.value) {
				await this.db.collection('Metric').updateOne({ '_id': ObjectID(dbMetric._id) },
					{ $set: { 'value': entry.value, 'updatedOn': now } });
			}
		}
	}

	/**
	 * A wider window than the other sources on purpose: a booking sits in
	 * `processing` for weeks and only then becomes `paid`, so days that looked
	 * settled keep changing long after they happened.
	 */
	refreshStats = async (settings) => {
		const service = await this.getService(settings.serviceId);
		this.checkSettings(settings);
		const series = await this.fetchSeries(service, settings, DayJS().subtract(60, 'day'), DayJS());
		await this.upsert(service._id, metricKeyOf(settings), series);
	}

	resetStats = async (settings) => {
		const service = await this.getService(settings.serviceId);
		this.checkSettings(settings);
		const now = new Date();
		const metricKey = metricKeyOf(settings);
		const series = await this.fetchSeries(service, settings,
			DayJS().subtract(MAX_HISTORY_DAYS, 'day'), DayJS());

		await this.db.collection('Metric').deleteMany({ serviceId: ObjectID(service._id), metric: metricKey });
		if (series.length) {
			await this.db.collection('Metric').insertMany(series.map(x => ({
				serviceId: ObjectID(service._id), date: x.date.toDate(),
				metric: metricKey, value: x.value, createdOn: now, updatedOn: now
			})));
		}
		return this.getStats(settings);
	}

	getStats = async (settings) => {
		const { serviceId, period } = settings;
		await this.getService(serviceId);
		this.checkSettings(settings);
		if (!period) {
			throw new FriendlyError('The period is required.');
		}
		const fromDate = DayJS().subtract(period.length, period.unit).toDate();
		const toDate = DayJS().add(1, 'day').startOf('day').toDate();
		const dbMetrics = await this.db.collection('Metric').find({
			serviceId: ObjectID(serviceId),
			metric: metricKeyOf(settings),
			date: { $gt: fromDate, $lt: toDate }
		}).sort({ date: 1 }).toArray();
		return dbMetrics.map(x => ({ _id: x._id, date: x.date, metric: x.metric, value: x.value }));
	}

	refreshService = async (service) => {
		const now = new Date();
		await this.query(service.data.token, {
			fields: [ 'redirects_count' ],
			filters: [ { field: 'date', op: 'ge', value: DayJS().format('YYYY-MM-DD') } ],
			limit: 1
		});
		await this.db.collection('Service').updateOne({ _id: ObjectID(service._id) },
			{ $set: { updatedOn: now } });
		service.updatedOn = now;
		return service;
	}
}

export { METRICS };
export default TravelPayoutsService;
