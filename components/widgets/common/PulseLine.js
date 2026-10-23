import { createContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import DayJS from 'dayjs';
import { Dialog, TextField, Tooltip, Zoom } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FlagOutlinedIcon from '@material-ui/icons/FlagOutlined';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';

import useGlobalState from '~/libs/context';
import { computePulse, FLOW_STEADY_PERCENT } from '~/libs/pulse';
import NekoButton from '~/components/buttons/NekoButton';
import { NekoDialogActionWrapper, NekoDialogContentWrapper } from '~/components/elements/NekoElements';

// The card's verdict, computed once and read by both the number at the top and
// the bar at the foot, so the two can never describe different periods.
const PulseContext = createContext(null);

// The bar is a bonus on top of the card, so a series it cannot read leaves it
// out rather than taking the card, or the dashboard, down with it.
const safePulse = (data, kind, target, widgetId) => {
  try {
    return computePulse(data, kind, target || null);
  }
  catch (err) {
    console.error('[Pulse] Could not read this card.', widgetId, err);
    return null;
  }
};

const periodName = (window) => (window === 7 ? 'week' : `${window / 7} weeks`);

const MONEY_METRICS = [ 'earnings', 'potential' ];

const currencyOf = (widget) => {
  const isStore = widget.service === 'edd' || widget.service === 'woocommerce';
  return (isStore || MONEY_METRICS.includes(widget?.settings?.metric)) ? '$' : '';
};

const compact = (value, prefix = '') => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1000000) {
    return `${sign}${prefix}${(abs / 1000000).toFixed(1)}M`;
  }
  if (abs >= 10000) {
    return `${sign}${prefix}${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}${prefix}${Math.round(abs).toLocaleString('en-US')}`;
};

const signed = (value, prefix = '') => (value > 0 ? '+' : '') + compact(value, prefix);

const describe = (pulse, prefix) => {
  if (pulse.verdict === 'stale') {
    return `No data since ${DayJS(pulse.since).format('MMM D')}`;
  }
  if (pulse.kind === 'flow') {
    // The number at the top already is this period, so the bar says how it compares.
    if (pulse.change === null) {
      return `Was ${compact(pulse.previous, prefix)} the ${periodName(pulse.window)} before`;
    }
    return `${pulse.change > 0 ? '+' : ''}${pulse.change.toFixed(0)}% vs the ${periodName(pulse.window)} before`;
  }
  const bits = [];
  if (pulse.week !== null) {
    bits.push(`${signed(pulse.week)} this week`);
  }
  if (pulse.month !== null) {
    bits.push(`${signed(pulse.month)} in 30 days`);
  }
  return bits.length ? bits.join(' · ') : 'Not enough history yet';
};

// With a target, the pace is the verdict, so it takes the line.
const describePace = (pulse, target, prefix) => {
  if (!pulse.pace || pulse.verdict === 'stale') {
    return null;
  }
  if (pulse.kind === 'flow') {
    return `On pace for ${compact(pulse.pace.projected, prefix)} of ${compact(target, prefix)} this month`;
  }
  if (pulse.pace.reached) {
    return `Target of ${compact(target, prefix)} reached`;
  }
  if (pulse.pace.months === null) {
    return `${compact(pulse.pace.remaining)} to go to ${compact(target)}`;
  }
  if (pulse.pace.months === Infinity) {
    return `${compact(pulse.pace.remaining)} to go, moving away from it`;
  }
  const months = pulse.pace.months;
  const when = months < 1 ? 'within a month' : months > 36 ? 'over 3 years away' : `about ${Math.round(months)} months away`;
  return `${compact(pulse.pace.remaining)} to go, ${when}`;
};

const explain = (kind, pulse) => kind === 'flow'
  ? `The last ${pulse.window} finished days against the ${pulse.window} before. Under ${FLOW_STEADY_PERCENT}% either way is steady.`
  : 'How far it moved in the last 7 and 30 days. Under 0.15% in 30 days is steady.';

const TargetDialog = ({ widget, kind, onClose }) => {
  const css = useStyles();
  const { modifyWidget } = useGlobalState();
  const [ value, setValue ] = useState(widget.target ? String(widget.target) : '');
  const [ busy, setBusy ] = useState(false);
  const isFlow = kind === 'flow';

  const save = async (target) => {
    setBusy(true);
    await modifyWidget(widget._id, { ...widget, target });
    setBusy(false);
    onClose();
  };

  const parsed = Number(value.replace(/[, ]/g, ''));
  const valid = value.trim() !== '' && isFinite(parsed) && parsed > 0;

  return (
    <Dialog open={true} onClose={onClose} fullWidth={true} maxWidth="xs" onMouseDown={(ev) => ev.stopPropagation()}>
      <h5 className={css.dialogTitle}>{widget.name}</h5>
      <NekoDialogContentWrapper>
        <p className={css.dialogText}>
          {isFlow
            ? 'What should this reach in a month? The card then says whether this month is on pace for it.'
            : 'What number are you aiming for? The card then says how far it is at the pace of the last 30 days.'}
        </p>
        <TextField autoFocus fullWidth variant="outlined" size="small" type="number"
          label={isFlow ? 'Monthly target' : 'Target'} value={value}
          onChange={(ev) => setValue(ev.target.value)}
          onKeyDown={(ev) => { if (ev.key === 'Enter' && valid) { save(parsed); } }} />
      </NekoDialogContentWrapper>
      <NekoDialogActionWrapper>
        {widget.target && <NekoButton quarternary style={{ marginRight: 10 }} disabled={busy}
          onClick={() => save(null)}>Remove</NekoButton>}
        <NekoButton tertiary disabled={busy || !valid} onClick={() => save(parsed)}>Save</NekoButton>
      </NekoDialogActionWrapper>
    </Dialog>
  );
};

