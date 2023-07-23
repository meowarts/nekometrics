import { useState } from 'react';

import { Dialog, TextField } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';

import useGlobalState from '~/libs/context';
import NekoButton from '~/components/buttons/NekoButton';
import { NekoDialogActionWrapper, NekoDialogContentWrapper } from '~/components/elements/NekoElements';

function CreateDashboardModal(props) {
  const [ name, setName ] = useState('My Dashboard');
  const { createDashboard } = useGlobalState();

  const onAdd = async () => {
    await createDashboard({ name });
    props.onClose();
  }

  return (
    <Dialog {...props}>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => props.onClose()}/>
      <h5>CREATE DASHBOARD</h5>
      <NekoDialogContentWrapper>
        <TextField autoFocus id="DashboardName" label="Name" type="text" value={name} placeholder='Dashboard name'
          style={{ minWidth: 280 }}
          onChange={ev => setName(ev.target.value)} fullWidth />
      </NekoDialogContentWrapper>

      <NekoDialogActionWrapper>
          <NekoButton tertiary onClick={() => onAdd()} disabled={!name || !name.length}>Create</NekoButton>
      </NekoDialogActionWrapper>

    </Dialog>
  );
}

export default CreateDashboardModal;
