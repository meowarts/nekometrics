import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import DayJS from 'dayjs';
const RelativeTime = require('dayjs/plugin/relativeTime')
DayJS.extend(RelativeTime)

import { Dialog, Tooltip, Typography, Zoom } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ErrorIcon from '@material-ui/icons/Error';

import { getWidgetSpine } from './WidgetsRepository';
import useGlobalState from '~/libs/context';
import WidgetBurgerIcon from './WidgetBurgerIcon';
import SoftBusyOverlay from '~/components/SoftBusyOverlay';
import { getMetrics, resetMetrics, forceGetMetrics } from '~/libs/requests';
import { useInterval } from '~/libs/helpers';
import NekoButton from '../buttons/NekoButton';
import { NO_FORCE_REFRESH_WIDGETS } from '~/libs/constants';

const fakeData = (dayJsFrom, cumulative = false) => {
  let result = [];
  let now = dayJsFrom; 
  let value = 0;
  const startValue = Math.floor(Math.random() * (1001) + 0);
  for (now; DayJS().isAfter(now); now = now.add(1, 'day')) {
    const addValue = Math.floor(Math.random() * (20 - 0 + 1) + 0);
    value = (cumulative ? addValue + value : addValue);
    if (!cumulative) {
      value += startValue;
    }
    else if (now === dayJsFrom)  {
      value += startValue;
    }
    result.push({ date: now.toDate(), metric: "followers", value });
  }
  return result;
 }

function isEqual(a, b) {
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);
  if (aProps.length != bProps.length)
    return false;
  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];
    if (a[propName] !== b[propName])
      return false;
  }
  return true;
}

const TWO_SECONDS = 2 * 1000;
const FIFTEEN_SECONDS = 15 * 1000;
const TEN_MINUTES = 5 * 60 * 1000;
const ONE_MINUTE = 5 * 60 * 1000;

const getRandomInterval = (updateSpeed) => {
  if (updateSpeed === 'fast') {
    return Math.floor(Math.random() * FIFTEEN_SECONDS) + TWO_SECONDS;
  }
  return Math.floor(Math.random() * TEN_MINUTES) + ONE_MINUTE;
}

