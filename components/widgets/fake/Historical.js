import { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import CountUp from 'react-countup';

import { PeriodsDiff } from '../common/PeriodsDiff';
import { getLastValue } from '~/components/widgets/helpers';
import StandardChart from '~/components/widgets/common/StandardChart';

const FakeHistorical = (props) => {
	const css = useStyles();
	const { widget, data } = props;

	const last = useMemo(() => getLastValue(data), [data]);

	return (
		<div className={css.container}>
			<div className={css.glance}>
				<div className={css.last}><CountUp preserveValue={true} separator=" " end={parseInt(last)} /></div>
				<div className={css.lastLabel}><PeriodsDiff data={data} /></div>
			</div>
			<StandardChart widget={widget} data={data} />
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
