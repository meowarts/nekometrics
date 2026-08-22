const ObjectID = require('mongodb').ObjectID;
const DayJS = require('dayjs');
const Url = require('url');

import { fetchIt } from '~/libs/helpers';
import { FriendlyError } from './errors';

let singleton = null;

// The plugin refuses to go further back than this, and so do we.
const MAX_HISTORY_DAYS = 3650;

const buildUrl = (endpoint, route) => {
	// Sites without pretty permalinks expose the API as ?rest_route=/nekometrics/v1,
	// where the route has to be appended to the query rather than to the path.
	if (endpoint.includes('rest_route=')) {
		return `${endpoint}${route}`;
	}
	return `${endpoint.replace(/\/+$/, '')}${route}`;
}

// A rebuilt history starts with one point per day all the way back, most of them
// at zero for anything younger than the range. Only the last zero is worth keeping:
// it makes the curve start from the ground without storing years of nothing.
const trimLeadingZeros = (series) => {
	const first = series.findIndex(x => x.value !== 0);
	if (first === -1) {
		return series.slice(-1);
	}
	return first > 0 ? series.slice(first - 1) : series;
}

// Identifies a metric in the Metric collection: a widget on the MailPoet list 4
// and a widget on the MailPoet list 7 are two different series.
const metricKeyOf = (settings) => {
	const { provider, metric, params } = settings;
	const args = Object.keys(params || {}).sort()
		.filter(key => params[key] !== '' && params[key] !== null && params[key] !== undefined)
		.map(key => `${key}=${params[key]}`);
	return [ provider, metric, ...args ].join(':');
}

const friendlyMessage = (data) => {
	switch (data.code) {
		case 'rest_no_route':
			return 'The Nekometrics plugin does not answer on that site. Make sure it is installed and activated.';
		case 'nkmt_bad_key':
			return 'The site refused the key. Copy it again from the Nekometrics page in WordPress.';
		case 'nkmt_no_key':
			return 'The Nekometrics plugin on that site has no key yet.';
		default:
			return data.message || 'The site answered with an error.';
	}
}

class WordPressService {

	db = null;

	constructor(db) {
		if (!singleton) {
			singleton = this;
			this.db = db;
		}
		return singleton;
	}

	apiGet = async (service, route, params = null) => {
		const { endpoint, key } = service.data;
		if (!endpoint || !key) {
			throw new FriendlyError('This WordPress source is missing its endpoint or its key.');
		}
		let data = null;
		try {
			// The `_t` is not decoration. The plugin asks every cache in front of the
			// site not to store its answers, and Kinsta ignores that outright: a
			// query-less URL comes back as a HIT with s-maxage=86400, so a site could
			// keep answering with what it said a day ago. Caches key on the full URL
			// and Kinsta bypasses anything with a query string, so a unique parameter
			// is the one defence that does not depend on how the site is hosted.
			data = await fetchIt(buildUrl(endpoint, route), {
				headers: { 'X-Nekometrics-Key': key }
			}, { ...(params || {}), _t: Date.now() });
		}
		catch (err) {
			// A wrong address usually answers with an HTML page, which blows up on
			// the JSON parsing rather than on the request itself.
			if (err instanceof FriendlyError) {
				throw err;
			}
			throw new FriendlyError('Could not reach the Nekometrics plugin at that address.');
		}
		if (!data) {
			throw new FriendlyError('The site did not answer.');
		}
		if (data.code) {
			throw new FriendlyError(friendlyMessage(data));
		}
		return data;
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
		const endpoint = (params.endpoint || '').trim().replace(/\/+$/, '');
		const key = (params.key || '').trim();
		if (!endpoint) {
			throw new FriendlyError('The endpoint is required.');
		}
		if (!key) {
			throw new FriendlyError('The key is required.');
		}

		const probe = { data: { endpoint, key } };
		const ping = await this.apiGet(probe, '/ping');
		const sources = await this.apiGet(probe, '/sources');
		const domain = Url.parse(ping?.site?.url || endpoint).hostname;

		let service = {
			userId: ObjectID(user._id),
			name: ping?.site?.name ? `${ping.site.name} (${domain})` : `WordPress (${domain})`,
			service: 'wordpress',
			data: {
				username: domain,
				endpoint: endpoint,
				key: key,
				timezone: ping?.site?.timezone || null,
				sources: sources
			},
			createdOn: now,
			updatedOn: now
		}
		const res = await this.db.collection('Service').insertOne(service);
		service._id = res.insertedId;
		console.log(`[WP] Added Service for ${service.data.username} (${service._id})`);
		return service;
	}

