import CountUp from 'react-countup';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { NekoFonts } from '~/theme';

const StyledNumber = styled.div`
  font-Family: ${NekoFonts.FAMILY.ROBOTO};
  font-size: ${NekoFonts.SIZE[32]};
  font-weight: ${NekoFonts.WEIGHT[700]};
`;

const LatestValue = (props = {}) => {
  const { preserveValue = true, separator = " ", value = 0 } = props;
  return (
    <StyledNumber>
      <CountUp preserveValue={preserveValue} separator={separator} end={value} />
    </StyledNumber>
  );
}

LatestValue.propTypes = {
	preserveValue: PropTypes.bool,
	separator: PropTypes.string,
  value: PropTypes.number
};

export { LatestValue }