// The colour lives in the icon alone: a whole bar of red or green on every
// card shouted louder than the numbers it was meant to frame.
const verdictIcon = (pulse) => {
  if (pulse.verdict === 'stale') {
    return SyncProblemIcon;
  }
  if (pulse.pace && pulse.verdict === 'good') {
    return CheckCircleOutlineIcon;
  }
  return { good: TrendingUpIcon, steady: TrendingFlatIcon, bad: TrendingDownIcon }[pulse.verdict];
};

// One figure per card: fourteen sentences at once were too much to read. The
// full sentence is still there on hover.
const glance = (pulse, target, prefix) => {
  if (pulse.verdict === 'stale') {
    return `No data since ${DayJS(pulse.since).format('MMM D')}`;
  }
  if (pulse.pace) {
    if (pulse.kind === 'flow') {
      return `${compact(pulse.pace.projected, prefix)} / ${compact(target, prefix)}`;
    }
    return pulse.pace.reached ? 'Reached' : `${compact(pulse.pace.remaining)} to go`;
  }
  if (pulse.kind === 'flow') {
    if (pulse.change === null) {
      return `was ${compact(pulse.previous, prefix)}`;
    }
    const percent = Math.round(pulse.change);
    return `${percent > 0 ? '+' : ''}${percent === 0 ? 0 : percent}%`;
  }
  if (pulse.week !== null) {
    return `${signed(pulse.week)} this week`;
  }
  return pulse.month !== null ? `${signed(pulse.month)} in 30 days` : 'Not enough history';
};

/**
 * A status bar along the foot of the card, judged on the same rules for every
 * card, which the old headline trend could not be: it compared over the card's
 * own range, so +195% on one card and +2% on the next never meant the same.
 */
const PulseLine = ({ widget, kind, pulse, editing, onEdit, onClose }) => {
  const css = useStyles();

  const line = useMemo(() => {
    if (!pulse) {
      return null;
    }
    const prefix = currencyOf(widget);
    return {
      verdict: pulse.verdict,
      Icon: verdictIcon(pulse),
      text: glance(pulse, widget.target, prefix),
      sentence: describePace(pulse, widget.target, prefix) || describe(pulse, prefix)
    };
  }, [pulse, widget]);

  if (!line) {
    return null;
  }

  const canEdit = widget.role !== 'read';

  return (
    <>
      <Tooltip TransitionComponent={Zoom} placement="bottom"
        title={<>{line.sentence}<div className={css.explain}>{explain(kind, pulse)}</div></>}>
        <button type="button" className={css.bar} disabled={!canEdit}
          onMouseDown={(ev) => ev.stopPropagation()} onClick={onEdit}>
          <line.Icon className={`${css.icon} ${css[line.verdict]}`} />
          <span className={css.text}>{line.text}</span>
          {canEdit && <FlagOutlinedIcon className={widget.target ? css.flagSet : css.flag} />}
        </button>
      </Tooltip>
      {editing && <TargetDialog widget={widget} kind={kind} onClose={onClose} />}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  // Flush with the card's edges: the container pads its content by 10px.
  bar: {
    flex: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 24,
    margin: '4px -10px -10px',
    padding: '0 10px',
    border: 'none',
    borderRadius: '0 0 3px 3px',
    background: '#ffffff17',
    color: '#ffffffc0',
    fontFamily: theme.fonts.FAMILY.ROBOTO,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    cursor: 'pointer',
    '&:hover': { background: '#ffffff24' },
    '&:hover $flag': { opacity: 0.8 },
    '&:disabled': { cursor: 'default' }
  },
  icon: { flex: 'none', fontSize: 16 },
  good: { color: theme.common.FONT_COLOR_POSITIVE },
  bad: { color: '#FF5C5C' },
  stale: { color: theme.colors.ORANGE },
  steady: { color: '#ffffff80' },
  explain: { marginTop: 4, opacity: 0.7 },
  text: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  flag: { flex: 'none', fontSize: 13, opacity: 0 },
  flagSet: { flex: 'none', fontSize: 13, opacity: 0.8 },
  dialogTitle: { margin: '20px 24px 0' },
  dialogText: { marginTop: 0, fontSize: theme.fonts.SIZE[14] }
}));

PulseLine.propTypes = {
  widget: PropTypes.object,
  kind: PropTypes.string,
  pulse: PropTypes.object,
  editing: PropTypes.bool,
  onEdit: PropTypes.func,
  onClose: PropTypes.func
};

export { PulseContext, safePulse };
export default PulseLine;