const WidgetsFactory = (props) => {
  const css = useStyles();
  const { widget, updateSpeed = 'normal' } = props;
  const [ data, setData ] = useState();
  const [ settingsModal, setSettingsModal ] = useState();
  const [ refreshInterval, setRefreshInterval ] = useState(getRandomInterval(updateSpeed));
  const [ lastUpdate, setLastUpdate ] = useState();
  const [ lastRefresh, setLastRefresh ] = useState();
  const [ lastUpdateText, setLastUpdateText ] = useState('N/A');
  const [ error, setError ] = useState();
  const [ isBusy, setIsBusy ] = useState(true);
  const { modifyWidget, refreshWidget } = useGlobalState(); 

  const widgetSpine = useMemo(() => getWidgetSpine(widget), [widget]);
  const DynamicWidget = (widgetSpine && widgetSpine.icon) ? widgetSpine.widget : null;
  const DynamicWidgetIcon = DynamicWidget ? widgetSpine.icon : null;
  const widgetName = widget.name ? widget.name : 'NO TITLE';

  const healthySpine = Boolean(widgetSpine && widgetSpine.icon && widgetSpine.widget && widgetSpine.settings);
  const nonRefreshable = NO_FORCE_REFRESH_WIDGETS.includes(`${widget.service}-${widget.type}`);

  useEffect(() => { 
    //console.log('Something changed.', widget, [widget.serviceId, widget.settings]);
    widget && onRefreshMetrics();
  }, [widget.settings]);

  // It's important to use a hook in order to avoid that to be re-created everytime the function
  // is re-ran. Also, the randomized refresh interval allows the client to update the widgets
  // at different time rather than all at the same time.
  useInterval(async () => {
    await onRefreshMetrics(true);
    setRefreshInterval(getRandomInterval(updateSpeed));
  }, refreshInterval);

  // 'silent' is to avoid having the whole widget to appear to be refreshing.
  // In this case, only the operations are off, and the widget silently refreshes.
  const onRefreshMetrics = async (silent = false) => {
    setIsBusy(silent ? 'soft' : true);

    // For fake data
    if (widget.service === 'fake') {
      let from = DayJS().subtract(2, 'weeks');
      if (widget?.settings?.period) {
        from = DayJS().subtract(widget.settings.period.length, widget.settings.period.unit);
      }
      let data = fakeData(from, widget?.settings?.dataType === 'cumulative');
      //console.log("Refresh Fake Data Widget", { from: from.toString(), settings: widget?.settings, data });
      setLastUpdate(DayJS());
      setLastRefresh(DayJS());
      setData(data);
      setIsBusy(false);
      return;
    }

    // For standard widget
    const res = await getMetrics(widget._id);
    if (res.success) {
      const { data, refreshedOn } = res;
      setLastUpdate(widget.refreshDaily ? (refreshedOn ? DayJS(refreshedOn) : null) : null);
      setLastRefresh(DayJS());
      setData(data ? data : []);
      if (error) { setError(null) }
    }
    else {
      setError(res.message ? res.message : 'Unknown error');
      if (data) { setData(null) }
    }
    setIsBusy(false);
  }
  
  const onResetWidget = async () => {
    setIsBusy(true);
    const res = await resetMetrics(widget._id);
    if (res.success) {
      setData(res.data ? res.data : []);
      if (error) { setError(null) }
    }
    else {
      setError(res.message ? res.message : 'Unknown error');
      if (data) { setData(null) }
    }
    setIsBusy(false);
  }

  const onUpdateWidget = async (newName, newSettings) => {
    const sameName = widget.name === newName;
    const sameSettings = isEqual(widget.settings, newSettings);
    if (sameName && sameSettings)
      return;

    // Let's avoid updating the settings if they are the same
    // That will avoid the widget to refresh its content.
    setIsBusy(true);
    await modifyWidget(widget._id, {...widget,
      name: newName,
      settings: sameSettings ? widget.settings : newSettings
    });
    setIsBusy(false);
  }

  const widgetContent = useMemo(() => {
    if (!DynamicWidget) {
      console.error('This widget is spineless.', widget);
      return (<div className={css.widgetNoDataInfo}>This widget is spineless. Please ask the support to look for it.</div>);
    }
    if (data) {
      return (<DynamicWidget widget={widget} data={data} onRefreshMetrics={onRefreshMetrics} />);
    }
    if (error) {
      return (<>
      <div className={css.widgetNoDataInfo}>{error}</div>
      <NekoButton primary small onClick={() => setSettingsModal(true)}>Settings</NekoButton>
    </>);
    }
  }, [widget, data, error]);

  // TODO: This should be moved to the context, probably.
  const onForceRefresh = async () => {
    if (nonRefreshable) {
      return;
    }
    setIsBusy(true);
    console.log('Call forceGetMetrics.');
    const res = await forceGetMetrics(widget._id);
    console.log('forceGetMetrics', res);
    if (res.success) {
      console.log('Call updateWidget', res);
      await refreshWidget(widget._id);
    }
    else {
      alert(res.message);
      console.log(res);
    }
    setIsBusy(false);
  }

  const updateLastUpdateText = () => {
    if (widget.refreshDaily) {
      setLastUpdateText(<span>
        {lastUpdate ? 'Metrics updated ' + lastUpdate.fromNow() : 'Metrics never updated'}.<br />
        {lastRefresh ? 'Widget refreshed ' + lastRefresh.fromNow() : 'Widget never refreshed'}.
      </span>);
    }
    else {
      setLastUpdateText(<span>
        {lastRefresh ? 'Metrics updated ' + lastRefresh.fromNow() : 'Metrics never updated'}.
      </span>);
    }
  }

  const lastErrorText = useMemo(() => {
    if (nonRefreshable) {
      return null;
    }
    let error = null;
    if (lastUpdate && lastUpdate.fromNow() > 2) {
      error = "The data hasn't been updated for more than two days!";
    }
    else if (widget.lastIssue) {
      error = widget.lastIssue.error;
    }
    return error ? `${error} Click on the error icon to force-trigger a refresh.` : null;
  }, [lastUpdate, nonRefreshable, widget.lastIssue]);

  return (
    <SoftBusyOverlay className={css.widgetContainer} busy={isBusy === true}>

      {/* TITLE AND ICONS */}
      {widget && <div className={css.widgetTitleContainer}>
        {DynamicWidget && <DynamicWidgetIcon className={css.widgetIcon} size='small' />}
        <Tooltip TransitionComponent={Zoom} placement="bottom-start" title={lastUpdateText} onOpen={updateLastUpdateText}>
          <Typography variant='h3' className={css.widgetTitle}>{widgetName}</Typography>
        </Tooltip>

        {lastErrorText && <Tooltip TransitionComponent={Zoom} placement="bottom-start" title={lastErrorText}>
          <ErrorIcon color='error' style={{ marginRight: 5 }} onClick={onForceRefresh} />
        </Tooltip>}

        <WidgetBurgerIcon css={css} healthySpine={healthySpine} widget={widget}
          disabled={widget.role === 'read' || !!isBusy}
          onOpenSettings={() => setSettingsModal(true)}
          onRefreshMetrics={() => onRefreshMetrics(widget)} />
      </div>}

      {/* CONTENT */}
      {widgetContent}

      {/* SETTINGS */}
      {healthySpine && <Dialog fullWidth={true} open={!!settingsModal} 
        onClose={() => setSettingsModal()} onMouseDown={(ev) => ev.stopPropagation()}>
        <widgetSpine.settings widget={widget} onClose={() => setSettingsModal()} onRefreshMetrics={onRefreshMetrics}
          onResetWidget={onResetWidget} onUpdateWidget={onUpdateWidget} />
      </Dialog>}

    </SoftBusyOverlay>
  );
}

const useStyles = makeStyles(theme => ({
  widgetContainer: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
    padding: 10,
  },
  widgetTitleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 18
  },
  widgetIcon: {
    color: theme.common.COLOR_PRIMARY_NEKO,
    fontSize: theme.fonts.SIZE[18],
    marginRight: 5
  },
  widgetTitle: {
    color: theme.common.COLOR_PRIMARY_NEKO,
    fontFamily: theme.fonts.FAMILY.NOVA_FLAT,
    fontSize: theme.fonts.SIZE[14],
    flex: 'auto',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0
  },
  widgetNoDataInfo: {
    flex: 1,
    color: theme.common.COLOR_PRIMARY_NEKO,
    fontSize: theme.fonts.SIZE[14],
    fontFamily: theme.fonts.FAMILY.ROBOTO,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center'
  }
}));

WidgetsFactory.propTypes = {
  widget: PropTypes.object,
  updateSpeed: PropTypes.string
};

export default WidgetsFactory;
