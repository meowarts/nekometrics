import { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import CountUp from 'react-countup';

import TrendIndicator from './TrendIndicator';
import { getLastValue } from '~/components/widgets/helpers';

const MetricDisplay = (props) => {
	const { data, prefix = '', by = 'day' } = props;
	const css = useStyles();
	const last = useMemo(() => getLastValue(data), [data]);

	return (
		<div className={css.glance}>
			<div className={css.last}>
				{last ? (
					<CountUp prefix={prefix} preserveValue={true} separator=" " end={parseInt(last)} />
				) : (
					'0'
				)}
			</div>
			<div className={css.trendLabel}>
				<TrendIndicator data={data} by={by} />
			</div>
		</div>
	);
};

const useStyles = makeStyles(theme => ({
	glance: {
		color: '#FCFCFC',
		marginTop: 0,
		textAlign: 'center',
		fontFamily: theme.fonts.FAMILY.ROBOTO,
		marginBottom: 5
	},
	last: {
		fontSize: theme.fonts.SIZE[32],
		fontWeight: 500,
		marginBottom: '-5px'
	},
	trendLabel: {
		marginTop: 0
	}
}));

MetricDisplay.propTypes = {
	data: PropTypes.array,
	prefix: PropTypes.string,
	by: PropTypes.string
};

export default MetricDisplay;