import DayJS from 'dayjs';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const numberWithCommas = (number) => {
	if (number === null || number === undefined) {
		return '0';
	}
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const getLastValue = (data, formatted = false) => {
	if (data && data.length) {
		if (formatted) {
			return numberWithCommas(data[data.length - 1].value);
		}
		return data[data.length - 1].value;
	}
	return null;
}

/**
 * Roll a daily series up into weeks or months.
 *
 * Whether a bucket is a sum or the last reading is not cosmetic, it is the
 * difference between a real number and nonsense: downloads, visitors, clicks
 * and earnings accumulate, so a week of them is their total. Subscribers,
 * users and active installs are a level, not a flow, and a week of them is
 * where the level ended, never the seven daily readings added together.
 *
 * A second series carried on the same rows (active installs next to downloads)
 * is always a level, so it takes the last value whatever the main series does.
 */
const aggregateSeries = (data, by = 'day', kind = 'flow') => {
	if (!Array.isArray(data) || by === 'day' || kind === 'none' || data.length < 2) {
		return data;
	}
	if (!data[0] || !data[0].date) {
		return data;
	}
	const buckets = new Map();
	for (const row of data) {
		// Every point is stored as the end of its day in the server's timezone, so
		// read from a browser further east it lands on the morning of the day
		// after and falls into the next bucket: the current week came out as a
		// single day holding zero. Stepping back half a day puts the reading in
		// the middle of the day it belongs to, whatever the reader's offset.
		const key = DayJS(row.date).subtract(12, 'hour').endOf(by).toISOString();
		if (!buckets.has(key)) {
			buckets.set(key, { ...row, date: key, value: kind === 'flow' ? 0 : undefined });
		}
		const bucket = buckets.get(key);
		if (row.value !== undefined && row.value !== null) {
			bucket.value = kind === 'flow' ? (bucket.value || 0) + row.value : row.value;
		}
		if (row.installs !== undefined && row.installs !== null) {
			bucket.installs = row.installs;
		}
	}
	return Array.from(buckets.values())
		.map(x => ({ ...x, value: typeof x.value === 'number' ? Math.round(x.value * 100) / 100 : x.value }));
};

const dataAggregatorOptimizer = (data) => {
	let aggregateBy = 'year'; 
	if (data.length < (30 * 3))
		return { data: data, by: 'day' };
	// if (data.length < 120)
	// 	aggregateBy = 'week';
	else if (data.length < (30 * 42))
		aggregateBy = 'month';
	data.forEach(x => { x.date = DayJS(x.date).endOf(aggregateBy).toISOString() });
	var newData = [];
	data.reduce((res, value) => {
		if (!res[value.date]) {
			res[value.date] = { date: value.date, value: value.value, metric: value.metric };
			newData.push(res[value.date])
		}
		res[value.date].value += value.value;
		return res;
	}, {});
	newData.forEach(x => {  x.value = Math.round(x.value * 100) / 100 });
	return { data: newData, by: aggregateBy };
}

/**
 * What a series is decides how it should be drawn.
 *
 * A flow is a quantity per bucket, and bars say that: each one is a separate
 * week that stands on its own, and the axis starts at zero so their heights
 * mean something. A level exists at every instant and its axis almost never
 * starts at zero, which is exactly when a filled area lies: it makes a two
 * percent wobble look like the whole quantity. A line makes no such claim.
 */
const defaultChartType = (kind) => (kind === 'stock' ? 'line' : 'bar');

/**
 * The stock formatter rounds to whole thousands, so a chart living between
 * 46,053 and 46,780 labelled every tick "46k", five times over. When the whole
 * series sits inside a narrow band, the ticks need a decimal to differ at all.
 */
const makeYAxisTickFormatter = (values) => {
	const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
	if (nums.length < 2) {
		return yAxisTickFormatter;
	}
	const max = Math.max(...nums);
	const span = max - Math.min(...nums);
	return (value) => {
		let num = value;
		if (typeof num === 'string') {
			num = Number(num.replace(/[, ]/g, ''));
		}
		if (isNaN(num)) {
			return value;
		}
		if (max >= 1000000 && span >= 100000) {
			return Math.round(num / 1000000) + 'M';
		}
		if (max >= 1000) {
			return span < 2000 ? (num / 1000).toFixed(1) + 'k' : Math.round(num / 1000) + 'k';
		}
		return Math.round(num);
	};
};

const yAxisTickFormatter = (value) => {
        let num = value;
        if (typeof num === 'string') {
                num = Number(num.replace(/[, ]/g, ''));
        }
        if (isNaN(num)) {
                return value;
        }
        if (num >= 1000000) {
                return Math.round(num / 1000000) + 'M';
        }
        else if (num >= 1000) {
                return Math.round(num / 1000) + 'k';
        }
        return Math.round(num);
};

const xAxisTickFormatter = (date, by = 'day') => {
	if (by === 'day')
		return DayJS(date).format('DD');
	else if (by === 'month')
		return DayJS(date).format('MM');
	else if (by === 'year')
		return DayJS(date).format('YYYY');
	return DayJS(date).format('MM/DD');
};

const calculateChartSizes = (widget) => {
	const { h, w } = widget;
	let chartWidth = (124 * w) - 20;
	let chartHeight = (130 * h) - 28 - 65;
	if (chartWidth < 0 || chartHeight < 0) {
		chartWidth = 0;
		chartHeight = 0;
	}
	return { chartWidth, chartHeight };
};

const NekoToolTip = ({ active, payload, label, yAxisLabel = 'Value: %d' }) => {
	const css = useStyles();

	if (active) {
		let formattedDate = DayJS(label, 'YYYYMMDD').format('YYYY/MM/DD');
		let value = payload && payload[0] ? numberWithCommas(payload[0].value, true) : null;
		let formattedValue = typeof yAxisLabel === 'function' ? yAxisLabel(value) : yAxisLabel.replace('%d', value);
		return (
			<div className={css.nekoToolTip}>
				<div>{formattedDate}</div>
				<div><b>{formattedValue}</b></div>	
			</div>
		);
	}
	return null;
};

const useStyles = makeStyles(theme => ({
	nekoToolTip: {
		fontFamily: theme.fonts.FAMILY.ROBOTO,
		fontSize: theme.fonts.SIZE[14],
		background: 'white', 
		color: 'black',
		padding: '5px 7px', 
		borderRadius: 3, 
		boxShadow: '0px 1.4px 2.3px 0px #747474'
	}
}))

NekoToolTip.propTypes = {
  active: PropTypes.bool,
	payload: PropTypes.array,
	label: PropTypes.any,
	yAxisLabel: PropTypes.any
};

export { aggregateSeries, defaultChartType, makeYAxisTickFormatter, dataAggregatorOptimizer, numberWithCommas, getLastValue,
	yAxisTickFormatter, xAxisTickFormatter, calculateChartSizes, NekoToolTip };