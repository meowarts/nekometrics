import styled from 'styled-components';
import { NekoFonts } from '~/theme';

const StyledWrapper = styled.span`
  display: flex;
  & p { 
    margin: 10px 10px 10px 0px;
    font-family: ${NekoFonts.FAMILY.CODA};
    font-size: ${NekoFonts.SIZE[18]};
  }
`

const ListItem = ({ imgTitle, src, text }) => {
  return (
    <StyledWrapper>
      <img title={imgTitle} src={src} style={{ width: 30, justifySelf: 'left', marginRight: 15 }} />
      <p>{text}</p>
    </StyledWrapper>
  )
}


export default ListItem