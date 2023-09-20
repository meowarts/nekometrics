import styled from 'styled-components';
import { NekoFonts, NekoGradientText } from '~/theme';

import Quote from './Quote';

const StyledWrap = styled.section`
    display: flex;
    background: linear-gradient(45deg,#9f68ff73,#ff4b4970);
    padding: 40px 140px;    
    margin: 0 0px 90px 0px;
    border-radius: 10px;
    
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
            <h2> The <br/>Story </h2>
            <div style={{ flex: 2, alignSelf: 'center' }}>
                <Quote 
                p1="Tracking countless metrics became a real pain. After sifting through several dashboard systems that were confusing, prone to errors, or too pricey, I decided to design my own: Nekometrics. It's been fantastic for me, and I believe you'll find it just as valuable."
                />
            </div>
        </StyledWrap>
    )
}

export default NekoStory
