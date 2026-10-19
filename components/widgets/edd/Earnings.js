import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import MetricDisplay from '../common/MetricDisplay';
import StandardChart from '../common/StandardChart';
import TodayDisplay from '../common/TodayDisplay';

const Earnings = (props) => {
	const css = useStyles();
	const { widget, data, daily, kind } = props;

	if (widget.settings?.chart?.type === 'today') {
		return <TodayDisplay widget={widget} data={daily} color={widget.settings.color || '#FF6384'} />;
	}

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

Earnings.propTypes = {
	widget: PropTypes.object,
	data: PropTypes.array,
	daily: PropTypes.array,
	kind: PropTypes.string
};

export default Earnings;
