import useGlobalState from '~/libs/context';
import styled from 'styled-components';
import { NekoFonts, NekoGradientText } from '~/theme';
import Link from 'next/link';

import NekoButton from '~/components/buttons/NekoButton';

const StyledWrap = styled.section`
  display: flex;
  flex-direction: column;
  text-align: center;
  margin: 100px 0;

  & p { 
    margin: 5,
    font-size: ${NekoFonts.SIZE[14]}
  }

  & h4 { 
    margin: 30px 10px 20px;
    font-size: ${NekoFonts.SIZE[20]};
    font-family: ${NekoFonts.FAMILY.CODA};
    font-weight: ${NekoFonts.WEIGHT[400]};
  }

  & .gradient {
    gradient: ${NekoGradientText};
}

`

const CutifiedInstantTextImg = styled.img`
  position: absolute;
  margin-left: -20px;
  margin-top: -8px;
  z-index: -1;
  width: 60px;
  @media (max-width: 900px) {
    width: 40px
  }
`

const CutifiedSTextImg = styled.img`
  position: absolute;
  margin-left: 2px;
  margin-top: -8px;
  width: 50px;
  @media (max-width: 900px) {
    width: 30px;
  }
`

const TitleSection = () => {
  const { user } = useGlobalState();

  const CutifiedInstantText = () => {
    return (<>
      <CutifiedInstantTextImg src='/hero-neko.svg' alt='Instant Neko'/>
      <>Instant&nbsp;</>
    </>);
  }

  const CutifiedSText = () => {
    return (<>
      <CutifiedSTextImg src='/hero-social.svg' alt='Instant Neko'/>
      <>s</>
    </>);
  }

  return (
    <>
    <StyledWrap>
      <>
        <h1>
          <CutifiedInstantText />access to all <br /> your metrics and KPI<CutifiedSText />
        </h1>
        <h4 className="gradient">
          Nekometrics is an OpenSource project that allows you to centralize all your metrics and KPIs in one place, with pretty but powerful dashboards.
        </h4>
      </>

      {user && 
        <Link href="/dashboard" passHref>
          <NekoButton big primary text="Go to Dashboard" style={{ marginTop: 20 }} />
        </Link>
      }
    </StyledWrap>
</>
  )
}


export default TitleSection

