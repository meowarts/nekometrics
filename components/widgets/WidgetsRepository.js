import { Instagram, AlternateEmail, Timeline, AttachMoney, Store, Twitter, Pets, Facebook, Language, Extension, PieChart, ShowChart, FlightTakeoff } from '@material-ui/icons';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import FaceOutlinedIcon from '@material-ui/icons/FaceOutlined';
import ThumbUpAltOutlinedIcon from '@material-ui/icons/ThumbUpAltOutlined';
import EuroOutlinedIcon from '@material-ui/icons/EuroOutlined';

import GoogleAnalyticsVisits from './google/AnalyticsVisits';
import FacebookIgFollowers from './facebook/IgFollowers';
import MailchimpSubscribers from './mailchimp/Subscribers';
import FakeHistorical from './fake/Historical';
// import AdsHistorical from './facebook/Historical';
import TwitterFollowers from './twitter/Followers';
import WooCommerceSales from './woocommerce/Sales';
import EddEarnings from './edd/Earnings';
import WordPressMetric from './wordpress/Metric';
import WordPressOrgPlugin from './wordpressorg/Plugin';
import WordPressOrgPortfolio from './wordpressorg/Portfolio';
import PlausibleTraffic from './plausible/Traffic';
import TravelPayoutsStats from './travelpayouts/Stats';

import GoogleHistoryUsersSettings from './google/AnalyticsVisitsSettings';
import IgFollowersSettings from './facebook/IgFollowersSettings';
import MailchimpSubscribersSettings from './mailchimp/SubscribersSettings';
import EddEarningsSettings from './edd/EarningsSettings';
import TwitterFollowersSettings from './twitter/FollowersSettings';
import WooCommerceSalesSettings from './woocommerce/SalesSettings';
import FacebookPageLikesSettings from './facebook/PageLikesSettings';
import FacebookPageLikes from './facebook/PageLikes';

import WordPressMetricSettings from './wordpress/MetricSettings';
import WordPressOrgPluginSettings from './wordpressorg/PluginSettings';
import WordPressOrgPortfolioSettings from './wordpressorg/PortfolioSettings';
import PlausibleTrafficSettings from './plausible/TrafficSettings';
import TravelPayoutsStatsSettings from './travelpayouts/StatsSettings';
import FakeHistoricalSettings from './fake/HistoricalSettings';

import { SERVICES, TYPES } from '~/libs/constants';

