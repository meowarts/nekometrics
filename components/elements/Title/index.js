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
          The metrics dashboard that focuses on stability and simplicity. You will love it.
        </h4>
      </>

      {/* {!user &&
        <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <EmailInput />
          <p style={{ width: '80%', maxWidth: 580 }}>
            To guarantee the quality of Nekometrics, we accept users little by little, and through invitations. Let us know your email here and we will invite you soon 😌 !
          </p>
        </div>
      } */}

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

