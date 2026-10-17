import { useMemo, useState } from 'react';
import DayJS from 'dayjs';
import { Dialog, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FlagOutlinedIcon from '@material-ui/icons/FlagOutlined';

import useGlobalState from '~/libs/context';
import { usePulseEntries } from '~/libs/pulseStore';
import { computePulse, VERDICT_ORDER, FLOW_STEADY_PERCENT } from '~/libs/pulse';
import { getWidgetSpine } from '~/components/widgets/WidgetsRepository';
import { widgetSubtitle } from '~/components/widgets/helpers';
import { getIconByName } from '~/components/widgets/common/icons';
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
      return `${compact(pulse.previous, prefix)} the week before`;
    }
    return `${pulse.change > 0 ? '+' : ''}${pulse.change.toFixed(0)}% vs the week before`;
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

const describePace = (pulse, target, prefix) => {
  if (!pulse.pace) {
    return null;
  }
  if (pulse.kind === 'flow') {
    return `On pace for ${compact(pulse.pace.projected, prefix)} of ${compact(target, prefix)} this month`;
  }
  if (pulse.pace.reached) {
    return `Target of ${compact(target, prefix)} reached`;
  }
  if (pulse.pace.months === null) {
    return `${compact(pulse.pace.remaining)} to go`;
  }
  if (pulse.pace.months === Infinity) {
    return `${compact(pulse.pace.remaining)} to go, moving away from it`;
  }
  const months = pulse.pace.months;
  const when = months < 1 ? 'within a month' : months > 36 ? 'over 3 years away' : `about ${Math.round(months)} months away`;
  return `${compact(pulse.pace.remaining)} to go, ${when}`;
};

const TargetDialog = ({ row, onClose }) => {
  const css = useStyles();
  const { modifyWidget } = useGlobalState();
  const [ value, setValue ] = useState(row.widget.target ? String(row.widget.target) : '');
  const [ busy, setBusy ] = useState(false);
  const isFlow = row.kind === 'flow';

  const save = async (target) => {
    setBusy(true);
    await modifyWidget(row.widget._id, { ...row.widget, target });
    setBusy(false);
    onClose();
  };

  const parsed = Number(value.replace(/[, ]/g, ''));
  const valid = value.trim() !== '' && isFinite(parsed) && parsed > 0;

  return (
    <Dialog open={true} onClose={onClose} fullWidth={true} maxWidth="xs">
      <h5 className={css.dialogTitle}>{row.widget.name}</h5>
      <NekoDialogContentWrapper>
        <p className={css.dialogText}>
          {isFlow
            ? 'What should this reach in a month? The line then says whether this month is on pace for it.'
            : 'What number are you aiming for? The line then says how far it is at the pace of the last 30 days.'}
        </p>
        <TextField autoFocus fullWidth variant="outlined" size="small" type="number"
          label={isFlow ? 'Monthly target' : 'Target'} value={value}
          onChange={(ev) => setValue(ev.target.value)}
          onKeyDown={(ev) => { if (ev.key === 'Enter' && valid) { save(parsed); } }} />
      </NekoDialogContentWrapper>
      <NekoDialogActionWrapper>
        {row.widget.target && <NekoButton tertiary disabled={busy} onClick={() => save(null)}>Remove</NekoButton>}
        <NekoButton primary disabled={busy || !valid} onClick={() => save(parsed)}>Save</NekoButton>
      </NekoDialogActionWrapper>
    </Dialog>
  );
};