	/**
	 * Asks the site for a daily series. Metrics that have no history (a plugin
	 * may expose a number it cannot look back on) fall back to a single point
	 * for today, so the widget still works.
	 */
	fetchSeries = async (service, settings, from, to) => {
		const { provider, metric, params } = settings;
		const query = { ...(params || {}), provider, metric,
			from: from.format('YYYY-MM-DD'), to: to.format('YYYY-MM-DD') };
		try {
			const data = await this.apiGet(service, '/history', query);
			return (data.values || []).map(x => ({ date: DayJS(x.date).endOf('day'), value: x.value }));
		}
		catch (err) {
			if (!(err instanceof FriendlyError)) {
				throw err;
			}
			const data = await this.apiGet(service, '/metric', { ...(params || {}), provider, metric });
			return [ { date: DayJS(data.date).endOf('day'), value: data.value } ];
		}
	}

	checkSettings = (settings) => {
		if (!settings.provider || !settings.metric) {
			throw new FriendlyError('No metric selected yet.');
		}
	}

	refreshMetric = async (settings) => {
		const service = await this.getService(settings.serviceId);
		this.checkSettings(settings);

		const now = new Date();
		const oneWeekAgo = DayJS().endOf('day').subtract(8, 'day');
		const metricKey = metricKeyOf(settings);
		const series = await this.fetchSeries(service, settings, oneWeekAgo, DayJS().endOf('day'));

		const metrics = await this.db.collection('Metric').find({ serviceId: ObjectID(service._id),
			metric: metricKey, date: { $gte: oneWeekAgo.subtract(1, 'day').toDate() } }).toArray();
		for (const entry of series) {
			const dbMetric = metrics.find(x => DayJS(x.date).isSame(entry.date));
			if (!dbMetric) {
				console.log('[WP] New', entry.date.format('YYYYMMDD'), entry.value);
				await this.db.collection('Metric').insertOne({
					serviceId: ObjectID(service._id), date: entry.date.toDate(),
					metric: metricKey, value: entry.value, createdOn: now, updatedOn: now
				});
			}
			else if (dbMetric.value !== entry.value) {
				console.log('[WP] Update', entry.date.format('YYYYMMDD'), dbMetric.value, '->', entry.value);
				await this.db.collection('Metric').updateOne({ '_id': ObjectID(dbMetric._id) },
					{ $set: { 'value': entry.value, 'updatedOn': now } });
			}
		}
	}

	getMetric = async (settings) => {
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

	resetMetric = async (settings) => {
		const service = await this.getService(settings.serviceId);
		this.checkSettings(settings);

		const now = new Date();
		const metricKey = metricKeyOf(settings);
		const series = await this.fetchSeries(service,	settings,
			DayJS().endOf('day').subtract(MAX_HISTORY_DAYS, 'day'), DayJS().endOf('day'));

		const trimmed = trimLeadingZeros(series);
		await this.db.collection('Metric').deleteMany({ serviceId: ObjectID(service._id), metric: metricKey });
		if (trimmed.length) {
			await this.db.collection('Metric').insertMany(trimmed.map(x => ({
				serviceId: ObjectID(service._id),
				date: x.date.toDate(),
				metric: metricKey,
				value: x.value,
				createdOn: now,
				updatedOn: now
			})));
		}
		return this.getMetric(settings);
	}

	refreshService = async (service) => {
		const now = new Date();
		const ping = await this.apiGet(service, '/ping');
		const sources = await this.apiGet(service, '/sources');
		const domain = Url.parse(ping?.site?.url || service.data.endpoint).hostname;
		service.name = ping?.site?.name ? `${ping.site.name} (${domain})` : `WordPress (${domain})`;
		service.data.username = domain;
		service.data.timezone = ping?.site?.timezone || null;
		service.data.sources = sources;
		service.updatedOn = now;
		await this.db.collection('Service').updateOne({ _id: ObjectID(service._id) }, {
			$set: { name: service.name, data: service.data, updatedOn: now }
		});
		return service;
	}
}

export default WordPressService;
