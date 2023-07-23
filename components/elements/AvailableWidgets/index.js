import styled from 'styled-components';
import { NekoGradientText, NekoFonts } from '~/theme';

const StyledWrapper = styled.section`
  flex: 1;
  text-align: center;
  justify-content: center;
  margin-bottom: 90px;

  & img { 
    width: 75%;
    margin: 20px 0;
  }

  & h2 { margin: 0 250px; }
  
  & p { font-size: ${NekoFonts.SIZE[18]}; }

  @media (max-width: 900px) {
    & h2 { margin: 0 };
    & img { width: 90% };
  }

  & .gradient {
    gradient: ${NekoGradientText}
  }
`

const AvailableWidgets = () => {

  return (
    <StyledWrapper>
      <h2><span className="gradient">Available Data Sources</span></h2>
      <p>We have widgets available for all those data sources, and we will add more over time.</p>
      <img src="./neko-widgets-list.svg" />
    </StyledWrapper>
  )
}

export default AvailableWidgets