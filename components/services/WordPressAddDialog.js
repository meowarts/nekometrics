import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, FormHelperText } from "@material-ui/core";

import useGlobalState from '~/libs/context';
import NekoButton from '~/components/buttons/NekoButton';

function WordPressAddDialog(props) {
  const [endpoint, setEndpoint] = useState('');
  const [key, setKey] = useState('');
  const { createService } = useGlobalState();

  const onAdd = async () => {
    await createService({ service: 'wordpress', endpoint, key });
    props.onClose();
  }

  return (
    <Dialog {...props}>
      <h5>WordPress Site</h5>
      <DialogContent>
        <FormHelperText style={{ marginBottom: 10 }}>
          Install the free Nekometrics plugin on your site, then copy the endpoint and the key
          it shows you in Meow Apps &rarr; Nekometrics.
        </FormHelperText>
        <TextField autoFocus id="Endpoint" label="Endpoint" type="text" value={endpoint}
          placeholder='https://yourwebsite.com/wp-json/nekometrics/v1'
          onChange={ev => setEndpoint(ev.target.value)} fullWidth />
        <TextField id="Key" label="API Key" type="text" value={key}
          onChange={ev => setKey(ev.target.value)} fullWidth />
      </DialogContent>

      <DialogActions>
        <NekoButton tertiary onClick={() => onAdd()} >Add Service</NekoButton>
      </DialogActions>

    </Dialog>
  );
}

export default WordPressAddDialog;
