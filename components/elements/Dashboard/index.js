import styled from 'styled-components';
import { NekoFonts, NekoGradientText } from '~/theme';
import useGlobalState from '~/libs/context';
import { useRouter } from 'next/router';

import NekoButton from '../../buttons/NekoButton';

const SectionWrapper = styled.section`
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  margin: 0 0 90px 0;

  & img { 
    width: 90%;
    margin: 20px 0;
  }

  & p { font-size: ${NekoFonts.SIZE[18]}; }

  & h2 {
    margin: 0 300px;
  }
  
  & .gradient { 
    gradient: ${NekoGradientText}
  }

  @media (max-width: 768px) {
    & h2 { margin: 0; }
  }
`

const Dashboard = () => {
  const { user } = useGlobalState();
  const router = useRouter();

  if (user) {
    return null;
  }

  return (
    <SectionWrapper>
      <h2 className="gradient">So, what does it look like? </h2>
      <p>Simply try the demo, it is only one click away. No need to register or anything 😎</p>
      <NekoButton big primary text="Try the demo !" style={{ marginTop: 10 }} 
        onClick={() => router.push('/demo')} />
    </SectionWrapper>
  )
}

export default Dashboard