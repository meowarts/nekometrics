import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import MetricDisplay from '../common/MetricDisplay';
import StandardChart from '../common/StandardChart';

const Metric = (props) => {
	const css = useStyles();
	const { widget, data, kind } = props;
	const label = widget && widget.name ? widget.name : 'Value';

	return (
		<div className={css.container}>
			<MetricDisplay data={data} kind={kind} />
			<StandardChart widget={widget} kind={kind} data={data} yAxisLabelFormatter={`${label}: %d`} />
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

Metric.propTypes = {
	widget: PropTypes.object,
	data: PropTypes.array,
	kind: PropTypes.string
};

export default Metric;
