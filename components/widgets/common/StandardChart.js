import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import PropTypes from 'prop-types';

import { calculateChartSizes, NekoToolTip, xAxisTickFormatter, makeYAxisTickFormatter, defaultChartType } from '../helpers';
import { makeStyles, useTheme } from '@material-ui/core';

const DynamicCharts = [
  { name: 'area', component: AreaChart },
  { name: 'line', component: LineChart },
  { name: 'bar', component: BarChart },
];

const DynamicChartElements = [
  { name: 'area', component: Area },
  { name: 'line', component: Line },
  { name: 'bar', component: Bar },
];

const AVERAGE_MONTH_DAYS = 30.44;
const BUCKET_DAYS = { day: 1, week: 7, month: AVERAGE_MONTH_DAYS, year: 365.25 };

// A level's target is a number the line should reach. A flow's target is per
// month, so it is drawn at the share of it one bar should hold: a daily bar is
// measured against a thirtieth of the goal, not the whole of it.
const goalForChart = (target, kind, by) => {
  if (!target) {
    return null;
  }
  if (kind === 'stock') {
    return target;
  }
  const days = BUCKET_DAYS[by] || 1;
  return target * days / AVERAGE_MONTH_DAYS;
};

// The goal line is the chart's own colour, washed towards white, so it reads as
// part of the card rather than a mark scribbled over it.
const lighten = (hex, amount = 0.45) => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!match) {
    return '#FFFFFF';
  }
  const num = parseInt(match[1], 16);
  const mix = (channel) => Math.round(channel + (255 - channel) * amount);
  const [ r, g, b ] = [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ].map(mix);
  return `rgb(${r}, ${g}, ${b})`;
};

// Room above the goal when it is the highest thing on the chart, so its line
// and label do not sit glued to the top edge. A share of the visible range, not
// of the value: 8% of 57,000 pushed a follower chart's top to 61.6k and
// flattened the curve it was meant to frame.
const GOAL_HEADROOM = 0.12;

const goalDomain = (values, goal, isBar) => {
  const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
  const low = isBar ? 0 : Math.min(goal, ...nums);
  const high = Math.max(...nums);
  if (goal < high) {
    return [ low, 'auto' ];
  }
  return [ low, goal + (goal - low) * GOAL_HEADROOM ];
};

const StandardChart = (props) => {
  const css = useStyles();
  const theme = useTheme();

  const { widget, data, kind = 'flow', by, yAxisLabelFormatter = 'Value: %d' } = props;
  const goal = goalForChart(widget.target, kind, by || widget.settings?.period?.groupBy || 'day');

  if (!(widget.h >= 2 && widget.w >= 2))
    return null;
  let color = widget.settings.color ? widget.settings.color : '#FF6384';
  let colorSet = theme.gradientRepo.find(i => i.color === color);
  let fillType = colorSet ? `url(#${colorSet.name}` : 'url(#pink)';

  // Without an explicit choice the shape of the series decides, see defaultChartType.
  let chartSettings = widget.settings?.chart ? widget.settings.chart
    : { type: defaultChartType(kind) };
  // The period in progress is dropped from a flow, where a part-week bar next
  // to whole ones reads as a collapse. A level has no such problem: today's
  // reading is as complete as any other, and cutting it made the chart end a
  // day before the number above it for no reason.
  let workData = data.slice();
  if (kind !== 'stock' && workData.length > 1) {
    workData.pop();
  }
  let { chartWidth, chartHeight } = calculateChartSizes(widget);
  let showDots = false;

  const DynamicChart = DynamicCharts.find(x => x.name === chartSettings.type).component;
  const DynamicChartElement = DynamicChartElements.find(x => x.name === chartSettings.type).component;
  const strokeWidth = chartSettings.type === 'bar' ? 0 : 2;

  if (workData.length > 0) {
    return (
      <DynamicChart className={css.chart} width={chartWidth} height={chartHeight} data={workData}>
        <defs>
          {theme.gradientRepo.map(color => 
            <linearGradient key={`${color.name}`} id={color.name} x1="0" y1="0" x2="1" y2="1">
              <stop offset={color.offset_start} stopColor={color.gradient_start} stopOpacity={0.7}/>
              <stop offset={color.offset_end} stopColor={color.gradient_end} stopOpacity={0.7}/>
            </linearGradient>            
          )}
        </defs>
          
        <XAxis dataKey="date" tickFormatter={xAxisTickFormatter} />
        <YAxis dataKey="value" tickFormatter={makeYAxisTickFormatter([ ...workData.map(x => x.value), goal ])} width={32}
          allowDataOverflow={false} domain={goal ? goalDomain(workData.map(x => x.value), goal, chartSettings.type === 'bar')
            : [chartSettings.type === 'bar' ? 0 : 'auto', 'auto']} />
        <Tooltip 
          content={<NekoToolTip yAxisLabel={yAxisLabelFormatter} />}
        />
        <CartesianGrid />
        <DynamicChartElement isAnimationActive={false} type="monotone" dataKey="value"
          dot={showDots ? { stroke: color, fill: 'white', fillOpacity: 1, strokeWidth: 2, r: 4.2 } : null} 
          stroke={color} fill={fillType} strokeWidth={strokeWidth} yAxisId={0}/>
        {goal && <ReferenceLine y={goal} stroke={lighten(color)} strokeWidth={1.5}
          strokeDasharray="5 4" label={{ value: 'Goal', position: 'insideTopLeft', fill: lighten(color), fontSize: 10 }} />}
      </DynamicChart>
    );
  }
  return (<div className={css.chartNoInfo} style={{ height: chartHeight }}>
    No chart yet<br />It fills in as readings are recorded
  </div>);
};

const useStyles = makeStyles(theme => ({
	chartNoInfo: {
    flex: 1,
    color: theme.common.COLOR_PRIMARY_NEKO,
    fontSize: theme.fonts.SIZE[14],
    fontFamily: theme.fonts.FAMILY.ROBOTO,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center'
  },
	chart: {
    '& .recharts-text': {
      fill: theme.common.GRID_COLOR,
      fontSize: theme.fonts.SIZE[10],
    },
		'& .recharts-cartesian-axis-tick': {
			fontFamily: theme.fonts.FAMILY.ROBOTO
		},
		'& .recharts-cartesian-grid line': {
			stroke: theme.common.GRID_COLOR,
      strokeWidth: '0.2px'
		},
	}
}));

StandardChart.propTypes = {
	widget: PropTypes.object,
  data: PropTypes.array,
  kind: PropTypes.string,
  by: PropTypes.string,
  yAxisLabelFormatter: PropTypes.any
};

export { goalForChart };
export default StandardChart;