import { useState } from 'react';
import DayJs from 'dayjs';

import { Card, CardHeader, Avatar, IconButton, Dialog } from '@material-ui/core';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';

import SoftBusyOverlay from '~/components/SoftBusyOverlay';
import useGlobalState from '~/libs/context';
import { ServicesRepository } from '~/components/services/ServicesRepository';
import NekoButton from '~/components/buttons/NekoButton';
import { NekoDialogActionWrapper, NekoDialogContentWrapper } from '~/components/elements/NekoElements';

function DataSourceModal() {
  const css = useStyles();
  const { services, deleteService, refreshService, toggleModal, modals } = useGlobalState(); 
  const [ busyServices, setBusyServices ] = useState([]);
  const [ dialog, setDialog ] = useState();

  const onRefresh = async (serviceId) => {
    setBusyServices([...busyServices, serviceId]);
    await refreshService(serviceId);
    setBusyServices(busyServices.filter(x => x !== serviceId));
  }

  const onDelete = async (serviceId) => {
    if (confirm("Are you sure you would like to delete this data source? Widgets related to this source will not be able to refresh after this.")) {
      setBusyServices([...busyServices, serviceId]);
      await deleteService(serviceId);
      setBusyServices(busyServices.filter(x => x !== serviceId));
    }
  }  

  const onAddDataSourceClick = () => { 
    toggleModal('adddatasource');
    toggleModal('datasources');
  };


  return (
    <Dialog open={modals.datasources} className={css.dialog} onClose={() => toggleModal('datasources')}>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} 
        onClick={() => toggleModal('datasources')}/>
      <h5>DATA SOURCES</h5>
      <NekoDialogContentWrapper>
          {Boolean(!services.length) && <p>Your account is not connected to any data source yet. Click on <b>Add Data Source</b>, choose a service, and allow Nekometrics to use it on your behalf. Then, add a widget in your dashboard and set it to this data source. You can add as many data sources as you like, even if they are of the same type.</p>}

          {Boolean(services.length > 0) && <p style={{ margin: '0px 0px 20px' }}>If you modify one of your data sources (such as adding a new website to your Google Analytics, a new Instagram account to your Facebook, a new list to your Mailchimp, etc), use the <AutorenewIcon className={css.refreshIcon} /> icon to sync this information with Nekometrics.</p>}

          {services.map(service =>  {
            let serviceSpine = ServicesRepository.find(x => x.name === service.service);
            const ConfigDialog = serviceSpine.configDialog ? serviceSpine.configDialog : null;
            let updatedOn = DayJs(service.updatedOn).format('YYYY/MM/DD');
            return (
              <Card key={service._id} style={{ marginBottom: 10 }}>
                <SoftBusyOverlay busy={busyServices.includes(service._id)}>
                  <CardHeader title={service.name} 
                    subheader={`${service.data.username} (${service.service}) - Refreshed: ${updatedOn}`} 
                    avatar={<Avatar style={{ backgroundColor: serviceSpine.color }}><serviceSpine.icon /></Avatar>} 
                    action={
                      <>
                        <IconButton size="small" onClick={() => onDelete(service._id)}><DeleteOutlineIcon /></IconButton>
                        {ConfigDialog && <>
                          <IconButton size="small" disabled={true} onClick={() => setDialog(serviceSpine.name)}><
                            EditIcon />
                          </IconButton>
                          <ConfigDialog open={dialog === serviceSpine.name} onClose={() => { 
                            setDialog(null);
                          }}></ConfigDialog>
                        </>}
                        <IconButton size="small" onClick={() => onRefresh(service._id)}><AutorenewIcon /></IconButton>
                      </>}>
                  </CardHeader>
                </SoftBusyOverlay>
              </Card>
            )
          }
          )}
      </NekoDialogContentWrapper>

      <NekoDialogActionWrapper>
        <NekoButton tertiary onClick={onAddDataSourceClick} style={{ width: '100%' }}>
          <AddIcon /> Add Data Source
        </NekoButton>
      </NekoDialogActionWrapper>
    </Dialog>
  );
}

const useStyles = makeStyles(theme => ({
  refreshIcon: {
    fontSize: theme.fonts.SIZE[18],
    position: 'relative',
    top: 5,
    height: 20,
    marginTop: -5
  },
  dialog: {
    '& .MuiCard-root': { background: theme.common.SERVICE_CARD_BACKGROUND },
    '& .MuiPaper-elevation1': { boxShadow: 'none' },
    '& .MuiCardHeader-action': {
      alignSelf: 'center',
      marginRight: 0
    }      
  }
}));

export default DataSourceModal;
