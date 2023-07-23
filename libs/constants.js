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
}

const SERVICES = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  MAILCHIMP: 'mailchimp',
  WOOCOMMERCE: 'woocommerce',
  EDD: 'edd'
}

const DAILY_REFRESH_WIDGETS = [
  `${SERVICES.EDD}-${TYPES.EDD.EARNINGS}`,
  `${SERVICES.WOOCOMMERCE}-${TYPES.WOOCOMMERCE.SALES}`,
  `${SERVICES.MAILCHIMP}-${TYPES.MAILCHIMP.SUBSCRIBERS}`,
  `${SERVICES.FACEBOOK}-${TYPES.FACEBOOK.IG_FOLLOWERS}`,
  `${SERVICES.FACEBOOK}-${TYPES.FACEBOOK.PAGE_LIKES}`,
  `${SERVICES.TWITTER}-${TYPES.TWITTER.FOLLOWERS}`
];

export { TYPES, SERVICES, DAILY_REFRESH_WIDGETS }