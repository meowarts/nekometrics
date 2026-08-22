import { useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { makeStyles, useTheme } from '@material-ui/core';
import PropTypes from 'prop-types';
import CountUp from 'react-countup';

import { calculateChartSizes, xAxisTickFormatter, yAxisTickFormatter } from '../helpers';

const lastDefined = (data, key) => {
	for (let i = data.length - 1; i >= 0; i--) {
		if (data[i][key] !== undefined && data[i][key] !== null) {
			return data[i][key];
		}
	}
	return null;
};

/**
 * Two things at once, because on their own neither says much: the bars are how
 * many people downloaded the plugin that day, the line is how many sites are
 * running it. WordPress.org rounds active installs into buckets (10k, 20k,
 * 100k), so that line sits flat for a long time and then steps. The step is the
 * part worth seeing.
 */
const Plugin = (props) => {
	const css = useStyles();
	const theme = useTheme();
	const { widget, data } = props;

	const installs = useMemo(() => lastDefined(data, 'installs'), [data]);
	const downloads = useMemo(() => lastDefined(data, 'value'), [data]);

	const color = widget.settings.color ? widget.settings.color : '#FF6384';
	const colorSet = theme.gradientRepo.find(i => i.color === color);
	const fillType = colorSet ? `url(#${colorSet.name}` : 'url(#pink)';
	const { chartWidth, chartHeight } = calculateChartSizes(widget);
	const showChart = widget.h >= 2 && widget.w >= 2 && data.length > 1;

	return (
		<div className={css.container}>
			<div className={css.glance}>
				<div className={css.installs}>
					{installs !== null
						? <CountUp preserveValue={true} separator=" " end={parseInt(installs)} />
						: '0'}
				</div>
				<div className={css.downloads}>
					{downloads !== null
						? `${new Intl.NumberFormat('en-US').format(downloads).replace(/,/g, ' ')} downloads a day`
						: 'active installs'}
				</div>
			</div>

			{showChart && <ComposedChart className={css.chart} width={chartWidth} height={chartHeight} data={data}>
				<defs>
					{theme.gradientRepo.map(c =>
						<linearGradient key={c.name} id={c.name} x1="0" y1="0" x2="1" y2="1">
							<stop offset={c.offset_start} stopColor={c.gradient_start} stopOpacity={0.7}/>
							<stop offset={c.offset_end} stopColor={c.gradient_end} stopOpacity={0.7}/>
						</linearGradient>
					)}
				</defs>

				<XAxis dataKey="date" tickFormatter={xAxisTickFormatter} />
				<YAxis yAxisId="downloads" dataKey="value" tickFormatter={yAxisTickFormatter}
					width={22} domain={[0, 'auto']} />
				<YAxis yAxisId="installs" dataKey="installs" orientation="right"
					tickFormatter={yAxisTickFormatter} width={26} domain={['auto', 'auto']} />
				<Tooltip content={<PluginToolTip />} />
				<CartesianGrid />

				<Bar yAxisId="downloads" dataKey="value" fill={fillType} />
				<Line yAxisId="installs" type="stepAfter" dataKey="installs" dot={false}
					stroke={theme.common.COLOR_PRIMARY_NEKO} strokeWidth={2} connectNulls={true} />
			</ComposedChart>}
		</div>
	);
};

const PluginToolTip = ({ active, payload, label }) => {
	const css = useStyles();
	if (!active || !payload || !payload.length) {
		return null;
	}
	const row = payload[0].payload;
	return (
		<div className={css.tooltip}>
			<div>{new Date(label).toLocaleDateString()}</div>
			{row.value !== undefined && <div>{row.value} downloads</div>}
			{row.installs !== undefined && <div>{row.installs} active installs</div>}
		</div>
	);
};

const useStyles = makeStyles(theme => ({
	container: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center'
	},
	glance: {
		color: '#FCFCFC',
		textAlign: 'center',
		fontFamily: theme.fonts.FAMILY.ROBOTO,
		marginBottom: 5
	},
	installs: {
		fontSize: theme.fonts.SIZE[32],
		fontWeight: 500,
		marginBottom: '-3px'
	},
	downloads: {
		fontSize: theme.fonts.SIZE[12],
		color: theme.common.COLOR_PRIMARY_NEKO
	},
	tooltip: {
		background: 'rgba(0, 0, 0, 0.8)',
		color: '#FCFCFC',
		padding: '5px 8px',
		borderRadius: 3,
		fontSize: theme.fonts.SIZE[11],
		fontFamily: theme.fonts.FAMILY.ROBOTO
	},
	chart: {
		'& .recharts-text': {
			fill: theme.common.GRID_COLOR,
			fontSize: theme.fonts.SIZE[10]
		},
		'& .recharts-cartesian-axis-tick': { fontFamily: theme.fonts.FAMILY.ROBOTO },
		'& .recharts-cartesian-grid line': {
			stroke: theme.common.GRID_COLOR,
			strokeWidth: '0.2px'
		}
	}
}));

PluginToolTip.propTypes = {
	active: PropTypes.bool,
	payload: PropTypes.array,
	label: PropTypes.any
};

Plugin.propTypes = {
	widget: PropTypes.object,
	data: PropTypes.array
};

export default Plugin;
