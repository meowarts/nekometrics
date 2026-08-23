import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';

/**
 * A trend anyone can say out loud, which the old one was not: it averaged the
 * last 15% of the points against the first 85% and reported the difference.
 * On a level that answers nothing, and it was quietly understating real moves,
 * showing -0.6% on a follower count that had actually fallen from 57.0k to
 * 56.0k, a drop three times that size.
 *
 * A level has a value now and a value when the window opened, so the trend is
 * simply the distance between the two. A flow has no single value, so its two
 * halves are compared: what the recent half averaged against the earlier half.
 */
const HALF_MINIMUM = 2;

const meanOf = (rows) => rows.reduce((sum, x) => sum + x.value, 0) / rows.length;

const asTrend = (change) => {
	if (!isFinite(change)) {
		return null;
	}
	if (Math.abs(change) < 0.5) {
		return { percent: 0, direction: 'flat' };
	}
	return { percent: Math.abs(change).toFixed(1), direction: change >= 0 ? 'up' : 'down' };
};

const calculateTrend = (data, by, kind = 'flow') => {
	if (!data || data.length < 2) {
		return null;
	}
	const rows = data.filter(x => typeof x.value === 'number' && !isNaN(x.value));
	if (rows.length < 2) {
		return null;
	}

	if (kind === 'stock') {
		// Today's reading against the one the window opened on.
		const first = rows[0].value;
		const last = rows[rows.length - 1].value;
		if (first === 0) {
			return last > 0 ? { percent: 100, direction: 'up' } : { percent: 0, direction: 'flat' };
		}
		return asTrend(((last - first) / Math.abs(first)) * 100);
	}

	// The period in progress is not comparable to finished ones, and the chart
	// leaves it out too, so the two agree on what they are describing.
	const complete = rows.length > 2 ? rows.slice(0, -1) : rows;
	if (complete.length < HALF_MINIMUM * 2) {
		return null;
	}
	const half = Math.floor(complete.length / 2);
	const earlier = complete.slice(0, half);
	const recent = complete.slice(-half);
	const earlierMean = meanOf(earlier);
	if (earlierMean === 0) {
		return meanOf(recent) > 0 ? { percent: 100, direction: 'up' } : { percent: 0, direction: 'flat' };
	}
	return asTrend(((meanOf(recent) - earlierMean) / Math.abs(earlierMean)) * 100);
};

const trendExplanation = (kind, count) => {
	if (kind === 'stock') {
		return 'Compared with the start of this range.';
	}
	const half = Math.floor(Math.max(0, count - 1) / 2);
	return `The last ${half} periods against the ${half} before them, current period excluded.`;
};

const TrendIndicator = (props) => {
	const { data, by = 'day', kind = 'flow' } = props;
	const css = useStyles();

	const trend = calculateTrend(data, by, kind);

	if (!trend) {
		// Show a more informative message based on how much data we have
		if (data && data.length > 0) {
			if (data.length === 1) {
				return <span className={css.noTrend}>Need more data</span>;
			}
		}
		return <span className={css.noTrend}>Not enough data</span>;
	}

	const Icon = trend.direction === 'up' ? TrendingUpIcon :
				 trend.direction === 'down' ? TrendingDownIcon :
				 TrendingFlatIcon;
	const colorClass = trend.direction === 'up' ? css.positiveValue :
					   trend.direction === 'down' ? css.negativeValue :
					   css.flatValue;
	const iconClass = trend.direction === 'up' ? css.upIcon :
					  trend.direction === 'down' ? css.downIcon :
					  css.flatIcon;

	return (
		<span className={css.trendContainer} title={trendExplanation(kind, data ? data.length : 0)}>
			<Icon className={iconClass} />
			<span className={colorClass}>
				{trend.direction === 'up' ? '+' :
				 trend.direction === 'down' ? '-' : ''}{trend.percent}%
			</span>
		</span>
	);
};

const useStyles = makeStyles(theme => ({
	trendContainer: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		fontFamily: theme.fonts.FAMILY.ROBOTO,
		fontSize: theme.fonts.SIZE[13]
	},
	upIcon: {
		color: theme.common.FONT_COLOR_POSITIVE,
		fontSize: 16
	},
	downIcon: {
		color: theme.common.FONT_COLOR_NEGATIVE,
		fontSize: 16
	},
	flatIcon: {
		color: theme.common.COLOR_PRIMARY_NEKO,
		fontSize: 16,
		opacity: 0.6
	},
	positiveValue: {
		color: theme.common.FONT_COLOR_POSITIVE,
		fontWeight: theme.fonts.WEIGHT[600]
	},
	negativeValue: {
		color: theme.common.FONT_COLOR_NEGATIVE,
		fontWeight: theme.fonts.WEIGHT[600]
	},
	flatValue: {
		color: theme.common.COLOR_PRIMARY_NEKO,
		fontWeight: theme.fonts.WEIGHT[500],
		opacity: 0.7
	},
	noTrend: {
		fontFamily: theme.fonts.FAMILY.ROBOTO,
		fontSize: theme.fonts.SIZE[12],
		fontWeight: theme.fonts.WEIGHT[400],
		color: theme.common.COLOR_PRIMARY_NEKO,
		fontStyle: 'italic',
		opacity: 0.6
	}
}));

TrendIndicator.propTypes = {
	data: PropTypes.array,
	kind: PropTypes.string,
	by: PropTypes.string
};

export default TrendIndicator;