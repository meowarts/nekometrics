import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, FormHelperText } from "@material-ui/core";

import useGlobalState from '~/libs/context';
import NekoButton from '~/components/buttons/NekoButton';

function PlausibleAddDialog(props) {
  const [endpoint, setEndpoint] = useState('https://plausible.io');
  const [key, setKey] = useState('');
  const [sites, setSites] = useState('');
  const { createService } = useGlobalState();

  const onAdd = async () => {
    await createService({ service: 'plausible', endpoint, key, sites });
    props.onClose();
  }

  return (
    <Dialog {...props}>
      <h5>Plausible</h5>
      <DialogContent>
        <FormHelperText style={{ marginBottom: 10 }}>
          Works with plausible.io and with your own install. Create a key under
          Settings &rarr; API keys, then list the sites you want, one per line.
          Plausible does not let a key ask which sites it can read, so they have
          to be named. Each one is checked before the source is saved.
        </FormHelperText>
        <TextField autoFocus id="Endpoint" label="Address" type="text" value={endpoint}
          placeholder='https://plausible.io'
          onChange={ev => setEndpoint(ev.target.value)} fullWidth />
        <TextField id="Key" label="API Key" type="text" value={key}
          onChange={ev => setKey(ev.target.value)} fullWidth />
        <TextField id="Sites" label="Sites" type="text" value={sites} multiline minRows={3}
          placeholder={'example.com\nanother.com'}
          onChange={ev => setSites(ev.target.value)} fullWidth />
      </DialogContent>

      <DialogActions>
        <NekoButton tertiary onClick={() => onAdd()} >Add Service</NekoButton>
      </DialogActions>
    </Dialog>
  );
}

export default PlausibleAddDialog;
