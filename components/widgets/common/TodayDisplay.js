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

const shortMoney = (value) => (value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : money(value));

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

/**
 * Yesterday's total next to today's running one, each against the daily share
 * of the monthly target. Today also carries a tick for where it should be by
 * now, or every morning would read as behind.
 *
 * "Now" is the browser's clock. The store splits days in its own WordPress
 * timezone, so the tick drifts if the two are far apart.
 */
const TodayDisplay = ({ widget, data, color }) => {
  const css = useStyles();
  const goal = goalForChart(widget.target, 'flow', 'day');

  const { today, yesterday, elapsed } = useMemo(() => {
    const byDay = new Map((data || []).map(x => [ dayOf(x.date), x.value ]));
    const now = DayJS();
    return {
      today: byDay.get(now.format('YYYY-MM-DD')) || 0,
      yesterday: byDay.get(now.subtract(1, 'day').format('YYYY-MM-DD')) || 0,
      elapsed: now.diff(now.startOf('day')) / 86400000
    };
  }, [data]);

  const todayNote = () => {
    if (!goal) {
      return 'so far';
    }
    if (today >= goal) {
      return `Goal of ${shortMoney(goal)} hit`;
    }
    const ahead = today >= goal * elapsed;
    return `${Math.round(today / goal * 100)}% of ${shortMoney(goal)}, ${ahead ? 'ahead' : 'behind'}`;
  };

  const yesterdayNote = () => {
    if (!goal) {
      return 'full day';
    }
    return yesterday >= goal ? `Goal of ${shortMoney(goal)} hit` : `${Math.round(yesterday / goal * 100)}% of ${shortMoney(goal)}`;
  };

  return (
    <div className={css.container}>
      <div className={css.column}>
        <div className={css.label}>Yesterday</div>
        <div className={css.value}><Amount value={yesterday} /></div>
        {goal && <Gauge value={yesterday} goal={goal} color={color} />}
        <div className={css.note}>{yesterdayNote()}</div>
      </div>
      <div className={css.column}>
        <div className={css.label}>Today</div>
        <div className={css.value}><Amount value={today} /></div>
        {goal && <Tooltip TransitionComponent={Zoom} placement="bottom"
          title={`The tick is where today should be by now (${money(goal * elapsed)}), if sales came evenly through the day.`}>
          <div><Gauge value={today} goal={goal} expected={elapsed} color={color} /></div>
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
  color: PropTypes.string
};

export default TodayDisplay;
