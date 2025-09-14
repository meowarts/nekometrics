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

export { dataAggregatorOptimizer, numberWithCommas, getLastValue,
	yAxisTickFormatter, xAxisTickFormatter, calculateChartSizes, NekoToolTip };