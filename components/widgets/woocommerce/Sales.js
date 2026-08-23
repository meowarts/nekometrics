import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import MetricDisplay from '../common/MetricDisplay';
import StandardChart from '../common/StandardChart';

const Sales = (props) => {
	const css = useStyles();
	const { widget, data, kind } = props;

	return (
		<div className={css.container}>
			<MetricDisplay data={data} kind={kind} prefix="$" />
			<StandardChart widget={widget} kind={kind} data={data} yAxisLabelFormatter='Income: $%d' />
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

Sales.propTypes = {
	widget: PropTypes.object,
	data: PropTypes.array,
	kind: PropTypes.string
};

export default Sales;
