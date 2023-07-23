const ObjectID = require('mongodb').ObjectID;

import GoogleService from '~/libs/services/google';
import FacebookService from '~/libs/services/facebook';
import MailchimpService from '~/libs/services/mailchimp';
import EddService from '~/libs/services/edd';
import TwitterService from '~/libs/services/twitter';
import WooCommerceService from '~/libs/services/woocommerce';

import { FriendlyError, ServiceDisconnectedError, ServiceNotAuthorizedError } from './services/errors';
import { TYPES, SERVICES } from '~/libs/constants';

let singleton = null;

class Services {

  db = null;
  googleService = null;
  facebookService = null;
  mailchimpService = null;
  eddService = null;
  twitterService = null;

  repoCreate = {};
  metricRepo = {};
  resetRepo = {};
  refreshRepo = {};
  oauthRepo = {};

	constructor(db) {
		if (!singleton) {
			singleton = this;
      this.db = db;
      this.initializeServices();
		}
		return singleton;
  }
  
  initializeServices() {

    // Google
    this.googleService = new GoogleService(this.db);
    this.oauthRepo[SERVICES.GOOGLE] = this.googleService.handleOauth;
    this.metricRepo[`${SERVICES.GOOGLE}-${TYPES.GOOGLE.ANALYTICS_VISITS}`] = this.googleService.getAnalyticsVisits;

    // Facebook
    this.facebookService = new FacebookService(this.db);
    this.oauthRepo[SERVICES.FACEBOOK] = this.facebookService.handleOauth;
    this.metricRepo[`${SERVICES.FACEBOOK}-${TYPES.FACEBOOK.PAGE_LIKES}`] = this.facebookService.getPageLikes;
    this.resetRepo[`${SERVICES.FACEBOOK}-${TYPES.FACEBOOK.PAGE_LIKES}`] = this.facebookService.resetPageLikes;
    this.metricRepo[`${SERVICES.FACEBOOK}-${TYPES.FACEBOOK.IG_FOLLOWERS}`] = this.facebookService.getIgFollowers;
    //this.metricRepo[`${SERVICES.FACEBOOK}-${TYPES.FACEBOOK.IG_FOLLOWERS}`] = this.facebookService.getAdsMetrics;
    this.refreshRepo[`${SERVICES.FACEBOOK}-${TYPES.FACEBOOK.IG_FOLLOWERS}`] = this.facebookService.refreshIgFollowers;
    this.refreshRepo[`${SERVICES.FACEBOOK}-${TYPES.FACEBOOK.PAGE_LIKES}`] = this.facebookService.refreshPageLikes;

    // Mailchimp
    this.mailchimpService = new MailchimpService(this.db);
    this.oauthRepo[SERVICES.MAILCHIMP] = this.mailchimpService.handleOauth;
    this.metricRepo[`${SERVICES.MAILCHIMP}-${TYPES.MAILCHIMP.SUBSCRIBERS}`] = this.mailchimpService.getSubscribers;
    this.refreshRepo[`${SERVICES.MAILCHIMP}-${TYPES.MAILCHIMP.SUBSCRIBERS}`] = this.mailchimpService.refreshSubscribers;

    // Twitter
    this.twitterService = new TwitterService(this.db);
    this.oauthRepo[SERVICES.TWITTER] = this.twitterService.handleOauth;
    this.metricRepo[`${SERVICES.TWITTER}-${TYPES.TWITTER.FOLLOWERS}`] = this.twitterService.getFollowers;
    this.refreshRepo[`${SERVICES.TWITTER}-${TYPES.TWITTER.FOLLOWERS}`] = this.twitterService.refreshFollowers;

    // EDD
    this.eddService = new EddService(this.db);
    this.repoCreate[SERVICES.EDD] = this.eddService.createNew;
    this.metricRepo[`${SERVICES.EDD}-${TYPES.EDD.EARNINGS}`] = this.eddService.getEarnings;
    this.refreshRepo[`${SERVICES.EDD}-${TYPES.EDD.EARNINGS}`] = this.eddService.refreshEarnings;
    this.resetRepo[`${SERVICES.EDD}-${TYPES.EDD.EARNINGS}`] = this.eddService.resetEarnings;

    // WooCommerce    
    this.wooCommerceService = new WooCommerceService(this.db);
    this.repoCreate[SERVICES.WOOCOMMERCE] = this.wooCommerceService.createNew;
    this.metricRepo[`${SERVICES.WOOCOMMERCE}-${TYPES.WOOCOMMERCE.SALES}`] = this.wooCommerceService.getSales;
    this.resetRepo[`${SERVICES.WOOCOMMERCE}-${TYPES.WOOCOMMERCE.SALES}`] = this.wooCommerceService.resetSales;
    this.refreshRepo[`${SERVICES.WOOCOMMERCE}-${TYPES.WOOCOMMERCE.SALES}`] = this.wooCommerceService.refreshSales;

  }

