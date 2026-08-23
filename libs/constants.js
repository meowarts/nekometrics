const TYPES = {
  GOOGLE: {
    ANALYTICS_VISITS: 'analytics-visits'
  },
  FACEBOOK: {
    PAGE_LIKES: 'page-likes',
    IG_FOLLOWERS: 'ig-followers'
  },
  TWITTER: {
    FOLLOWERS: 'followers'
  },
  MAILCHIMP: {
    SUBSCRIBERS: 'subscribers'
  },
  WOOCOMMERCE: {
    SALES: 'sales'
  },
  EDD: {
    EARNINGS: 'earnings'
  },
  WORDPRESS: {
    METRIC: 'metric'
  },
  WORDPRESSORG: {
    PLUGIN: 'plugin',
    PORTFOLIO: 'portfolio'
  },
  PLAUSIBLE: {
    TRAFFIC: 'traffic'
  },
  TRAVELPAYOUTS: {
    STATS: 'stats'
  },
}

const SERVICES = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  MAILCHIMP: 'mailchimp',
  WOOCOMMERCE: 'woocommerce',
  EDD: 'edd',
  WORDPRESS: 'wordpress',
  WORDPRESSORG: 'wordpressorg',
  PLAUSIBLE: 'plausible',
  TRAVELPAYOUTS: 'travelpayouts'
}

const DAILY_REFRESH_WIDGETS = [
  `${SERVICES.EDD}-${TYPES.EDD.EARNINGS}`,
  `${SERVICES.WOOCOMMERCE}-${TYPES.WOOCOMMERCE.SALES}`,
  `${SERVICES.MAILCHIMP}-${TYPES.MAILCHIMP.SUBSCRIBERS}`,
  `${SERVICES.FACEBOOK}-${TYPES.FACEBOOK.IG_FOLLOWERS}`,
  `${SERVICES.FACEBOOK}-${TYPES.FACEBOOK.PAGE_LIKES}`,
  `${SERVICES.TWITTER}-${TYPES.TWITTER.FOLLOWERS}`,
  `${SERVICES.WORDPRESS}-${TYPES.WORDPRESS.METRIC}`,
  `${SERVICES.WORDPRESSORG}-${TYPES.WORDPRESSORG.PLUGIN}`,
  `${SERVICES.WORDPRESSORG}-${TYPES.WORDPRESSORG.PORTFOLIO}`,
  `${SERVICES.PLAUSIBLE}-${TYPES.PLAUSIBLE.TRAFFIC}`,
  `${SERVICES.TRAVELPAYOUTS}-${TYPES.TRAVELPAYOUTS.STATS}`
];

/**
 * How often a widget is worth asking about, in minutes.
 *
 * The job used to refresh anything older than fifteen minutes, which for
 * numbers that change once a day means roughly ninety-six requests to observe
 * one new value. With thirty-one WordPress.org cards that came to some six
 * thousand calls a day at api.wordpress.org, which started refusing the
 * connections, and it is what timed out the MailPoet rebuild too.
 *
 * The floor is what the source can actually tell you. WordPress.org publishes
 * downloads a day late, so twice a day is already generous.
 */
const REFRESH_MINUTES = {
  [`${SERVICES.WORDPRESSORG}-${TYPES.WORDPRESSORG.PLUGIN}`]: 720,
  [`${SERVICES.WORDPRESSORG}-${TYPES.WORDPRESSORG.PORTFOLIO}`]: 720,
  [`${SERVICES.WORDPRESS}-${TYPES.WORDPRESS.METRIC}`]: 180,
  [`${SERVICES.TRAVELPAYOUTS}-${TYPES.TRAVELPAYOUTS.STATS}`]: 180
};

const DEFAULT_REFRESH_MINUTES = 60;

const refreshMinutesFor = (widget) => {
  const key = `${widget.service}-${widget.type}`;
  return REFRESH_MINUTES[key] ? REFRESH_MINUTES[key] : DEFAULT_REFRESH_MINUTES;
};

const NO_FORCE_REFRESH_WIDGETS = [
  `${SERVICES.GOOGLE}-${TYPES.GOOGLE.ANALYTICS_VISITS}`
];

export { TYPES, SERVICES, DAILY_REFRESH_WIDGETS, NO_FORCE_REFRESH_WIDGETS,
  REFRESH_MINUTES, DEFAULT_REFRESH_MINUTES, refreshMinutesFor }
