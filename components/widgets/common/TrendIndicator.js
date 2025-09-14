import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';

const calculateTrend = (data, by) => {
	if (!data || data.length < 2) {
		return null;
	}

	try {
		let lastPeriodValue;
		let previousPeriodsAvg;
		let workingData = [...data];

		// Exclude current incomplete period
		const today = new Date();
		const lastDataPoint = workingData[workingData.length - 1];

		if (by === 'month' && lastDataPoint) {
			// Check if last data point is current month (format: YYYYMM)
			const currentYearMonth = today.getFullYear() * 100 + (today.getMonth() + 1);
			const lastYearMonth = parseInt(lastDataPoint.date);
			if (lastYearMonth === currentYearMonth) {
				workingData = workingData.slice(0, -1);
			}
		} else if (by === 'year' && lastDataPoint) {
			// Check if last data point is current year
			const currentYear = today.getFullYear();
			const lastYear = parseInt(lastDataPoint.date);
			if (lastYear === currentYear) {
				workingData = workingData.slice(0, -1);
			}
		} else if ((by === 'day' || by === 'hour') && lastDataPoint) {
			// For daily/hourly data, check if last point is today
			// Handle both date formats: Date object and string
			let lastDate;
			if (lastDataPoint.date instanceof Date) {
				lastDate = new Date(lastDataPoint.date);
			} else if (typeof lastDataPoint.date === 'string') {
				// Handle YYYYMMDD or YYYY-MM-DD formats
				const dateStr = lastDataPoint.date.replace(/-/g, '');
				if (dateStr.length === 8) {
					const year = parseInt(dateStr.substring(0, 4));
					const month = parseInt(dateStr.substring(4, 6));
					const day = parseInt(dateStr.substring(6, 8));
					lastDate = new Date(year, month - 1, day);
				} else {
					// Try parsing as ISO string
					lastDate = new Date(lastDataPoint.date);
				}
			}

			if (lastDate && !isNaN(lastDate.getTime())) {
				const today = new Date();
				// Compare dates at day level only
				const todayStr = today.toISOString().split('T')[0];
				const lastDateStr = lastDate.toISOString().split('T')[0];

				// If the last data point is today, exclude it
				if (lastDateStr === todayStr) {
					workingData = workingData.slice(0, -1);
				}
			}
		}

		if (workingData.length < 2) {
			return null;
		}

		// Get the last complete period
		lastPeriodValue = workingData[workingData.length - 1].value;

		// Calculate average of all previous periods (excluding the last one)
		const previousPeriods = workingData.slice(0, -1);
		if (previousPeriods.length === 0) {
			return null;
		}

		previousPeriodsAvg = previousPeriods.reduce((sum, item) => sum + item.value, 0) / previousPeriods.length;

		// Avoid division by zero
		if (previousPeriodsAvg === 0) {
			return lastPeriodValue > 0 ? { percent: 100, direction: 'up' } : { percent: 0, direction: 'flat' };
		}

		// Calculate percentage change from average
		const percentChange = ((lastPeriodValue - previousPeriodsAvg) / previousPeriodsAvg) * 100;

		// Consider changes less than 0.5% as flat
		if (Math.abs(percentChange) < 0.5) {
			return { percent: 0, direction: 'flat' };
		}

		return {
			percent: Math.abs(percentChange).toFixed(1),
			direction: percentChange >= 0 ? 'up' : 'down'
		};
	} catch (err) {
		console.error('Error calculating trend:', err);
		return null;
	}
};

const TrendIndicator = (props) => {
	const { data, by = 'day' } = props;
	const css = useStyles();

	// Calculate single trend: last period vs average of all previous visible periods
	const trend = calculateTrend(data, by);

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
		<span className={css.trendContainer}>
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
	by: PropTypes.string
};

export default TrendIndicator;