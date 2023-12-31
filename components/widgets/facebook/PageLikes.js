import { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import { PeriodsDiff } from '../common/PeriodsDiff';
import { getLastValue } from '~/components/widgets/helpers';
import StandardChart from '../common/StandardChart';
import { LatestValue } from '../common/LatestValue';

const PageLikes = (props) => {
	const css = useStyles();
	const { widget, data } = props;
	const last = useMemo(() => getLastValue(data), [data]);

	return (
		<div className={css.container}>
			<div className={css.glance}>
				<LatestValue value={parseInt(last)} />
				<PeriodsDiff data={data} />
			</div>
			<StandardChart widget={widget} data={data} yAxisLabelFormatter='Followers: %d' />
		</div>
	);
}

const useStyles = makeStyles(() => ({
	glance: {
		marginTop: 0,
    marginBottom: 5,
    textAlign: 'center'
	},
	container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
	}
}));

PageLikes.propTypes = {
	widget: PropTypes.object,
	data: PropTypes.array
};

export default PageLikes;
