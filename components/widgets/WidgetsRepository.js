import { Instagram, AlternateEmail, Timeline, AttachMoney, Store, Twitter, Pets, Facebook } from '@material-ui/icons';
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

import GoogleHistoryUsersSettings from './google/AnalyticsVisitsSettings';
import IgFollowersSettings from './facebook/IgFollowersSettings';
import MailchimpSubscribersSettings from './mailchimp/SubscribersSettings';
import EddEarningsSettings from './edd/EarningsSettings';
import TwitterFollowersSettings from './twitter/FollowersSettings';
import WooCommerceSalesSettings from './woocommerce/SalesSettings';
import FacebookPageLikesSettings from './facebook/PageLikesSettings';
import FacebookPageLikes from './facebook/PageLikes';

import FakeHistoricalSettings from './fake/HistoricalSettings';

import { SERVICES, TYPES } from '~/libs/constants';

const WidgetsRepository = [
  {
    title: 'Analytics',
    description: 'Visits & Views',
    service: SERVICES.GOOGLE,
    type: TYPES.GOOGLE.ANALYTICS_VISITS,
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
    icon: Facebook,
    subIcon: ThumbUpAltOutlinedIcon,
    widget: FacebookPageLikes,
    settings: FacebookPageLikesSettings
  }, {
    title: 'Followers',
    description: 'Growth',
    service: SERVICES.TWITTER,
    type: TYPES.TWITTER.FOLLOWERS,
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
    icon: Store,
    subIcon: EuroOutlinedIcon,
    widget: WooCommerceSales,
    settings: WooCommerceSalesSettings,
    color: '#7f54b3'
  }, {
    title: 'Audience',
    description: 'Growth',
    service: 'fake',
    type: 'historical',
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