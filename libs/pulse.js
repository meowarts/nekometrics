import DayJS from 'dayjs';

/**
 * One verdict per card, on rules that are the same for every card, which is
 * what the cards themselves cannot give: each one compares over its own range,
 * so +195% on one and +2% on the next were never measuring the same thing.
 *
 * A flow (visits, revenue, downloads) is the last seven complete days against
 * the seven before, or four weeks against four for a source that is quiet most
 * days, where one week is too few events to mean anything. A level (followers, subscribers) is where it stands and how
 * far it moved in seven and in thirty days. A target, when there is one, turns
 * either into "on pace" or "behind", and that verdict wins over the trend.
 */

// Week to week, traffic and sales wobble by this much on their own.
const FLOW_STEADY_PERCENT = 15;
// Under this, a percentage says more about the small base than the change.
const FLOW_MINIMUM_BASE = 10;
// A level moving less than this in thirty days is holding still. Both have to
// be crossed: a big account bleeding slowly only shows in the percentage, and on
// a small one two followers would otherwise be a trend.
const STOCK_STEADY_PERCENT = 0.15;
const STOCK_STEADY_COUNT = 10;
// A flow with something on fewer days than this, out of the last 28, is too
// sparse for a single week: one booking more or less swung it by a third.
const SPARSE_ACTIVE_DAYS = 14;
const SHORT_WINDOW = 7;
const LONG_WINDOW = 28;
// Older than this and the card is showing yesterday's news as today's.
const STALE_DAYS = 2;

const dayKey = (date) => DayJS(date).subtract(12, 'hour').format('YYYY-MM-DD');

const toDays = (data) => {
  const days = new Map();
  // Google Analytics hands back { data, by } instead of the list itself, and
  // looping over that object took the whole dashboard down. Only daily rows can
  // be compared day by day, so a series already rolled into months is skipped.
  const rows = Array.isArray(data) ? data
    : (data && Array.isArray(data.data) && (data.by || 'day') === 'day') ? data.data : [];
  for (const row of rows) {
    if (!row || !row.date || typeof row.value !== 'number' || isNaN(row.value)) {
      continue;
    }
    const key = dayKey(row.date);
    days.set(key, row.value);
  }
  return Array.from(days.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([key, value]) => ({ key, value }));
};

const shiftKey = (key, days) => DayJS(key).add(days, 'day').format('YYYY-MM-DD');

const sumBetween = (days, fromKey, toKey) =>
  days.reduce((sum, x) => (x.key >= fromKey && x.key <= toKey) ? sum + x.value : sum, 0);

const valueAt = (days, key) => {
  let found = null;
  for (const x of days) {
    if (x.key > key) {
      break;
    }
    found = x.value;
  }
  return found;
};

const percent = (now, before) => (before ? ((now - before) / Math.abs(before)) * 100 : null);

const flowPulse = (days, today, target) => {
  // Today is still happening, so the week ends on the last finished day. The
  // last day present, not yesterday by the calendar: a source that reports a day
  // late would otherwise lose a whole day and always read as a drop.
  const complete = days.filter(x => x.key < today);
  if (!complete.length) {
    return null;
  }
  const anchor = complete[complete.length - 1].key;
  const recentStart = shiftKey(anchor, -(LONG_WINDOW - 1));
  const activeDays = complete.filter(x => x.key >= recentStart && x.value !== 0).length;
  const window = activeDays < SPARSE_ACTIVE_DAYS ? LONG_WINDOW : SHORT_WINDOW;
  const thisPeriod = sumBetween(complete, shiftKey(anchor, -(window - 1)), anchor);
  const lastPeriod = sumBetween(complete, shiftKey(anchor, -(window * 2 - 1)), shiftKey(anchor, -window));
  const hasTwoPeriods = complete[0].key <= shiftKey(anchor, -(window * 2 - 1));
  const change = (hasTwoPeriods && Math.abs(lastPeriod) >= FLOW_MINIMUM_BASE) ? percent(thisPeriod, lastPeriod) : null;

  let verdict = 'steady';
  if (change !== null && change >= FLOW_STEADY_PERCENT) {
    verdict = 'good';
  }
  else if (change !== null && change <= -FLOW_STEADY_PERCENT) {
    verdict = 'bad';
  }

  let pace = null;
  if (target) {
    // This month so far, stretched to the whole month. Before a single day of
    // it has finished, or when the card's range starts after the 1st, the last
    // four weeks stand in for it.
    const monthStart = DayJS(today).startOf('month').format('YYYY-MM-DD');
    const daysInMonth = DayJS(today).daysInMonth();
    const coversMonth = anchor >= monthStart && complete[0].key <= monthStart;
    const projected = coversMonth
      ? sumBetween(complete, monthStart, anchor) / DayJS(anchor).date() * daysInMonth
      : sumBetween(complete, shiftKey(anchor, -27), anchor) / 28 * daysInMonth;
    const ratio = projected / target;
    pace = { projected, ratio };
    verdict = ratio >= 1 ? 'good' : ratio >= 0.9 ? 'steady' : 'bad';
  }

  return { kind: 'flow', anchor, window, value: thisPeriod, previous: lastPeriod, change, verdict, pace };
};

const stockPulse = (days, target) => {
  const last = days[days.length - 1];
  const anchor = last.key;
  const weekAgo = valueAt(days, shiftKey(anchor, -7));
  const monthAgo = valueAt(days, shiftKey(anchor, -30));
  const week = weekAgo !== null && days[0].key <= shiftKey(anchor, -7) ? last.value - weekAgo : null;
  const month = monthAgo !== null && days[0].key <= shiftKey(anchor, -30) ? last.value - monthAgo : null;
  const monthPercent = month !== null ? percent(last.value, monthAgo) : null;

  const moved = month !== null && Math.abs(month) >= STOCK_STEADY_COUNT;
  let verdict = 'steady';
  if (moved && monthPercent >= STOCK_STEADY_PERCENT) {
    verdict = 'good';
  }
  else if (moved && monthPercent <= -STOCK_STEADY_PERCENT) {
    verdict = 'bad';
  }

  let pace = null;
  if (target) {
    const remaining = target - last.value;
    const perDay = month !== null ? month / 30 : null;
    if (remaining <= 0) {
      pace = { reached: true };
      verdict = 'good';
    }
    else if (perDay === null) {
      pace = { remaining, months: null };
    }
    else if (perDay <= 0) {
      pace = { remaining, months: Infinity };
      verdict = 'bad';
    }
    else {
      pace = { remaining, months: remaining / perDay / 30 };
      verdict = pace.months <= 12 ? 'good' : 'steady';
    }
  }

  return { kind: 'stock', anchor, value: last.value, week, month, monthPercent, verdict, pace };
};

const computePulse = (data, kind, target = null, now = new Date()) => {
  if (kind !== 'flow' && kind !== 'stock') {
    return null;
  }
  const days = toDays(data);
  if (!days.length) {
    return null;
  }
  const today = DayJS(now).format('YYYY-MM-DD');
  const pulse = kind === 'flow' ? flowPulse(days, today, target) : stockPulse(days, target);
  if (!pulse) {
    return null;
  }
  const age = DayJS(today).diff(DayJS(days[days.length - 1].key), 'day');
  if (age > STALE_DAYS) {
    return { ...pulse, verdict: 'stale', since: days[days.length - 1].key };
  }
  return pulse;
};

const VERDICT_ORDER = { stale: 0, bad: 1, good: 2, steady: 3 };

export { computePulse, VERDICT_ORDER, FLOW_STEADY_PERCENT };
