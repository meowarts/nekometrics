import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import DayJS from 'dayjs';
import { Dialog, TextField, Tooltip, Zoom } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FlagOutlinedIcon from '@material-ui/icons/FlagOutlined';

import useGlobalState from '~/libs/context';
import { computePulse, FLOW_STEADY_PERCENT } from '~/libs/pulse';
import NekoButton from '~/components/buttons/NekoButton';
import { NekoDialogActionWrapper, NekoDialogContentWrapper } from '~/components/elements/NekoElements';

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
    if (pulse.change === null) {
      return `${compact(pulse.value, prefix)} this week`;
    }
    return `${compact(pulse.value, prefix)} this week, ${pulse.change > 0 ? '+' : ''}${pulse.change.toFixed(0)}%`;
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

const explain = (kind) => kind === 'flow'
  ? `The last 7 finished days against the 7 before. Under ${FLOW_STEADY_PERCENT}% either way is steady.`
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
        {widget.target && <NekoButton tertiary disabled={busy} onClick={() => save(null)}>Remove</NekoButton>}
        <NekoButton primary disabled={busy || !valid} onClick={() => save(parsed)}>Save</NekoButton>
      </NekoDialogActionWrapper>
    </Dialog>
  );
};

// The word comes first because it is what the eye should land on; the numbers
// after it are the evidence.
const verdictWord = (pulse) => {
  if (pulse.verdict === 'stale') {
    return 'Not updating';
  }
  if (pulse.pace) {
    if (pulse.pace.reached) {
      return 'Reached';
    }
    return { good: 'On pace', steady: 'Close', bad: 'Behind' }[pulse.verdict];
  }
  return { good: 'Up', steady: 'Steady', bad: 'Down' }[pulse.verdict];
};

/**
 * A status bar along the foot of the card, judged on the same rules for every
 * card, which the old headline trend could not be: it compared over the card's
 * own range, so +195% on one card and +2% on the next never meant the same.
 */
const PulseLine = ({ widget, kind, data, editing, onEdit, onClose }) => {
  const css = useStyles();

  const line = useMemo(() => {
    // The bar is a bonus on top of the card, so a series it cannot read leaves
    // it out rather than taking the card, or the dashboard, down with it.
    try {
      const pulse = computePulse(data, kind, widget.target || null);
      if (!pulse) {
        return null;
      }
      const prefix = currencyOf(widget);
      return {
        verdict: pulse.verdict,
        word: verdictWord(pulse),
        text: describePace(pulse, widget.target, prefix) || describe(pulse, prefix)
      };
    }
    catch (err) {
      console.error('[Pulse] Could not read this card.', widget._id, err);
      return null;
    }
  }, [data, kind, widget]);

  if (!line) {
    return null;
  }

  const canEdit = widget.role !== 'read';

  return (
    <>
      <Tooltip TransitionComponent={Zoom} placement="bottom" title={explain(kind)}>
        <button type="button" className={`${css.bar} ${css[line.verdict]}`} disabled={!canEdit}
          onMouseDown={(ev) => ev.stopPropagation()} onClick={onEdit}>
          <b className={css.word}>{line.word}</b>
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
    color: '#FFFFFF',
    fontFamily: theme.fonts.FAMILY.ROBOTO,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    cursor: 'pointer',
    '&:hover': { filter: 'brightness(1.15)' },
    '&:hover $flag': { opacity: 0.8 },
    '&:disabled': { cursor: 'default' }
  },
  good: { background: '#2E8B3E' },
  bad: { background: '#B5303A' },
  stale: { background: '#B8661E' },
  steady: { background: '#ffffff17', color: '#ffffffc0' },
  word: { flex: 'none', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 },
  text: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  flag: { flex: 'none', fontSize: 13, opacity: 0 },
  flagSet: { flex: 'none', fontSize: 13, opacity: 0.8 },
  dialogTitle: { margin: '20px 24px 0' },
  dialogText: { marginTop: 0, fontSize: theme.fonts.SIZE[14] }
}));

PulseLine.propTypes = {
  widget: PropTypes.object,
  kind: PropTypes.string,
  data: PropTypes.any,
  editing: PropTypes.bool,
  onEdit: PropTypes.func,
  onClose: PropTypes.func
};

export default PulseLine;
