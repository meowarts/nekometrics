import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, FormHelperText } from "@material-ui/core";

import useGlobalState from '~/libs/context';
import NekoButton from '~/components/buttons/NekoButton';

function WordPressOrgAddDialog(props) {
  const [author, setAuthor] = useState('');
  const { createService } = useGlobalState();

  const onAdd = async () => {
    await createService({ service: 'wordpressorg', author });
    props.onClose();
  }

  return (
    <Dialog {...props}>
      <h5>WordPress.org</h5>
      <DialogContent>
        <FormHelperText style={{ marginBottom: 10 }}>
          Your WordPress.org username. Every plugin published under it is picked up,
          with its downloads and its active installs. Nothing to install, nothing to
          authorise: these numbers are public.
        </FormHelperText>
        <TextField autoFocus id="Author" label="Username" type="text" value={author}
          placeholder='TigrouMeow'
          onChange={ev => setAuthor(ev.target.value)} fullWidth />
      </DialogContent>

      <DialogActions>
        <NekoButton tertiary onClick={() => onAdd()} >Add Service</NekoButton>
      </DialogActions>
    </Dialog>
  );
}

export default WordPressOrgAddDialog;
