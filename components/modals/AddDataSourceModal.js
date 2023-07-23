import { useState } from 'react';

import { Dialog } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';

import useGlobalState from '~/libs/context';
import { ServicesRepository } from '~/components/services/ServicesRepository';
import NekoButton from '~/components/buttons/NekoButton';
import { NekoDialogActionWrapper, NekoDialogContentWrapper, NekoBigWidgetButtons } from '~/components/elements/NekoElements';
import Router from 'next/router';
import SoftBusyOverlay from '../SoftBusyOverlay';

function AddDataSourceModal() {
  const css = useStyles();
  const { serviceLinks, toggleModal, modals } = useGlobalState(); 
  const [ dialog, setDialog ] = useState();
  const [ busy, setBusy ] = useState(false);

  const onServiceClick = (svc) => {
    if (svc.mode === 'dialog') {
      setDialog(svc.name);
    }
    else {
      const url = svc.mode === 'oauth' ? `/api/oauth/${svc.name}` : null;
      if (url) {
        setBusy(svc.name);
        Router.push(url);
      }
    }
  }

  const onBackClick = () => {
    toggleModal('adddatasource');
    toggleModal('datasources');
  }

  return (
    <Dialog open={modals.adddatasource} className={css.dialog} onClose={() => toggleModal('adddatasource')}>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} 
        onClick={() => toggleModal('adddatasource')}/>
      <h5>ADD DATA SOURCE</h5>
      <NekoDialogContentWrapper>
        <div className={css.serviceSelectionContainer}>
          {serviceLinks.map(x => {
          const svc = ServicesRepository.find(s => s.name === x.name);
          const ConfigDialog = svc.configDialog ? svc.configDialog : null;
          return !svc ? null : (
            <SoftBusyOverlay key={`add-service-${x.name}`} busy={busy === x.name}>
              <NekoBigWidgetButtons onClick={() => { onServiceClick(x) }} style={{ background: svc.color }}>
                <div className='buttonContent'>
                  <img style={{ height: 32 }} src={svc.image} />
                  <span>{svc.text}</span>
                </div>
              </NekoBigWidgetButtons>
              {ConfigDialog && <ConfigDialog open={dialog === x.name} onClose={() => { 
                setDialog(null);
              }}></ConfigDialog>}
            </SoftBusyOverlay>
          );
          })}
        </div>
      </NekoDialogContentWrapper>
      <NekoDialogActionWrapper>
        <NekoButton onClick={onBackClick} tertiary>Back</NekoButton>
      </NekoDialogActionWrapper>
    </Dialog>
  );
}

const useStyles = makeStyles(theme => ({
  dialog: {
    '& .MuiCard-root': { background: theme.common.SERVICE_CARD_BACKGROUND },
    '& .MuiPaper-elevation1': { boxShadow: 'none' },
    '& .MuiCardHeader-action': {
      alignSelf: 'center',
      marginRight: 0
    }      
  },
  serviceSelectionContainer: {
    display: 'flex', 
    flexWrap: 'wrap',
    gap: '10px'
  }
}));

export default AddDataSourceModal;
