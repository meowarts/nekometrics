import styled from 'styled-components';
import { NekoFonts, NekoGradientText } from '~/theme';
import Link from 'next/link';

import NekoButton from '../../buttons/NekoButton';

const StyledWrapper = styled.section`
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    margin: 0 0 90px 0;

    & p { 
        margin: 10px 0;
        font-size: ${NekoFonts.SIZE[16]}
    }

    & .gradient {
        gradient: ${NekoGradientText}
    }
`

const Contact = ({ message }) => {

    return(
        <StyledWrapper>
            <h2 className="gradient"> Contact Us </h2>
            <p>{message}</p>
            <Link href="/contact" passHref>
                <NekoButton primary text="Talk with Nekometrics Team" style={{ marginTop: 10 }} />
            </Link>
        </StyledWrapper>
    )
}

export default Contact