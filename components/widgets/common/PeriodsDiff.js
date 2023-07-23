import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const getPeriodsDiff = (data) => {
	let dayDiff = null;
	let weekDiff = null;
	let monthDiff = null;
	let yearDiff = null;
	let currentDay = data.length - 1;
	let currentValue = null;
	
	try {
		if (currentDay >= 0)
			currentValue = data[currentDay].value;
		if (currentDay > 0) 
			dayDiff = Math.round(currentValue - data[currentDay - 1].value);
		if (currentDay >= 7) 
			weekDiff = Math.round(currentValue - data[currentDay - 7].value);
		if (currentDay >= 30) 
			monthDiff = Math.round(currentValue - data[currentDay - 30].value);
		if (currentDay >= 365) 
			yearDiff = Math.round(currentValue - data[currentDay - 365].value);
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