  handleOauth = async (serviceName, user, params) => {
    const handleOauth = this.oauthRepo[serviceName];
    if (handleOauth) {
      return await handleOauth(user, params);
    }
    else {
      throw new Error(`Could not find the handleOauth for service named '${serviceName}'.`);
    }
  }

  createNew = async (serviceName, user, params) => {
    const createNew = this.repoCreate[serviceName];
    if (createNew)
      return await createNew(user, params);
    throw new Error(`Could not find the createNew for service named '${serviceName}'.`);
  }

  runServiceFunc = async (widget, repository) => {
    if (!widget.settings) {
      throw new FriendlyError('The widget is not set up yet.');
    }
    const widgetType = `${widget.service}-${widget.type}`;
    const func = repository[widgetType];
    if (!func) {
      console.error(`Could not find a function in the repository for (${widgetType}).`);
      throw new FriendlyError(`Could not find the function for this operation.`);
    }
    return await func(widget.settings);
  }

  resetMetrics  = async (widget) => {
    try {
      const data = this.runServiceFunc(widget, this.resetRepo);
      this.db.collection('Widget').updateOne({ '_id': ObjectID(widget._id) }, { $set: { 
        'enabled': true, 
        'refreshedOn': new Date(),
        'lastIssue': null 
      }});
      return data;
    }
    catch (err) {
      const isFriendlyError = err instanceof FriendlyError;
      if (isFriendlyError) {
        // Disable the widget, the user should do something about it.
        this.db.collection('Widget').updateOne({ '_id': ObjectID(widget._id) }, { $set: { 
          'enabled': false, 
          'lastIssue': { date: new Date(), error: err.toString() }
        }});
      }
      throw err;
    }
  }

  getMetrics = async (widget) => {
    return this.runServiceFunc(widget, this.metricRepo);
  }

  refresh = async (widget) => {
    try {
      const data = await this.runServiceFunc(widget, this.refreshRepo);
      this.db.collection('Widget').updateOne({ '_id': ObjectID(widget._id) }, { $set: {
        'enabled': true, 
        'refreshedOn': new Date(),
        'lastIssue': null 
      }});
      return data;
    }
    catch (err) {
      const isFriendlyError = err instanceof FriendlyError;
      const isDisconnected = err instanceof ServiceDisconnectedError;
      const isNotAutorized = err instanceof ServiceNotAuthorizedError;
      if (isFriendlyError || isDisconnected || isNotAutorized) {
        // Disable the widget, the user should do something about it.
        console.log(`[INFO] Widget ${widget._id} has been disabled.`);
        this.db.collection('Widget').updateOne({ '_id': ObjectID(widget._id) }, { $set: { 
          'enabled': false, 
          'lastIssue': { date: new Date(), error: err.message }
        }});
      }
      throw err;
    }
  }

}

export default Services;