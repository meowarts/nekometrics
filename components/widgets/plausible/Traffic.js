import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import MetricDisplay from '../common/MetricDisplay';
import StandardChart from '../common/StandardChart';

const Traffic = (props) => {
	const css = useStyles();
	const { widget, data, kind } = props;
	const label = widget?.settings?.metric === 'pageviews' ? 'Pageviews' : 'Visitors';

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

Traffic.propTypes = {
	widget: PropTypes.object,
	data: PropTypes.array,
	kind: PropTypes.string
};

export default Traffic;
