import { Twitter, Facebook, AlternateEmail, Timeline, AttachMoney, Store, Pets } from '@material-ui/icons';
import EddAddDialog from './EddAddDialog';
import WooCommerceAddDialog from './WooCommerceAddDialog';

// https://www.materialui.co/socialcolors

const ServicesRepository = [
  {
    title: 'Google Analytics',
    name: 'google',
    color: '#dd4b39',
    mode: 'oauth',
    image: '/google-logo.png',
    text: 'Google',
    icon: Timeline
  }, {
    title: 'Facebook & Instagram',
    name: 'facebook',
    color: '#3b5999',
    mode: 'oauth',
    image: '/facebook-logo.png',
    text: 'Facebook & Instagram',    
    icon: Facebook
  }, {
    title: 'Mailchimp',
    name: 'mailchimp',
    color: '#74564A',
    mode: 'oauth',
    image: '/mailchimp-logo.png',
    text: 'Mailchimp',
    icon: AlternateEmail,
  }, {
    title: 'Easy Digital Downloads',
    name: 'edd',
    color: '#000000',
    mode: 'dialog',
    image: '/edd-logo.png',
    text: 'Easy Digital Downloads',
    icon: AttachMoney,
    configDialog: EddAddDialog,
    //EddAddDialog: EddAddDialog
  }, {
    title: 'Twitter',
    name: 'twitter',
    color: '#1DA1F2',
    mode: 'oauth',
    image: '/twitter-logo.png',
    text: 'Twitter',    
    icon: Twitter
  }, {
    title: 'WooCommerce',
    name: 'woocommerce',
    color: '#7f54b3',
    mode: 'dialog',
    image: '/woo-logo.png',
    text: 'WooCommerce',
    icon: Store,
    configDialog: WooCommerceAddDialog,
    //WooCommerceAddDialog: WooCommerceAddDialog
  }, {
    title: 'Fake (Random Data)',
    name: 'fake',
    color: '#3b5999',
    mode: 'none',
    image: '/facebook-logo.png',
    text: 'Fake',    
    icon: Pets
  }
];

export { ServicesRepository };