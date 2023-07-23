const ObjectID = require('mongodb').ObjectID;
const DayJS = require('dayjs');
const { google: Google } = require('googleapis');
const GoogleScopes = 'https://www.googleapis.com/auth/analytics.readonly';

const CFG = require('~/config');
import { FriendlyError } from './errors';
import { fetchIt } from '~/libs/helpers';

let singleton = null;

class GoogleService {

	db = null;
	clientId = CFG.services.google.client_id;
	clientSecret = CFG.services.google.client_secret;
	redirectUri = `${CFG.app.url}/oauth/google`;

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
			throw new FriendlyError('The code has not been returned by Google.');
		}
		const body = `code=${code}&client_id=${this.clientId}&client_secret=${this.clientSecret}` +
			`&grant_type=authorization_code&redirect_uri=${this.redirectUri}`
		const data = await fetchIt('https://www.googleapis.com/oauth2/v4/token', {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			method: 'POST',
			body: body
		});
		const { access_token, refresh_token, scope } = data;
		const now = new Date();
		let service = null;

		if (refresh_token) {
			service = { 
				userId: ObjectID(user._id),
				name: 'Google Analytics',
				service: 'google',
				data: {
					refresh_token: refresh_token, // This never expires.
					scope: scope,
				},
				createdOn: now,
				updatedOn: now
			}
			const { username, accounts } = await this.getUserAndAccounts(service);
			const websitesCount = accounts.reduce((a, b) =>  a + b.properties.length, 0);
			service.name = `Google Analytics (${websitesCount} websites)`;
			service.data.username = username;
			service.data.accounts = accounts;
		}
		else {
			// Maybe this Google Account has already been linked to another  accounts.
			// Let's see who is that user first (though we have no refresh_token, we should get the access_token)
			let tmpService = { data: { refresh_token: access_token } };
			//console.log('[handleOauth] No refresh token, but this.', data);
			const { username } = await this.getUserAndAccounts(tmpService);
			//console.log('[handleOauth] With the access token, we could retrieve username', username);
			const sameServices = await this.db.collection('Service').find({ 'data.username': username, service: 'google' }).toArray();
			if (!sameServices.length) {
				throw new FriendlyError('It seems a service has been already created between your Nekometrics account and Google Analytics account before, but it does not exist anymore. You will need to remove the permissions for Nekometrics in your Google Account (https://myaccount.google.com/permissions) and restart this process again.');
			}
			if (sameServices.some(x => x.userId.toString() === user._id.toString())) {
				throw new FriendlyError('A service has been already enabled between your Nekometrics account and your Google Analytics account.');
			}
			service = sameServices[0];
			delete service._id;
			service.userId = ObjectID(user._id);
			service.createdOn = service.updatedOn = now;
		}
		const res = await this.db.collection('Service').insertOne(service);
		service._id = res.insertedId;
		console.log(`[GO] Added Service for ${service.data.username} (${service._id})`);
		return service;
	}

	createOauthClient = (service) => {
		// Checks
		if (!service.data)
			throw new FriendlyError('The service was not initialized correctly (it has not data).');
		if (!service.data.refresh_token)
			throw new FriendlyError('The refresh_token is missing from the service.');

		// Create OAuth2 client
		const client = new Google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);
		client.setCredentials({ refresh_token: service.data.refresh_token });
		return client;
	}

	getAuthUrl = async () => {
		const oauth2Client = new Google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);
		let googleAuthUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: GoogleScopes });
		return googleAuthUrl;
	}

	getUserAndAccounts = async (service, oauth = null) => {
		oauth = oauth ? oauth : this.createOauthClient(service);
		const analytics = Google.analytics({ version: 'v3' });

		// Username
		let res = await analytics.management.accounts.list({ auth: oauth });
		if (res.status !== 200) {
			console.log('getAccountInfo', res.status, res.statusText);
			throw new FriendlyError('Cannot get the list of accounts.');
		}
		const username = res.data.username;

		// Accounts
		res = await analytics.management.accountSummaries.list({ auth: oauth });
		if (res.status !== 200) {
			console.log('getAccountInfo', res.status, res.statusText);
			throw new FriendlyError('Cannot get the list of accounts.');
		}
		const accounts = res.data.items.map(x => ({
			accountId: x.id,
			name: x.name,
			properties: x.webProperties.map(y => ({
				propertyId: y.id,
				name: y.name,
				url: y.websiteUrl,
				profiles: y.profiles.map(z => ({ profileId: z.id, name: z.name }))
			}))
		}));
		return { username, accounts };
	}

	refreshService = async (service) => {
		const { username, accounts } = await this.getUserAndAccounts(service);
		const websitesCount = accounts.reduce((a, b) =>  a + b.properties.length, 0);
		const name  = `Google Analytics (${websitesCount} websites)`;

		const now = new Date();
		this.db.collection('Service').updateOne({ _id: ObjectID(service._id) }, { 
			$set: { name, "data.username": username, "data.accounts": accounts, updatedOn: now } 
		});
		service.data.username = username;
		service.data.accounts = accounts;
		service.updatedOn = now;
		return service;
	}

	getAnalyticsVisits = async (params) => {
		const { serviceId, profileId } = params;
		if (!serviceId)
			throw new FriendlyError('Not linked to a data source yet.');
		if (!profileId)
			throw new FriendlyError('A Google Analytics profile has to be selected.');
		const service = await this.db.collection('Service').findOne({ _id: ObjectID(serviceId) });
		if (!service)
			throw new FriendlyError('The service it was linked to does not exist anymore.');
		
		params.period = params.period ? params.period : { length: 2, unit: 'week' };
		const oauth = this.createOauthClient(service);
		const fromDate = DayJS().subtract(params.period.length, params.period.unit).toDate();
		const dateTo = DayJS().add(-1, 'day').startOf('day').toDate();
		let metrics_columns = [{ 
			//expression: 'ga:users',
			expression: 'ga:sessions'
		}];

		// Calculate nice dimension and date filters
		let months = DayJS(dateTo).diff(DayJS(fromDate), "month"); 
		let days = DayJS(dateTo).diff(DayJS(fromDate), "day"); 
		let dimension = 'ga:hour';
		let by = 'hour';
		if (months > 12) {
			dimension = 'ga:year';
			by = 'year';
		}
		else if (months > 1) {
			dimension = 'ga:yearMonth';
			by = 'month';
		}
		else if (days > 1) {
			dimension = 'ga:date';
			by = 'day';
		}
		let dimensions_rows = [{ name: dimension }]; 
		let date_filters = [{ 
			startDate: DayJS(fromDate).format('YYYY-MM-DD'), 
			endDate: DayJS(dateTo).format('YYYY-MM-DD')
		}];
		//let sort = [{ fieldName: 'ga:pageviews', sortOrder: "DESCENDING" }];

		// Dimension & Metrics
		// https://ga-dev-tools.appspot.com/dimensions-metrics-explorer/
		// API batchGet: https://developers.google.com/analytics/devguides/reporting/core/v4/rest/v4/reports/batchGet
		// Tutorial with many examples: https://flaviocopes.com/google-analytics-api-nodejs/
		let analytics = Google.analyticsreporting('v4');
		let pageToken = null;
		let rows = [];
		try {
			// Query
			do {
				var req = {
					reportRequests: [{
						viewId: 'ga:' + profileId,
						dateRanges: date_filters,
						metrics: metrics_columns,
						dimensions: dimensions_rows,
						pageToken: pageToken
						//pageSize: 10
						//orderBys: sort
					}],
				};
				let data = await analytics.reports.batchGet({ auth: oauth, resource: req });

				// Result
				const report = data.data.reports[0];
				const reportData = report.data;
				if (reportData.rows) {
					rows = [ ...rows, ...reportData.rows ];
				}
				//console.log('Dates', date_filters);
				//console.log('Rows', reportData.rows.length);
				pageToken = report.nextPageToken;
			} while (pageToken);

			return { 
				by: by, 
				data: rows.map(x => { 
					return { date: x.dimensions[0], value: parseInt(x.metrics[0].values[0]) }
				})
			};
		}
		catch (err) {
			if (err.constructor.name === 'GaxiosError') {
				if (err.errors && err.errors.length) {
					const googleError = err.errors[0];
					if (googleError.reason === 'backendError')
						throw new FriendlyError('Temporary error from Google. Please try again later.');
					if (googleError.reason === 'rateLimitExceeded')
						throw new FriendlyError('Too many calls to Google in a short time. Please try again later.');
				}
				console.log(err);
				throw new FriendlyError('Unknown error from Google. Please try again later.');
			}
			throw err;
		}
	}
}

export default GoogleService;
