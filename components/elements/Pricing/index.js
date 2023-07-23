import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import NekoButton from '~/components/buttons/NekoButton';
import useOnScreen from '~/libs/useOnScreen';
import { NekoFonts, NekoGradientText, NekoColors } from '~/theme';
import EmailInput from '../Title/EmailInput';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  margin-bottom: 120px;
  position: relative;
  padding-top: 10px;

  & .gradient {
    gradient: ${NekoGradientText}
  }

  & .early-access {
    
    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: linear-gradient(120deg, #031d3c, #1d1b31);
      transition: opacity 1s ease-out;
      opacity: 0;
    }
  }

  & .join-waitlist {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    transition: opacity 1s ease-out;
    opacity: 0;

    b {
      gradient: ${NekoGradientText};
      font-weight: normal;
    }
  }

  & .early-access-enabled {

    & .early-access {
      &:after {
        opacity: .96;
      }
    }


    & .join-waitlist {
      opacity: 1;
    }

  }
}
`

const StyledPricing = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`

const StyledPriceItem = styled.div`
  background: #192135;
  border: 1px solid rgb(255 255 255 / 15%);
  box-sizing: border-box;
  border-radius: 5px;
  width: 260px;
  height: 320px;
  margin: 0 10px 0 10px;
`

const StyledPriceHeader = styled.div`
  background: linear-gradient(45deg,#9f68ff40,#ff4b4940);
  height: 75px;
  font-family: ${NekoFonts.FAMILY.NOVA_FLAT};
  font-size: ${NekoFonts.SIZE[25]};
  font-weight: ${NekoFonts.WEIGHT[500]};
  display: flex;
  align-items: center;
  justify-content: center;

  &.highlight {
    background: linear-gradient(45deg,#9f68ff8f,#ff4b499e);
  }
`

const StyledPriceContent = styled.div`
  padding: 18px;
  
  & .description {
    font-size: ${NekoFonts.SIZE[16]};
    line-height: 18px;
    padding-top: 5px;
  }

  & .count, & .price {
    font-size: 18px;
    font-weight: 600;
    padding-top: 25px;
  }

  & .count > span {
    color: ${NekoColors.PINK};
  }

  & .price > span {
    color: ${NekoColors.PURPLE};
    font-size: ${NekoFonts.SIZE[32]};
  }
`

const pricesRepository = [
  { name: 'PRO', price: '~ $15', widgetCount: '15+', description: 'Perfect for those with vast online presences' },
  { name: 'STANDARD', price: '$10', widgetCount: '10', description: 'Perfect for small online business owners' },
  { name: 'HOBBY', price: '$5', widgetCount: '5', description: 'Perfect for single sites or early-stage influencers' }
]

const Pricing = () => {

  const ref = useRef();
  const isVisible = useOnScreen(ref, 2500);
  const [earlyAccess, setEarlyAccess] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setEarlyAccess(isVisible);
    }
  }, [isVisible]);

  return (
    <StyledWrapper>

      <div ref={ref} className={earlyAccess ? 'early-access-enabled' : ''}>

        <div className={'early-access'}>
          <h2 className="gradient" style={{ marginBottom: 25 }}>Pricing</h2>
          <StyledPricing>
            {pricesRepository.map( price => 
              <StyledPriceItem key={price.name}>
                  <StyledPriceHeader className={price.name === 'STANDARD' ? 'highlight' : ''}>{price.name}</StyledPriceHeader>
                  <StyledPriceContent>
                    <li className="description">{price.description}</li>
                    <li className="count"><span>{price.widgetCount}</span> WIDGETS</li>
                    <li className="price"><span>{price.price}</span> / MONTH</li>
                  </StyledPriceContent>
                  <NekoButton onClick={() => { setEarlyAccess(true) }} primary style={{margin: '0 10px'}}>Start for Free</NekoButton>
              </StyledPriceItem>
            )}
          </StyledPricing>
          <p style={{ fontSize: '16px', paddingTop: '20px' }}>First month is free. Cancellable anytime!</p>
        </div>

        <div className='join-waitlist'>
          <p style={{ width: '90%', maxWidth: 580 }}>
            We accept users <b>little by little</b> to make sure everything works switfly. Please join our <b>waitlist</b> and you will get your <b>free early access</b> soon ☺️
          </p>
          <EmailInput />
        </div>

      </div>

    </StyledWrapper>
    )
}

export default Pricing