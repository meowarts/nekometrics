import { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import CountUp from 'react-countup';

import { PeriodsDiff } from '../common/PeriodsDiff';
import { getLastValue, yAxisTickFormatter, xAxisTickFormatter } from '~/components/widgets/helpers';
import StandardChart from '../common/StandardChart';

const AnalyticsVisits = (props) => {
	const css = useStyles();
	const { widget, data: originalData } = props;
	const { data, by } =  originalData;
	const last = useMemo(() => getLastValue(data), [data]);

	return (
		<div className={css.container}>
			<div className={css.glance}>
				<div className={css.last}><CountUp preserveValue={true} separator=" " end={parseInt(last)} /></div>
				<div className={css.lastLabel}><PeriodsDiff data={data} /></div>
			</div>
			<StandardChart widget={widget} data={data} 
				xAxisTickFormatter={(value) => xAxisTickFormatter(value, by)}
				yAxisLabelFormatter={(value) => 'Visits: ' + yAxisTickFormatter(value)}
			/>
		</div>
	);
}

const useStyles = makeStyles(theme => ({
	glance: {
		marginTop: 0,
		marginBottom: 5,
		textAlign: 'center',
		fontFamily: theme.fonts.FAMILY.ROBOTO,
		color: theme.common.COLOR_PRIMARY_NEKO,
	},
	last: {
		fontSize: theme.fonts.SIZE[32],
		fontWeight: theme.fonts.WEIGHT[700],
		marginBottom: '-3px'
	},
	container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
	}
}));

AnalyticsVisits.propTypes = {
	widget: PropTypes.object,
	data: PropTypes.object
};

export default AnalyticsVisits;
