import {
  Timeline, ShowChart, BarChart, PieChart, BubbleChart, TrendingUp, TrendingDown, Equalizer,
  Language, Public, Dns, Cloud, Http, Link, RssFeed, Devices, PhoneIphone, DesktopWindows,
  AttachMoney, EuroSymbol, MonetizationOn, CreditCard, AccountBalance, AccountBalanceWallet,
  ShoppingCart, ShoppingBasket, Store, Storefront, LocalOffer, Receipt, Loyalty, Redeem,
  Person, PersonAdd, People, PeopleOutline, Group, GroupAdd, SupervisorAccount, EmojiPeople,
  Favorite, FavoriteBorder, ThumbUp, Star, StarBorder, Grade, Whatshot, EmojiEvents,
  Email, MarkunreadMailbox, Drafts, Send, Chat, Comment, Forum, QuestionAnswer,
  Visibility, RemoveRedEye, TouchApp, Mouse, Search, FilterList, Bookmark, Flag,
  Extension, Build, Settings, Code, BugReport, Storage, Memory, Speed,
  Description, Subject, MenuBook, LibraryBooks, Photo, PhotoLibrary, Movie, MusicNote,
  FlightTakeoff, Hotel, Map, Place, DirectionsCar, Train, Restaurant, BeachAccess,
  Notifications, Schedule, Today, DateRange, Update, Alarm, CheckCircle, Warning,
  Pets, Face, Mood, LocalCafe, Cake, EmojiObjects, AcUnit, WbSunny
} from '@material-ui/icons';

/**
 * A hand-picked shelf rather than the whole Material set: a few thousand icons
 * in a picker is not a choice, it is a search problem. These are grouped the
 * way someone looking for one would think, and every name is stable so a saved
 * widget keeps its icon.
 */
const WIDGET_ICONS = [
  { group: 'Charts', items: { Timeline, ShowChart, BarChart, PieChart, BubbleChart, TrendingUp, TrendingDown, Equalizer } },
  { group: 'Web', items: { Language, Public, Dns, Cloud, Http, Link, RssFeed, Devices, PhoneIphone, DesktopWindows } },
  { group: 'Money', items: { AttachMoney, EuroSymbol, MonetizationOn, CreditCard, AccountBalance, AccountBalanceWallet } },
  { group: 'Shop', items: { ShoppingCart, ShoppingBasket, Store, Storefront, LocalOffer, Receipt, Loyalty, Redeem } },
  { group: 'People', items: { Person, PersonAdd, People, PeopleOutline, Group, GroupAdd, SupervisorAccount, EmojiPeople } },
  { group: 'Applause', items: { Favorite, FavoriteBorder, ThumbUp, Star, StarBorder, Grade, Whatshot, EmojiEvents } },
  { group: 'Messages', items: { Email, MarkunreadMailbox, Drafts, Send, Chat, Comment, Forum, QuestionAnswer } },
  { group: 'Attention', items: { Visibility, RemoveRedEye, TouchApp, Mouse, Search, FilterList, Bookmark, Flag } },
  { group: 'Making', items: { Extension, Build, Settings, Code, BugReport, Storage, Memory, Speed } },
  { group: 'Content', items: { Description, Subject, MenuBook, LibraryBooks, Photo, PhotoLibrary, Movie, MusicNote } },
  { group: 'Travel', items: { FlightTakeoff, Hotel, Map, Place, DirectionsCar, Train, Restaurant, BeachAccess } },
  { group: 'Time', items: { Notifications, Schedule, Today, DateRange, Update, Alarm, CheckCircle, Warning } },
  { group: 'Fun', items: { Pets, Face, Mood, LocalCafe, Cake, EmojiObjects, AcUnit, WbSunny } }
];

const ICONS_BY_NAME = WIDGET_ICONS.reduce((all, group) => {
  Object.keys(group.items).forEach(name => { all[name] = group.items[name] });
  return all;
}, {});

const getIconByName = (name) => (name && ICONS_BY_NAME[name]) ? ICONS_BY_NAME[name] : null;

export { WIDGET_ICONS, ICONS_BY_NAME, getIconByName };
