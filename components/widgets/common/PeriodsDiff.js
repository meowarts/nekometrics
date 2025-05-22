import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const getPeriodsDiff = (data) => {
	let dayDiff = null;
	let weekDiff = null;
	let monthDiff = null;
	let yearDiff = null;
	
	try {
		if (data.length >= 2) {
			// Daily: Compare yesterday (last complete day) vs day before that
			const yesterday = data[data.length - 2].value;
			const dayBefore = data[data.length - 3]?.value;
			if (dayBefore !== undefined) {
				dayDiff = Math.round(yesterday - dayBefore);
			}
		}
		
		if (data.length >= 14) {
			// Weekly: Compare last 7 days total vs previous 7 days total
			const last7Days = data.slice(-7).reduce((sum, item) => sum + item.value, 0);
			const previous7Days = data.slice(-14, -7).reduce((sum, item) => sum + item.value, 0);
			weekDiff = Math.round(last7Days - previous7Days);
		}
		
		if (data.length >= 62) {
			// Monthly: Compare last 31 days total vs previous 31 days total
			const last31Days = data.slice(-31).reduce((sum, item) => sum + item.value, 0);
			const previous31Days = data.slice(-62, -31).reduce((sum, item) => sum + item.value, 0);
			monthDiff = Math.round(last31Days - previous31Days);
		}
		
		if (data.length >= 730) {
			// Yearly: Compare last 365 days total vs previous 365 days total
			const last365Days = data.slice(-365).reduce((sum, item) => sum + item.value, 0);
			const previous365Days = data.slice(-730, -365).reduce((sum, item) => sum + item.value, 0);
			yearDiff = Math.round(last365Days - previous365Days);
		}
	}
	catch (err) {
		console.log(err);
	}
	return { dayDiff, weekDiff, monthDiff, yearDiff };
}

const PeriodsDiff = (props) => {
	const { data } = props;
	const css = usePeriodsDiffsStyles();
  let percentDiff = getPeriodsDiff(data);

	return (
		<span className={css.periodsDiff}>
			<PeriodDiff label="Daily: " value={percentDiff.dayDiff} />
			<PeriodDiff label="Weekly: " value={percentDiff.weekDiff} />
			<PeriodDiff label="Monthly: " value={percentDiff.monthDiff} />
			<PeriodDiff label="Yearly: " value={percentDiff.yearDiff} />
		</span>
	);
}

const usePeriodsDiffsStyles = makeStyles(theme => ({
	periodsDiff: {
		fontFamily: theme.fonts.FAMILY.ROBOTO,
		fontWeight: theme.fonts.WEIGHT[400],
		fontSize: theme.fonts.SIZE[14],
		"& > *:not(:last-child)": {
			marginRight: 5
		}
	}
}));

PeriodsDiff.propTypes = {
	data: PropTypes.array
};

const PeriodDiff = (props) => {
	const { label, value } = props;
	const css = usePeriodDiffStyles();
	if (!value) {
		return null;
	}
	return (
		<span>
			{label}
			<span className={value > 0 ? css.positiveDiff : css.negativeDiff}> {value > 0 ? '+' : ''}
				{value}
			</span>
		</span>
	);
}

const usePeriodDiffStyles = makeStyles(theme => ({
	positiveDiff: {
		color: theme.common.FONT_COLOR_POSITIVE,
		fontWeight: theme.fonts.WEIGHT[600]
	},
	negativeDiff: {
		color: theme.common.FONT_COLOR_NEGATIVE,
		fontWeight: theme.fonts.WEIGHT[600]
	}
}));

PeriodDiff.propTypes = {
	label: PropTypes.string,
	value: PropTypes.number
};

export { PeriodsDiff, PeriodDiff };