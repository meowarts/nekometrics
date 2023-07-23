import styled from 'styled-components';
import USPItem from './USPItem';

const USPs = [
    {
      name: "print",
      header: "PRINTABLE",
      description: "Easily get an analog copy of your dashboards to hand out in meetings, or to log for safe keeping."
    },
    {
      name: "mobile",
      header: "MOBILE FRIENDLY",
      description: "Check in on your metrics and stay up to date while on-the-go. Never worry about missing an update."
    },
    {
      name: "easy",
      header: "EASY UI",
      description: "Hit the ground running and get what you need right away. Stop spending hours trying to figure out how the app works."
    },
    {
      name: "fast",
      header: "SPEEDY",
      description: "Enjoy extremely fast load times, no matter how many dashboards and/or metrics you have!"
    }
]

const StyledWrapper = styled.section`
  background-image: url(/why-neko-bg.svg);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  margin-bottom: 90px;
  
  & div {
    display: flex;
    flex-wrap: wrap;
    margin: auto;
    width: 430px;
    padding-bottom: 80px;
  }

  & h2 { 
    width: 430px;
    margin: auto auto 15px auto !important;
    padding: 110px 0px 0px 15px;
    text-align: left;
  }
  
  @media (max-width: 768px) {
    background-image: none;
    & div { width: 320px };
    & h2 { width: 320px };
  }
`

const WhyNeko = () => {
    
    return(
        <StyledWrapper>
            <h2> Why Nekometrics? </h2>
            <div>
            { USPs.map( usp => {
                return(
                <USPItem
                    key={`why-neko-${usp.name}`}
                    iconName={usp.name}
                    header={usp.header}
                    description={usp.description}
                />
                )
            })}
            </div>
        </StyledWrapper>
    )
}

export default WhyNeko
