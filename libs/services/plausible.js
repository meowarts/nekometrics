const ObjectID = require('mongodb').ObjectID;
const DayJS = require('dayjs');
const Url = require('url');

import { fetchIt } from '~/libs/helpers';
import { FriendlyError } from './errors';

let singleton = null;

const MAX_HISTORY_DAYS = 730;

const METRICS = [
	{ id: 'visitors', name: 'Visitors' },
	{ id: 'pageviews', name: 'Pageviews' }
];

const metricKeyOf = (settings) => `plausible:${settings.site}:${settings.metric || 'visitors'}`;

class PlausibleService {

	db = null;

	constructor(db) {
		if (!singleton) {
			singleton = this;
			this.db = db;
		}
		return singleton;
	}

	apiGet = async (endpoint, key, path, params = null) => {
		const url = `${endpoint.replace(/\/+$/, '')}${path}`;
		let data = null;
		try {
			data = await fetchIt(url, { headers: { Authorization: `Bearer ${key}` } }, params);
		}
		catch (err) {
			if (err instanceof FriendlyError) {
				throw err;
			}
			throw new FriendlyError('Could not reach Plausible at that address.');
		}
		if (!data) {
			throw new FriendlyError('Plausible did not answer.');
		}
		if (data.error) {
			throw new FriendlyError(data.error === 'Invalid API key or site ID. Please make sure you\'re using a valid API key with access to the site you\'ve requested.'
				? 'Plausible refused the key, or it has no access to that site.' : data.error);
		}
		return data;
	}

	/**
	 * The sites are given rather than discovered. Plausible's /api/sites answers
	 * to a logged-in session, not to an API key, and /api/v1/sites is not in
	 * every build, so an API key alone cannot list what it has access to. Each
	 * domain is checked by actually asking for its numbers, which proves both
	 * that the site exists and that this key may read it.
	 */
	validateSites = async (endpoint, key, domains) => {
		const sites = [];
		const refused = [];
		for (const domain of domains) {
			try {
				await this.apiGet(endpoint, key, '/api/v1/stats/aggregate',
					{ site_id: domain, period: 'day', metrics: 'visitors' });
				sites.push({ domain });
			}
			catch (err) {
				refused.push(domain);
			}
		}
		if (!sites.length) {
			throw new FriendlyError(refused.length
				? `Plausible would not give this key any of those sites: ${refused.join(', ')}.`
				: 'No site was given.');
		}
		return { sites, refused };
	}

	parseDomains = (raw) => {
		return String(raw || '')
			.split(/[\s,;]+/)
			.map(x => x.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
			.filter(Boolean);
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
			throw new FriendlyError('The Plausible address is required.');
		}
		if (!key) {
			throw new FriendlyError('The API key is required.');
		}
		const domains = this.parseDomains(params.sites);
		if (!domains.length) {
			throw new FriendlyError('At least one site is required.');
		}
		const { sites } = await this.validateSites(endpoint, key, domains);
		const domain = Url.parse(endpoint).hostname;

		let service = {
			userId: ObjectID(user._id),
			name: `Plausible (${domain}, ${sites.length} sites)`,
			service: 'plausible',
			data: { username: domain, endpoint, key, sites }
		};
		service.createdOn = now;
		service.updatedOn = now;
		const res = await this.db.collection('Service').insertOne(service);
		service._id = res.insertedId;
		console.log(`[PLSB] Added Service for ${domain} (${service._id})`);
		return service;
	}

	checkSettings = (settings) => {
		if (!settings.site) {
			throw new FriendlyError('No site selected yet.');
		}
		if (settings.metric && !METRICS.find(x => x.id === settings.metric)) {
			throw new FriendlyError('That metric does not exist in Plausible.');
		}
	}

	/**
	 * Plausible keeps the whole history itself, so unlike the reconstructed
	 * sources there is nothing to estimate here: this is what it recorded.
	 */
	fetchSeries = async (service, settings, from, to) => {
		const { endpoint, key } = service.data;
		const metric = settings.metric || 'visitors';
		const data = await this.apiGet(endpoint, key, '/api/v1/stats/timeseries', {
			site_id: settings.site,
			period: 'custom',
			date: `${from.format('YYYY-MM-DD')},${to.format('YYYY-MM-DD')}`,
			metrics: metric,
			interval: 'date'
		});
		return (data.results || [])
			.filter(x => x[metric] !== null && x[metric] !== undefined)
			.map(x => ({ date: DayJS(x.date).endOf('day'), value: x[metric] }));
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

	refreshTraffic = async (settings) => {
		const service = await this.getService(settings.serviceId);
		this.checkSettings(settings);
		const series = await this.fetchSeries(service, settings,
			DayJS().subtract(8, 'day'), DayJS());
		await this.upsert(service._id, metricKeyOf(settings), series);
	}

	resetTraffic = async (settings) => {
		const service = await this.getService(settings.serviceId);
		this.checkSettings(settings);
		const now = new Date();
		const metricKey = metricKeyOf(settings);
		const series = await this.fetchSeries(service, settings,
			DayJS().subtract(MAX_HISTORY_DAYS, 'day'), DayJS());

		// Plausible answers with zeroes for the days before the site existed;
		// they are dropped so a young site does not start with a flat year.
		const firstReal = series.findIndex(x => x.value > 0);
		const trimmed = firstReal > 0 ? series.slice(firstReal) : series;

		await this.db.collection('Metric').deleteMany({ serviceId: ObjectID(service._id), metric: metricKey });
		if (trimmed.length) {
			await this.db.collection('Metric').insertMany(trimmed.map(x => ({
				serviceId: ObjectID(service._id), date: x.date.toDate(),
				metric: metricKey, value: x.value, createdOn: now, updatedOn: now
			})));
		}
		return this.getTraffic(settings);
	}

	getTraffic = async (settings) => {
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
		const { endpoint, key } = service.data;
		const { sites } = await this.validateSites(endpoint, key,
			(service.data.sites || []).map(x => x.domain));
		const domain = Url.parse(endpoint).hostname;
		service.name = `Plausible (${domain}, ${sites.length} sites)`;
		service.data.sites = sites;
		service.updatedOn = now;
		await this.db.collection('Service').updateOne({ _id: ObjectID(service._id) }, {
			$set: { name: service.name, data: service.data, updatedOn: now }
		});
		return service;
	}
}

export { METRICS };
export default PlausibleService;
