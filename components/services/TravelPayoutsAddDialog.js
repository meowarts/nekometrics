import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, FormHelperText } from "@material-ui/core";

import useGlobalState from '~/libs/context';
import NekoButton from '~/components/buttons/NekoButton';

function TravelPayoutsAddDialog(props) {
  const [token, setToken] = useState('');
  const { createService } = useGlobalState();

  const onAdd = async () => {
    await createService({ service: 'travelpayouts', token });
    props.onClose();
  }

  return (
    <Dialog {...props}>
      <h5>Travelpayouts</h5>
      <DialogContent>
        <FormHelperText style={{ marginBottom: 10 }}>
          Your token is in your Travelpayouts account, under Profile &rarr; API token.
          Clicks, bookings and earnings across every program you are in.
        </FormHelperText>
        <TextField autoFocus id="Token" label="API Token" type="text" value={token}
          onChange={ev => setToken(ev.target.value)} fullWidth />
      </DialogContent>

      <DialogActions>
        <NekoButton tertiary onClick={() => onAdd()} >Add Service</NekoButton>
      </DialogActions>
    </Dialog>
  );
}

export default TravelPayoutsAddDialog;
