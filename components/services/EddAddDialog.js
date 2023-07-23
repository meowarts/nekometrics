import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, TextField } from "@material-ui/core";

import useGlobalState from '~/libs/context';
import NekoButton from '~/components/buttons/NekoButton';

function EddAddDialog(props) {
  const [endpoint, setEndpoint] = useState('');
  const [token, setToken] = useState('');
  const [key, setKey] = useState('');
  const { createService } = useGlobalState();

  // const onTest = () => {
  // }

  const onAdd = async () => {
    await createService({ service: 'edd', endpoint, token, key });
    props.onClose();
  }

  return (
    <Dialog {...props}>
      <h5>EDD Service</h5>
      <DialogContent>
        <TextField autoFocus id="API URL" label="API URL" type="text" value={endpoint} 
          placeholder='https://yourwebsite.com/edd-api'
          onChange={ev => setEndpoint(ev.target.value)} fullWidth />
        <TextField id="Key" label="Public Key" type="text" value={key} 
          onChange={ev => setKey(ev.target.value)} fullWidth />
        <TextField id="Token" label="Token" type="text" value={token} 
          onChange={ev => setToken(ev.target.value)} fullWidth />
      </DialogContent>

      <DialogActions>
        <NekoButton tertiary onClick={() => onAdd()} >Add Service</NekoButton>
      </DialogActions>

    </Dialog>
  );
}

export default EddAddDialog;
