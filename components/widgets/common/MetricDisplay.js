import { useContext, useMemo, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import CountUp from 'react-countup';

import { getLastValue } from '~/components/widgets/helpers';
import { PulseContext } from './PulseLine';

const MetricDisplay = (props) => {
	const { data, prefix = '', kind = 'flow' } = props;
	const css = useStyles();
	// The chart leaves out the period in progress, so the number must too, or the
	// two disagree: a Sunday morning showed "0" above a chart whose last bar was
	// 800, both correct, describing different weeks. A level has no incomplete
	// period, so it keeps everything.
	const shown = useMemo(
		() => (kind !== 'stock' && data && data.length > 1) ? data.slice(0, -1) : data,
		[data, kind]);
	// A flow's number is the same period the bar at the foot of the card judges,
	// so the two read as one sentence. It used to be the last day alone: "$2,455"
	// above "$11.4k this week" described two different things on one card.
	const pulse = useContext(PulseContext);
	const period = (kind === 'flow' && pulse && pulse.kind === 'flow') ? pulse : null;
	const lastBucket = useMemo(() => getLastValue(shown), [shown]);
	const last = period ? period.value : lastBucket;

	// Counting up from zero on arrival means the board shows nothing true for
	// the first seconds of every visit, across every card at once. The first
	// value is simply printed; only later changes are worth animating, and
	// preserveValue makes those run from the number already on screen.
	const opening = useRef(null);
	if (opening.current === null && last !== null && last !== undefined) {
		opening.current = parseInt(last);
	}

	return (
		<div className={css.glance}>
			<div className={css.last}>
				{last ? (
					<CountUp prefix={prefix} preserveValue={true} separator=" "
						start={opening.current !== null ? opening.current : 0} end={parseInt(last)} />
				) : (
					'0'
				)}
			</div>
			{period && <div className={css.period}>last {period.window} days</div>}
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
		marginBottom: 0
	},
	period: {
		marginTop: -6,
		fontSize: 11,
		lineHeight: 1,
		opacity: 0.5
	}
}));

MetricDisplay.propTypes = {
	data: PropTypes.array,
	prefix: PropTypes.string,
	kind: PropTypes.string
};

export default MetricDisplay;