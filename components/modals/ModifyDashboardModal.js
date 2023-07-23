import { useState, useEffect } from 'react';
import {TextField, Dialog} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';

import styled from 'styled-components';

import useGlobalState from '~/libs/context';
import NekoButton from '~/components/buttons/NekoButton';
import { NekoDialogActionWrapper, NekoDialogContentWrapper } from '~/components/elements/NekoElements';

const StyledSubHeader = styled.h3`
  margin: 20px 0px 0px;
  font-size: 14px;
  font-weight: 500;
  color: #AB7BFF;  
`;

const StyledImageWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const StyledImageItem = styled.a`
  cursor: pointer;

  & img {
    width: 100px;
    height: 60px;
    margin-right: 10px;
    border-radius: 4px;
    
    &.selected {
      border: 3px solid #AB7BFF;
      border-radius: 4px;
    }      
  }
`;

const StyledSolidRectangle = styled.img`
  width: 100px;
  height: 60px;
  margin-right: 10px;
  border-radius: 4px;
  background-color: #00091F;
`;

const backgroundRepository = [
  { thumb: '/photos/thumbs/daniel-olah.jpg', full: '/photos/daniel-olah.jpg' },
  { thumb: '/photos/thumbs/daniele-colucci.jpg', full: '/photos/daniele-colucci.jpg' },
  { thumb: '/photos/thumbs/karsten-wurth.jpg', full: '/photos/karsten-wurth.jpg' },
  { thumb: '/photos/thumbs/chris-karidis.jpg', full: '/photos/chris-karidis.jpg' },
  { thumb: '/photos/thumbs/james-wheeler.jpg', full: '/photos/james-wheeler.jpg' },
  { thumb: '/photos/thumbs/dawid-zawila.jpg', full: '/photos/dawid-zawila.jpg' },
  { thumb: '/photos/thumbs/jasper-boer.jpg', full: '/photos/jasper-boer.jpg' },
  { thumb: '/photos/thumbs/david-clode.jpg', full: '/photos/david-clode.jpg' },
  { thumb: '/photos/thumbs/mike-yukhtenko.jpg', full: '/photos/mike-yukhtenko.jpg' },
  { thumb: '/photos/thumbs/mark-basarab.jpg', full: '/photos/mark-basarab.jpg' },
  { thumb: '/photos/thumbs/marek-piwnicki.jpg', full: '/photos/marek-piwnicki.jpg' },
  { thumb: '/photos/thumbs/will-turner.jpg', full: '/photos/will-turner.jpg' },
  { thumb: '/photos/thumbs/hello-lightbulb.jpg', full: '/photos/hello-lightbulb.jpg' },
  { thumb: '/photos/thumbs/denys-nevozhai.jpg', full: '/photos/denys-nevozhai.jpg' },
  { thumb: '/photos/thumbs/martin-jernberg.jpg', full: '/photos/martin-jernberg.jpg' },
  { thumb: '/photos/thumbs/robert-murray.jpg', full: '/photos/robert-murray.jpg' },
  { thumb: '/photos/thumbs/joel-protasio.jpg', full: '/photos/joel-protasio.jpg' },
  { thumb: '/photos/thumbs/mariola-grobelska.jpg', full: '/photos/mariola-grobelska.jpg' },
  { thumb: '/photos/thumbs/james-donovan.jpg', full: '/photos/james-donovan.jpg' } 
];

function ModifyDashboardModal(props) {
  const { dashboard } = props;
  const [ name, setName ] = useState('');
  const [ settings, setSettings ] = useState('');
  const { updateDashboard, deleteDashboard } = useGlobalState();

  // const onTest = () => {
  // }

  useEffect(() => {
    if (dashboard) {
      setName(dashboard.name);
      setSettings(dashboard.settings ? dashboard.settings : {});
    }
  }, [dashboard]);

  const onUpdate = async () => {
    await updateDashboard({ ...dashboard, name, settings });
    props.onClose();
  }

  const onDelete = async () => {
    if (confirm(`The dashboard ${dashboard.name} will be deleted. Are you sure?`)) {
      await deleteDashboard(dashboard._id);
      props.onClose();
    }
  }

  const updateBackground = async (backImageSrc) => {
    console.log(backImageSrc);
    setSettings({ ...settings, backImageSrc });
  }

  return (
    <Dialog {...props}>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => props.onClose()}/>
      <h5>MODIFY DASHBOARD</h5>
      <NekoDialogContentWrapper>
        <TextField autoFocus id="DashboardName" label="Name" type="text" value={name} placeholder='Dashboard name'
          style={{ minWidth: 280 }} onChange={ev => setName(ev.target.value)} fullWidth />
        <StyledSubHeader>Background Image</StyledSubHeader>
        <StyledImageWrapper>
          <StyledImageItem onClick={() => updateBackground(null)}>
            <StyledSolidRectangle className={!settings?.backImageSrc ? 'selected' : ''}/>
          </StyledImageItem>
          {backgroundRepository.map((bkg, i) =>
            <StyledImageItem key={i} 
              onClick={() => updateBackground(bkg.full)}>
              <img src={bkg.thumb} className={bkg.full === settings?.backImageSrc ? 'selected' : ''}/>
            </StyledImageItem>
          )}
        </StyledImageWrapper>
              
      </NekoDialogContentWrapper>

      <NekoDialogActionWrapper>
          <NekoButton quarternary onClick={() => onDelete()} >Delete</NekoButton>
          <NekoButton tertiary onClick={() => onUpdate()} >Update</NekoButton>
      </NekoDialogActionWrapper>
      
    </Dialog>
  );
}

export default ModifyDashboardModal;
