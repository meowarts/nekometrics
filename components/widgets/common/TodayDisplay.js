import { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import DayJS from 'dayjs';
import CountUp from 'react-countup';
import { Tooltip, Zoom } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { goalForChart } from './StandardChart';

// Same half-day step back as aggregateSeries: points are stored as the end of
// their day on the server, which reads as the next morning further east.
const dayOf = (date) => DayJS(date).subtract(12, 'hour').format('YYYY-MM-DD');

const money = (value) => `$${Math.round(value).toLocaleString('en-US')}`;


// The first value is printed as is; only later changes count up, from the
// number already on screen, so a sale landing during the day is visible.
const Amount = ({ value }) => {
  const opening = useRef(Math.round(value));
  return <CountUp prefix="$" separator=" " preserveValue={true} start={opening.current} end={Math.round(value)} />;
};

Amount.propTypes = { value: PropTypes.number };

// Styles are read here, not passed down: babel-plugin-styled-components
// claims any prop named css, and the gauge received undefined.
const Gauge = ({ value, goal, expected, color }) => {
  const css = useStyles();
  const filled = Math.min(value / goal, 1) * 100;
  return (
    <div className={css.gauge}>
      <div className={css.fill} style={{ width: `${filled}%`, background: color }} />
      {expected !== undefined && <div className={css.tick} style={{ left: `${expected * 100}%` }} />}
    </div>
  );
};

Gauge.propTypes = {
  value: PropTypes.number,
  goal: PropTypes.number,
  expected: PropTypes.number,
  color: PropTypes.string
};

const USUAL_DAYS = 28;

// The share of a day's earnings usually made by now, read between the hours.
const shareByNow = (shares, now) => {
  const hour = now.hour();
  const before = hour > 0 ? shares[hour - 1] : 0;
  return before + (shares[hour] - before) * now.minute() / 60;
};

/**
 * Yesterday's total next to today's running one, each against the daily share
 * of the monthly target. Today also carries a tick for what is usually made by
 * this hour, from the store's own sales, or every quiet morning would read as
 * behind. Without that curve, the tick falls back to an even pace towards the goal.
 *
 * Yesterday and today come from the store's own sales when the service sends
 * them (live.days, in the store's timezone), since the daily series is cut in
 * UTC. "Now" is the browser's clock while those days and the curve are in the
 * store's hours, so things drift if the two timezones are far apart.
 */
const TodayDisplay = ({ widget, data, color, live }) => {
  const css = useStyles();
  const goal = goalForChart(widget.target, 'flow', 'day');

  const { today, yesterday, byNow } = useMemo(() => {
    const byDay = new Map((data || []).map(x => [ dayOf(x.date), x.value ]));
    const now = DayJS();
    const todayKey = now.format('YYYY-MM-DD');
    const finished = [ ...byDay.entries() ]
      .filter(([ day ]) => day < todayKey).slice(-USUAL_DAYS).map(([ , value ]) => value);
    const usualDay = finished.length ? finished.reduce((a, b) => a + b, 0) / finished.length : 0;
    const usual = live?.shares?.length === 24 && usualDay > 0;
    const days = live?.days || Object.fromEntries(byDay);
    return {
      today: days[todayKey] || 0,
      yesterday: days[now.subtract(1, 'day').format('YYYY-MM-DD')] || 0,
      byNow: usual
        ? { value: usualDay * shareByNow(live.shares, now), usual: true }
        : { value: goal ? goal * now.diff(now.startOf('day')) / 86400000 : 0, usual: false }
    };
  }, [data, live, goal]);

  // Short on purpose: the gauge already shows how far, the goal itself is in the tooltip.
  const percentOf = (value) => `${Math.round(value / goal * 100)}%`;

  const todayNote = () => {
    if (!goal) {
      return 'so far';
    }
    if (today >= goal) {
      return '✓ hit';
    }
    return `${percentOf(today)} · ${today >= byNow.value ? 'ahead' : 'behind'}`;
  };

  const yesterdayNote = () => {
    if (!goal) {
      return 'full day';
    }
    return yesterday >= goal ? '✓ hit' : percentOf(yesterday);
  };

  const goalHelp = goal ? `Daily goal: ${money(goal)}, the monthly target spread over the month.` : '';
  const tickHelp = byNow.usual
    ? `The tick is what you usually have by this time: ${money(byNow.value)}, from the last four weeks.`
    : `The tick is where today should be by now (${money(byNow.value)}), if sales came evenly through the day.`;

  return (
    <div className={css.container}>
      <div className={css.column}>
        <div className={css.label}>Yesterday</div>
        <div className={css.value}><Amount value={yesterday} /></div>
        {goal && <Tooltip TransitionComponent={Zoom} placement="bottom" title={goalHelp}>
          <div><Gauge value={yesterday} goal={goal} color={color} /></div>
        </Tooltip>}
        <div className={css.note}>{yesterdayNote()}</div>
      </div>
      <div className={css.column}>
        {/* So a stale number can be told apart from a slow day. */}
        <div className={css.label}>
          Today{live?.updatedOn && <span className={css.updated}> · {DayJS(live.updatedOn).format('HH:mm')}</span>}
        </div>
        <div className={css.value}><Amount value={today} /></div>
        {goal && <Tooltip TransitionComponent={Zoom} placement="bottom"
          title={<>{goalHelp}<br />{tickHelp}</>}>
          <div><Gauge value={today} goal={goal} expected={Math.min(byNow.value / goal, 1)} color={color} /></div>
        </Tooltip>}
        <div className={css.note}>{todayNote()}</div>
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    alignSelf: 'stretch',
    display: 'flex',
    justifyContent: 'space-around',
    gap: 20,
    marginBottom: 6,
    color: '#FCFCFC',
    fontFamily: theme.fonts.FAMILY.ROBOTO,
    fontVariantNumeric: 'tabular-nums'
  },
  column: {
    flex: 1,
    maxWidth: 220,
    textAlign: 'center'
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.5
  },
  updated: {
    fontWeight: 400,
    letterSpacing: 0
  },
  value: {
    fontSize: 26,
    fontWeight: 500,
    lineHeight: 1.15,
    marginBottom: 4
  },
  gauge: {
    position: 'relative',
    height: 6,
    borderRadius: 3,
    background: '#ffffff1f'
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.6s ease'
  },
  tick: {
    position: 'absolute',
    top: -3,
    bottom: -3,
    width: 2,
    marginLeft: -1,
    borderRadius: 1,
    background: '#ffffffc0'
  },
  note: {
    marginTop: 4,
    fontSize: 11,
    opacity: 0.6,
    whiteSpace: 'nowrap'
  }
}));

// How much taller this is than the single number a chart normally sits under.
TodayDisplay.EXTRA_HEIGHT = 30;

TodayDisplay.propTypes = {
  widget: PropTypes.object,
  data: PropTypes.array,
  color: PropTypes.string,
  live: PropTypes.object
};

export default TodayDisplay;
