import styled from 'styled-components';
import { NekoFonts, NekoGradientText } from '~/theme';

import Quote from './Quote';

const StyledWrap = styled.section`
    display: flex;
    background: linear-gradient(45deg,#9f68ff73,#ff4b4970);
    padding: 80px 140px;    
    margin: 0 0px 90px 0px;
    
    & h2 { 
        align-self: center;
        flex: 1;
        margin: 0 20px 0 0 !important;
    }

    & p { 
        font-size: ${NekoFonts.SIZE[15]}
    }

    & .gradient {
        gradient: ${NekoGradientText};
    }

    @media (max-width: 900px) {
        flex-direction: column;
        text-align: center;
    }
`

const NekoStory = () => {
    return(
        <StyledWrap>
            <h2> The <br/>Nekometrics<br/>Story </h2>
            <div style={{ flex: 2, alignSelf: 'center' }}>
                <Quote 
                p1='"I had too many metrics to follow, that was stressful. I tried many metrics dashboard systems but they were all messy, buggy and expensive. I ended up building Nekometrics, and I love it. I hope you will love it too :)"'
                />
            </div>
        </StyledWrap>
    )
}

export default NekoStory
