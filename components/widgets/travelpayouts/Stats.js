import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import MetricDisplay from '../common/MetricDisplay';
import StandardChart from '../common/StandardChart';

const LABELS = {
	clicks: { name: 'Clicks', prefix: '' },
	bookings: { name: 'Bookings', prefix: '' },
	earnings: { name: 'Earnings', prefix: '$' },
	potential: { name: 'Potential', prefix: '$' }
};

const Stats = (props) => {
	const css = useStyles();
	const { widget, data, kind } = props;
	const label = LABELS[widget?.settings?.metric] || LABELS.clicks;

	return (
		<div className={css.container}>
			<MetricDisplay data={data} kind={kind} prefix={label.prefix} />
			<StandardChart widget={widget} kind={kind} data={data}
				yAxisLabelFormatter={`${label.name}: ${label.prefix}%d`} />
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

Stats.propTypes = {
	widget: PropTypes.object,
	data: PropTypes.array,
	kind: PropTypes.string
};

export default Stats;