const WidgetsRepository = [
  {
    title: 'Analytics',
    description: 'Visits & Views',
    service: SERVICES.GOOGLE,
    type: TYPES.GOOGLE.ANALYTICS_VISITS,
    kind: 'flow',
    icon: Timeline,
    subIcon: VisibilityOutlinedIcon,
    widget: GoogleAnalyticsVisits,
    settings: GoogleHistoryUsersSettings,
    color: '#E37400'
  }, {
    title: 'Instagram Followers',
    description: 'Growth',
    service: SERVICES.FACEBOOK,
    type: TYPES.FACEBOOK.IG_FOLLOWERS,
    kind: 'stock',
    icon: Instagram,
    subIcon: FaceOutlinedIcon,
    widget: FacebookIgFollowers,
    settings: IgFollowersSettings,
    color: '#3b5999'
  }, {
    title: 'Page Likes',
    description: 'Growth',
    service: SERVICES.FACEBOOK,
    type: TYPES.FACEBOOK.PAGE_LIKES,
    kind: 'stock',
    icon: Facebook,
    subIcon: ThumbUpAltOutlinedIcon,
    widget: FacebookPageLikes,
    settings: FacebookPageLikesSettings
  }, {
    title: 'Followers',
    description: 'Growth',
    service: SERVICES.TWITTER,
    type: TYPES.TWITTER.FOLLOWERS,
    kind: 'stock',
    icon: Twitter,
    subIcon: FaceOutlinedIcon,
    widget: TwitterFollowers,
    settings: TwitterFollowersSettings,
    color: '#1DA1F2'
  }, {
    title: 'Subscribers',
    description: 'Growth',
    service: SERVICES.MAILCHIMP,
    type: TYPES.MAILCHIMP.SUBSCRIBERS,
    kind: 'stock',
    icon: AlternateEmail,
    subIcon: VisibilityOutlinedIcon,
    widget: MailchimpSubscribers,
    settings: MailchimpSubscribersSettings,
    color: '#007ee5'
  }, {
    title: 'Revenue',
    description: 'Growth',
    service: SERVICES.EDD,
    type: TYPES.EDD.EARNINGS,
    kind: 'flow',
    icon: AttachMoney,
    subIcon: EuroOutlinedIcon,
    widget: EddEarnings,
    settings: EddEarningsSettings,
    color: '#3aaf85'
  }, {
    title: 'Revenue',
    description: 'Growth',
    service: SERVICES.WOOCOMMERCE,
    type: TYPES.WOOCOMMERCE.SALES,
    kind: 'flow',
    icon: Store,
    subIcon: EuroOutlinedIcon,
    widget: WooCommerceSales,
    settings: WooCommerceSalesSettings,
    color: '#7f54b3'
  }, {
    title: 'WordPress',
    description: 'Any metric from your site',
    service: SERVICES.WORDPRESS,
    type: TYPES.WORDPRESS.METRIC,
    kind: 'stock',
    icon: Language,
    subIcon: VisibilityOutlinedIcon,
    widget: WordPressMetric,
    settings: WordPressMetricSettings,
    color: '#21759b'
  }, {
    title: 'Plugin',
    description: 'Downloads & installs',
    service: SERVICES.WORDPRESSORG,
    type: TYPES.WORDPRESSORG.PLUGIN,
    kind: 'flow',
    icon: Extension,
    subIcon: VisibilityOutlinedIcon,
    widget: WordPressOrgPlugin,
    settings: WordPressOrgPluginSettings,
    color: '#3858e9'
  }, {
    title: 'All Plugins',
    description: 'Share of installs',
    service: SERVICES.WORDPRESSORG,
    type: TYPES.WORDPRESSORG.PORTFOLIO,
    kind: 'none',
    icon: PieChart,
    subIcon: VisibilityOutlinedIcon,
    widget: WordPressOrgPortfolio,
    settings: WordPressOrgPortfolioSettings,
    color: '#3858e9'
  }, {
    title: 'Traffic',
    description: 'Visitors & pageviews',
    service: SERVICES.PLAUSIBLE,
    type: TYPES.PLAUSIBLE.TRAFFIC,
    kind: 'flow',
    icon: ShowChart,
    subIcon: VisibilityOutlinedIcon,
    widget: PlausibleTraffic,
    settings: PlausibleTrafficSettings,
    color: '#5850ec'
  }, {
    title: 'Affiliate',
    description: 'Clicks, bookings, earnings',
    service: SERVICES.TRAVELPAYOUTS,
    type: TYPES.TRAVELPAYOUTS.STATS,
    kind: 'flow',
    icon: FlightTakeoff,
    subIcon: EuroOutlinedIcon,
    widget: TravelPayoutsStats,
    settings: TravelPayoutsStatsSettings,
    color: '#1c7ed6'
  }, {
    title: 'Audience',
    description: 'Growth',
    service: 'fake',
    type: 'historical',
    kind: 'flow',
    icon: Pets,
    subIcon: VisibilityOutlinedIcon,
    widget: FakeHistorical,
    settings: FakeHistoricalSettings
  }
];

const getWidgetSpine = (widget) => {
  if (widget) {
    const spine = WidgetsRepository.find(x => { return x.service === widget.service && x.type === widget.type });
    return spine;
  }
  return null;
}

export { WidgetsRepository, getWidgetSpine };