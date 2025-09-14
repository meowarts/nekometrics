import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import MetricDisplay from '../common/MetricDisplay';
import StandardChart from '~/components/widgets/common/StandardChart';

const FakeHistorical = (props) => {
	const css = useStyles();
	const { widget, data } = props;

	return (
		<div className={css.container}>
			<MetricDisplay data={data} />
			<StandardChart widget={widget} data={data} />
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
	},
	chartNoInfo: {
		flex: 1,
		color: 'gray',
		fontSize: theme.fonts.SIZE[14],
		fontFamily: theme.fonts.FAMILY.ROBOTO,
		textTransform: 'uppercase',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center'
  	},
	chart: {
		'& .recharts-cartesian-axis-tick': {
			fontSize: theme.fonts.SIZE[14],
			fontFamily: theme.fonts.FAMILY.ROBOTO
		},
		'& .recharts-cartesian-grid line': {
			stroke: theme.common.GRID_COLOR,
      strokeWidth: '0.2px'
		},
	}
}));

FakeHistorical.propTypes = {
	widget: PropTypes.object,
	data: PropTypes.array
};

export default FakeHistorical;
