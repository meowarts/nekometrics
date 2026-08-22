const ObjectID = require('mongodb').ObjectID;
const DayJS = require('dayjs');

import { fetchIt } from '~/libs/helpers';
import { FriendlyError } from './errors';

let singleton = null;

const INFO_API = 'https://api.wordpress.org/plugins/info/1.2/';
const STATS_API = 'https://api.wordpress.org/stats/plugin/1.0/downloads.php';

// The downloads endpoint answers for two years and starts misbehaving past that:
// asking for 1500 days quietly returns 179 of them.
const MAX_HISTORY_DAYS = 730;

const decodeEntities = (text) => {
	return String(text || '')
		.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

const downloadsKey = (slug) => `wporg:${slug}:downloads`;
const installsKey = (slug) => `wporg:${slug}:installs`;

class WordPressOrgService {

	db = null;

	constructor(db) {
		if (!singleton) {
			singleton = this;
			this.db = db;
		}
		return singleton;
	}

	fetchPlugins = async (author) => {
		const data = await fetchIt(INFO_API, { method: 'GET' }, {
			'action': 'query_plugins',
			'request[author]': author,
			'request[per_page]': 100
		});
		if (!data || !Array.isArray(data.plugins)) {
			throw new FriendlyError('WordPress.org did not return any plugin for this author.');
		}
		return data.plugins.map(x => ({
			slug: x.slug,
			name: decodeEntities(x.name),
			installs: x.active_installs,
			downloaded: x.downloaded,
			rating: x.rating,
			ratings: x.num_ratings
		}));
	}

	fetchPlugin = async (slug) => {
		const data = await fetchIt(INFO_API, { method: 'GET' }, {
			'action': 'plugin_information',
			'request[slug]': slug
		});
		if (!data || data.error || !data.slug) {
			throw new FriendlyError(`WordPress.org does not know a plugin called "${slug}".`);
		}
		return {
			slug: data.slug,
			name: decodeEntities(data.name),
			installs: data.active_installs,
			downloaded: data.downloaded,
			rating: data.rating,
			ratings: data.num_ratings
		};
	}

	/**
	 * Daily downloads, oldest first. WordPress.org counts a day once it is over,
	 * so the most recent entry is yesterday, never today.
	 */
	fetchDownloads = async (slug, days) => {
		const data = await fetchIt(STATS_API, { method: 'GET' }, {
			slug: slug,
			limit: Math.min(days, MAX_HISTORY_DAYS)
		});
		if (!data || typeof data !== 'object') {
			throw new FriendlyError('WordPress.org did not return the download statistics.');
		}
		return Object.entries(data)
			.map(([ date, value ]) => ({ date: DayJS(date).endOf('day'), value: parseInt(value, 10) }))
			.filter(x => x.date.isValid() && !isNaN(x.value))
			.sort((a, b) => a.date.valueOf() - b.date.valueOf());
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
		const author = (params.author || '').trim().replace(/^@/, '');
		if (!author) {
			throw new FriendlyError('The WordPress.org username is required.');
		}
		const plugins = await this.fetchPlugins(author);
		if (!plugins.length) {
			throw new FriendlyError(`WordPress.org lists no plugin for "${author}".`);
		}

		let service = {
			userId: ObjectID(user._id),
			name: `WordPress.org (${author}, ${plugins.length} plugins)`,
			service: 'wordpressorg',
			data: {
				username: author,
				author: author,
				plugins: plugins
			},
			createdOn: now,
			updatedOn: now
		}
		const res = await this.db.collection('Service').insertOne(service);
		service._id = res.insertedId;
		console.log(`[WPORG] Added Service for ${author} (${service._id})`);
		return service;
	}

	checkSettings = (settings) => {
		if (!settings.slug) {
			throw new FriendlyError('No plugin selected yet.');
		}
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

	refreshPlugin = async (settings) => {
		const service = await this.getService(settings.serviceId);
		this.checkSettings(settings);
		const { slug } = settings;

		const downloads = await this.fetchDownloads(slug, 8);
		await this.upsert(service._id, downloadsKey(slug), downloads);

		// Active installs has no past anywhere: WordPress.org publishes today's
		// number and nothing else, so this is the only way the curve ever grows.
		const plugin = await this.fetchPlugin(slug);
		await this.upsert(service._id, installsKey(slug),
			[ { date: DayJS().endOf('day'), value: plugin.installs } ]);
	}

	resetPlugin = async (settings) => {
		const service = await this.getService(settings.serviceId);
		this.checkSettings(settings);
		const now = new Date();
		const { slug } = settings;

		const downloads = await this.fetchDownloads(slug, MAX_HISTORY_DAYS);
		await this.db.collection('Metric').deleteMany({
			serviceId: ObjectID(service._id), metric: downloadsKey(slug) });
		if (downloads.length) {
			await this.db.collection('Metric').insertMany(downloads.map(x => ({
				serviceId: ObjectID(service._id), date: x.date.toDate(),
				metric: downloadsKey(slug), value: x.value, createdOn: now, updatedOn: now
			})));
		}

		const plugin = await this.fetchPlugin(slug);
		await this.upsert(service._id, installsKey(slug),
			[ { date: DayJS().endOf('day'), value: plugin.installs } ]);

		return this.getPlugin(settings);
	}

	/**
	 * One row per day carrying both series: `value` is that day's downloads, and
	 * `installs` is what WordPress.org reported that day, which only exists for
	 * the days since this widget was set up.
	 */
	getPlugin = async (settings) => {
		const { serviceId, slug, period } = settings;
		await this.getService(serviceId);
		this.checkSettings(settings);
		if (!period) {
			throw new FriendlyError('The period is required.');
		}

		const fromDate = DayJS().subtract(period.length, period.unit).toDate();
		const toDate = DayJS().add(1, 'day').startOf('day').toDate();
		const rows = await this.db.collection('Metric').find({
			serviceId: ObjectID(serviceId),
			metric: { $in: [ downloadsKey(slug), installsKey(slug) ] },
			date: { $gt: fromDate, $lt: toDate }
		}).sort({ date: 1 }).toArray();

		// A key is left out rather than set to zero when that day has nothing for
		// it: today has no download count yet (WordPress.org only publishes a day
		// once it is over) and the days before this widget existed have no active
		// installs. A zero would draw a bar or a line that never happened.
		const byDate = new Map();
		for (const row of rows) {
			const key = DayJS(row.date).format('YYYY-MM-DD');
			if (!byDate.has(key)) {
				byDate.set(key, { _id: row._id, date: row.date, metric: 'downloads' });
			}
			if (row.metric === installsKey(slug)) {
				byDate.get(key).installs = row.value;
			}
			else {
				byDate.get(key).value = row.value;
			}
		}
		return Array.from(byDate.values());
	}

	refreshService = async (service) => {
		const now = new Date();
		const plugins = await this.fetchPlugins(service.data.author);
		service.name = `WordPress.org (${service.data.author}, ${plugins.length} plugins)`;
		service.data.plugins = plugins;
		service.updatedOn = now;
		await this.db.collection('Service').updateOne({ _id: ObjectID(service._id) }, {
			$set: { name: service.name, data: service.data, updatedOn: now }
		});
		return service;
	}
}

export default WordPressOrgService;