const PulseStrip = () => {
  const css = useStyles();
  const { dashboard } = useGlobalState();
  const entries = usePulseEntries();
  const [ editing, setEditing ] = useState(null);

  const rows = useMemo(() => {
    const widgets = dashboard && dashboard.widgets ? dashboard.widgets : [];
    return widgets.map(widget => {
      const spine = getWidgetSpine(widget);
      const kind = spine && spine.kind ? spine.kind : 'flow';
      if (!spine || kind === 'none' || widget.service === 'fake') {
        return null;
      }
      const entry = entries.get(widget._id);
      if (!entry) {
        return null;
      }
      const prefix = currencyOf(widget);
      const Icon = getIconByName(widget?.settings?.icon) || spine.icon;
      const base = { widget, kind, Icon, subtitle: widgetSubtitle(widget, spine), weight: 0 };
      if (entry.error && !entry.data) {
        return { ...base, verdict: 'stale', value: '', text: 'Not loading', title: entry.error };
      }
      const pulse = computePulse(entry.data, kind, widget.target || null);
      if (!pulse) {
        return null;
      }
      return {
        ...base,
        verdict: pulse.verdict,
        value: compact(pulse.value, prefix),
        unit: kind === 'flow' ? 'last 7 days' : null,
        text: describe(pulse, prefix),
        pace: describePace(pulse, widget.target, prefix),
        weight: Math.abs((kind === 'flow' ? pulse.change : pulse.monthPercent) || 0)
      };
    }).filter(Boolean).sort((a, b) =>
      (VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict]) || (b.weight - a.weight));
  }, [dashboard, entries]);

  if (!rows.length) {
    return null;
  }

  const counts = rows.reduce((acc, x) => ({ ...acc, [x.verdict]: (acc[x.verdict] || 0) + 1 }), {});
  const summary = [
    counts.stale && `${counts.stale} not updating`,
    counts.bad && `${counts.bad} going the wrong way`,
    counts.good && `${counts.good} going well`,
    counts.steady && `${counts.steady} steady`
  ].filter(Boolean).join(' · ');

  return (
    <section className={css.strip}>
      <header className={css.header}>
        <h2 className={css.title}>This week</h2>
        <span className={css.summary}>{summary}</span>
      </header>
      <p className={css.caption}>
        Same rules for every line. Flows are the last 7 finished days against the 7 before (under {FLOW_STEADY_PERCENT}% is steady),
        levels are how far they moved in 7 and 30 days. Click a line to give it a target.
      </p>
      <div className={css.rows}>
        {rows.map(row => (
          <button key={row.widget._id} type="button" className={css.row} title={row.title || 'Set a target'}
            disabled={row.widget.role === 'read'} onClick={() => setEditing(row)}>
            <span className={`${css.dot} ${css[row.verdict]}`} />
            <row.Icon className={css.icon} />
            <span className={css.name}>
              {row.widget.name}
              {row.subtitle && <span className={css.subtitle}>{row.subtitle}</span>}
            </span>
            <span className={css.value}>
              {row.value}
              {row.unit && <span className={css.unit}>{row.unit}</span>}
            </span>
            <span className={`${css.text} ${css[row.verdict + 'Text']}`}>
              {row.text}
              {row.pace && <span className={css.pace}>{row.pace}</span>}
            </span>
            <FlagOutlinedIcon className={row.widget.target ? css.flagSet : css.flag} />
          </button>
        ))}
      </div>
      {editing && <TargetDialog row={editing} onClose={() => setEditing(null)} />}
    </section>
  );
};

const useStyles = makeStyles(theme => ({
  strip: {
    boxSizing: 'border-box',
    width: 1020,
    maxWidth: 'calc(100% - 20px)',
    margin: '0 10px 6px',
    padding: '12px 14px',
    borderRadius: 3,
    border: '1px solid #6e778a47',
    background: theme.common.WIDGET_BACKGROUND_IMAGE,
    color: theme.common.COLOR_PRIMARY_NEKO,
    fontFamily: theme.fonts.FAMILY.ROBOTO
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 12
  },
  title: {
    margin: 0,
    fontFamily: theme.fonts.FAMILY.NOVA_FLAT,
    fontSize: theme.fonts.SIZE[16],
    fontWeight: 400
  },
  summary: {
    fontSize: theme.fonts.SIZE[14],
    opacity: 0.8
  },
  caption: {
    margin: '2px 0 10px',
    fontSize: theme.fonts.SIZE[12],
    opacity: 0.5
  },
  rows: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
    columnGap: 16,
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr'
    }
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '8px 16px minmax(0, 1.1fr) 82px minmax(0, 1.4fr) 16px',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '6px 4px',
    border: 'none',
    borderBottom: '1px solid #6e778a2e',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    '&:hover': { background: '#ffffff0d' },
    '&:hover $flag': { opacity: 0.6 },
    '&:disabled': { cursor: 'default' },
    '@media (max-width: 600px)': {
      gridTemplateColumns: '8px 16px minmax(0, 1fr) auto 16px',
      '& $text': { gridColumn: '3 / 6' }
    }
  },
  dot: { width: 8, height: 8, borderRadius: '50%' },
  good: { background: theme.common.FONT_COLOR_POSITIVE },
  bad: { background: theme.common.FONT_COLOR_NEGATIVE },
  stale: { background: theme.colors.ORANGE },
  steady: { background: '#ffffff40' },
  goodText: { color: theme.common.FONT_COLOR_POSITIVE },
  badText: { color: '#ff6b6b' },
  staleText: { color: theme.colors.ORANGE },
  steadyText: { opacity: 0.7 },
  icon: { fontSize: theme.fonts.SIZE[16], opacity: 0.8 },
  name: {
    fontFamily: theme.fonts.FAMILY.NOVA_FLAT,
    fontSize: theme.fonts.SIZE[14],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  subtitle: {
    marginLeft: 6,
    fontFamily: theme.fonts.FAMILY.ROBOTO,
    fontSize: 11,
    opacity: 0.5
  },
  value: {
    fontSize: theme.fonts.SIZE[16],
    fontWeight: 500,
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1
  },
  unit: {
    display: 'block',
    fontSize: 10,
    fontWeight: 400,
    opacity: 0.5
  },
  text: {
    fontSize: 13,
    lineHeight: 1.25,
    fontVariantNumeric: 'tabular-nums'
  },
  pace: {
    display: 'block',
    fontSize: 12,
    color: theme.common.COLOR_PRIMARY_NEKO,
    opacity: 0.75
  },
  flag: { fontSize: 16, opacity: 0 },
  flagSet: { fontSize: 16, opacity: 0.8 },
  dialogTitle: { margin: '20px 24px 0' },
  dialogText: { marginTop: 0, fontSize: theme.fonts.SIZE[14] }
}));

export default PulseStrip;
