import styled from 'styled-components';
import { NekoFonts } from '~/theme';

import {
  MobileFriendly,
  ListAlt,
  TouchApp,
  AlarmOn,
  Euro,
  HeadsetMic
} from '@material-ui/icons';

const icons = {
  'print': <ListAlt />,
  'mobile': <MobileFriendly />,
  'easy': <TouchApp />,
  'fast': <AlarmOn />,
  'cheap': <Euro />,
  'support': <HeadsetMic />
}

const StyledWrapper = styled.span`
  flex: 50%;
  margin-bottom: 10px;
  padding: 10px 15px;
  
  & span {
    display: flex;
    align-items: center;
  }
  & h3 { 
    padding-left: 10px;
    margin: 0;
  }
  & p { 
    margin: 0;
    padding-top: 5px;    
    font-family: ${NekoFonts.FAMILY.ROBOTO};
    font-size: ${NekoFonts.SIZE[16]};
  }
`

const USPItem = ({ iconName, header, description }) => {
  const icon = icons[iconName]

  return (
    <StyledWrapper>
      <span>{icon}<h3>{header}</h3></span>
      <p>{description}</p>
    </StyledWrapper>
  )
}

export default USPItem