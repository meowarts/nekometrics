import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, Typography } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

import useGlobalState from '~/libs/context';
import NekoButton from '~/components/buttons/NekoButton';

function WooCommerceAddDialog(props) {
  const [endpoint, setEndpoint] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const { createService } = useGlobalState();
  const css = useStyles();

  // const onTest = () => {
  // }

  const onAdd = async () => {
    await createService({ service: 'woocommerce', endpoint, key: consumerKey, secret: consumerSecret });
    props.onClose();
  }

  return (
    <Dialog {...props}>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => props.onClose()}/>
      <h5>WooCommerce Service</h5>
      <DialogContent>
        <TextField autoFocus id="API URL" label="API URL" type="text" value={endpoint} 
          placeholder='https://yourwebsite.com/wp-json'
          onChange={ev => setEndpoint(ev.target.value)} fullWidth />
        <TextField id="key" label="Consumer Key" type="text" value={consumerKey} 
          onChange={ev => setConsumerKey(ev.target.value)} fullWidth />
        <TextField id="secret" label="Consumer Secret" type="text" value={consumerSecret} 
          onChange={ev => setConsumerSecret(ev.target.value)} fullWidth />
        <Typography className={css.message}>
          Usually, the API URL is your website domain followed by <i>/wp-json</i>.
        </Typography>
      </DialogContent>

      <DialogActions>
        <NekoButton tertiary onClick={() => onAdd()} >Add Service</NekoButton>
      </DialogActions>

    </Dialog>
  );
}

const useStyles = makeStyles(theme => ({
  message: {
    marginTop: 20,
    fontSize: theme.fonts.SIZE[14]
  }
}));

export default WooCommerceAddDialog;
