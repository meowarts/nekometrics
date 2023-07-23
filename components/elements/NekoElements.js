import styled from 'styled-components';
import { NekoFonts, NekoColors } from '~/theme';

// NEW NEKO DIALOG ELEMENTS STYLES


// TO-DO: Display works properly but interferes with data handling.
// const NekoDialog = styled.div`
//   background: white;
//   min-width: 600px;
//   position: fixed;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);  
//   border-radius: 2px;
// `;

const NekoDialogActionWrapper = styled.div`
  display: flex;
  padding: 0 25px 25px;
  justify-content: flex-end;
`

const NekoDialogContentWrapper = styled.div`
  padding: 20px 24px;
  overflow-y: auto;
`

const NekoBigWidgetButtons = styled.button`
  border: none;
  border-radius: 5px;
  height: 120px;
  width: 120px;
  cursor: pointer;

  & .buttonContent {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-transform: none;
    font-size: ${NekoFonts.SIZE[14]};
    color: ${NekoColors.WHITE};
    line-height: 17px;
    font-weight: ${NekoFonts.WEIGHT[500]};
    font-family: 'Roboto';
  }
  
  & img {
    height: 34px;
    background: white;
    border-radius: 100px;
    padding: 5px;
    margin-bottom: 5px;
  }
  
  &:hover {
    border: 2px solid #E4D4FF;
    background: #fbf2fff7;
  }      
`

export { NekoDialogActionWrapper, NekoDialogContentWrapper, NekoBigWidgetButtons };