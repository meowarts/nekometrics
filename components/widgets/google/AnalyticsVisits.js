import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import MetricDisplay from '../common/MetricDisplay';
import { yAxisTickFormatter, xAxisTickFormatter, numberWithCommas } from '~/components/widgets/helpers';
import StandardChart from '../common/StandardChart';

const AnalyticsVisits = (props) => {
	const css = useStyles();
	const { widget, data: originalData } = props;
	const { data, by } =  originalData;

	return (
		<div className={css.container}>
			<MetricDisplay data={data} by={by} />
			<StandardChart widget={widget} data={data} 
				xAxisTickFormatter={(value) => xAxisTickFormatter(value, by)}
				yAxisLabelFormatter={(value) => 'Visits: ' + numberWithCommas(value)}
			/>
		</div>
	);
}

const useStyles = makeStyles(theme => ({
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
