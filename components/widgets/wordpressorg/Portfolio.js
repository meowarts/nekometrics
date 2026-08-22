import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { makeStyles, useTheme } from '@material-ui/core';
import PropTypes from 'prop-types';
import CountUp from 'react-countup';

import { calculateChartSizes } from '../helpers';

// Beyond this many slices a pie is a colour wheel, not a chart. The tail is
// gathered into one slice rather than dropped, so the total still adds up.
const MAX_SLICES = 8;

const Portfolio = (props) => {
	const css = useStyles();
	const theme = useTheme();
	const { widget, data } = props;

	const total = useMemo(() => data.reduce((sum, x) => sum + x.value, 0), [data]);

	const slices = useMemo(() => {
		if (data.length <= MAX_SLICES) {
			return data;
		}
		const head = data.slice(0, MAX_SLICES - 1);
		const tail = data.slice(MAX_SLICES - 1);
		return [ ...head, {
			name: `${tail.length} others`,
			slug: 'others',
			value: tail.reduce((sum, x) => sum + x.value, 0)
		} ];
	}, [data]);

	const colors = useMemo(() => theme.gradientRepo.map(x => x.color), [theme]);
	const { chartWidth, chartHeight } = calculateChartSizes(widget);
	const radius = Math.max(0, Math.min(chartWidth, chartHeight) / 2);

	return (
		<div className={css.container}>
			<div className={css.glance}>
				<div className={css.total}>
					<CountUp preserveValue={true} separator=" " end={parseInt(total)} />
				</div>
				<div className={css.label}>
					{data.length ? `across ${data.length} plugins` : 'nothing to show yet'}
				</div>
			</div>

			{!!slices.length && radius > 20 && <PieChart width={chartWidth} height={chartHeight}>
				<Pie data={slices} dataKey="value" nameKey="name" cx="50%" cy="50%"
					innerRadius={radius * 0.55} outerRadius={radius} paddingAngle={1}
					stroke="none" isAnimationActive={true}>
					{slices.map((slice, index) => (
						<Cell key={slice.slug}
							fill={slice.slug === 'others' ? theme.gradientRepo[9].color : colors[index % (colors.length - 1)]} />
					))}
				</Pie>
				<Tooltip content={<SliceToolTip total={total} />} />
			</PieChart>}
		</div>
	);
};

const SliceToolTip = ({ active, payload, total }) => {
	const css = useStyles();
	if (!active || !payload || !payload.length) {
		return null;
	}
	const slice = payload[0].payload;
	const share = total ? Math.round((slice.value / total) * 1000) / 10 : 0;
	return (
		<div className={css.tooltip}>
			<div><strong>{slice.name}</strong></div>
			<div>{new Intl.NumberFormat('en-US').format(slice.value).replace(/,/g, ' ')} ({share}%)</div>
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
	total: {
		fontSize: theme.fonts.SIZE[32],
		fontWeight: 500,
		marginBottom: '-3px'
	},
	label: {
		fontSize: theme.fonts.SIZE[12],
		color: theme.common.COLOR_PRIMARY_NEKO
	},
	tooltip: {
		background: 'rgba(0, 0, 0, 0.85)',
		color: '#FCFCFC',
		padding: '5px 8px',
		borderRadius: 3,
		fontSize: theme.fonts.SIZE[11],
		fontFamily: theme.fonts.FAMILY.ROBOTO
	}
}));

SliceToolTip.propTypes = {
	active: PropTypes.bool,
	payload: PropTypes.array,
	total: PropTypes.number
};

Portfolio.propTypes = {
	widget: PropTypes.object,
	data: PropTypes.array
};

export default Portfolio;
