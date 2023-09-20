import styled from 'styled-components';
import { NekoFonts } from '~/theme';

const StyledWrapper = styled.div`
    & span {
        font-family: ${NekoFonts.FAMILY.CODA};
        font-weight: ${NekoFonts.WEIGHT[400]};
        font-size: ${NekoFonts.SIZE[24]};
        line-height: 30px;
    }
`

const StyledQuote = styled.div`
    align-self: center;
    font-family: ${NekoFonts.FAMILY.CODA};
    font-size: ${NekoFonts.SIZE[18]};
`

const StyledSignature = styled.p`
    text-align: right;
    margin-top: 20px;
    margin-bottom: 0px;
`

const Quote = ({ p1 }) => {

    return (
        <StyledWrapper>
            <StyledQuote>{p1}</StyledQuote>
            <StyledSignature>- Jordy Meow, Founder & Developer</StyledSignature>
        </StyledWrapper>
    )
}

export default Quote