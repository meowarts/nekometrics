import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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

const StandardChart = (props) => {
  const css = useStyles();
  const theme = useTheme();

  const { widget, data, kind = 'flow', yAxisLabelFormatter = 'Value: %d' } = props;

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
        <YAxis dataKey="value" tickFormatter={makeYAxisTickFormatter(workData.map(x => x.value))} width={32}
          allowDataOverflow={false} domain={[chartSettings.type === 'bar' ? 0 : 'auto', 'auto']} />
        <Tooltip 
          content={<NekoToolTip yAxisLabel={yAxisLabelFormatter} />}
        />
        <CartesianGrid />
        <DynamicChartElement isAnimationActive={false} type="monotone" dataKey="value"
          dot={showDots ? { stroke: color, fill: 'white', fillOpacity: 1, strokeWidth: 2, r: 4.2 } : null} 
          stroke={color} fill={fillType} strokeWidth={strokeWidth} yAxisId={0}/>
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
  yAxisLabelFormatter: PropTypes.any
};

export default StandardChart;