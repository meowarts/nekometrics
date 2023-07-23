import styled from 'styled-components';
import { NekoGradientText } from '~/theme';
import ListItem from './ListItem';

const SectionWrapper = styled.section`
    display: flex;
    flex-direction: row;
    padding: 50px 140px;
    margin-bottom: 90px;
    background: rgb(255 255 255 / 4%);
    
    & .image {
      width: 360px;
      height: 290px;
    }
    
    & .text {
      flex: 1;
      align-self: center;
    }

    @media (max-width: 900px) {
      flex-direction: column;

      & .img { 
          align-self: center;
      }
      & h2 { 
          text-align: center;
      }
    }

    & .gradient {
      gradient: ${NekoGradientText}
    }
`

const InTheKnowSection = () => {

  return (
    <SectionWrapper>
      <div className="text">
        <h2> Always be <span className="gradient"><br />in the know</span> </h2>
        <ul>
          <ListItem imgTitle="Graph Icon" src="/barchart-icon.svg"
            text="Pretty dashboard with your fresh metrics."
          />
          <ListItem imgTitle="Eyes Icon" src="/eyes-icon.svg"
            text="In a glance, you know everything!"
          />
          <ListItem imgTitle="Heart Icon" src="/heart-icon.svg"
            text="More time for you to enjoy and relax."
          />
          <ListItem imgTitle="Eyes Icon" src="/coffee-icon.svg"
            text="Say hi to your morning coffee's best friend!"
          />
        </ul>
      </div>
      <img className="image" title='Metrics Dashboard System' src='/nekoscientist.svg'/>
    </SectionWrapper>
  )
}

export default InTheKnowSection