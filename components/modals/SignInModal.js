import { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import { FormControl, TextField, Divider } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Dialog } from "@material-ui/core";

import useGlobalState from '~/libs/context';
import { signUp, signIn, getAccount, resetPwd } from '~/libs/requests';
import { NekoDialogContentWrapper } from '~/components/elements/NekoElements';
import NekoButton from '~/components/buttons/NekoButton';

const SignInModal = () => {
  const { user, setUser, toggleModal, modals } = useGlobalState();
  const [email, setEmail] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState('');

  const css = useStyles();

  const onSignUp = async () => {
    setBusy(true);
    let res = await signUp(email, invitationCode);
    setBusy(false);
    if (res.success) {
      alert('Check your emails, your account has been created.');
      setMode('login');
      setEmail('');
      setPassword('');
      return;
    }
    alert(res.message);
  };

  const onResetPassword = async () => {
    setBusy(true);
    const res = await resetPwd(email);
    setBusy(false);
    if (res.success) {
      alert('Check your emails, a new password has been generated.');
      setPassword('');
      setMode('login');
      return;
    }
    alert(res.message);
  };

  const onLogin = async () => {
    setBusy(true);
    let res = await signIn(email, password);
    if (res.success) {
      const user = res.user;
      const account = await getAccount();
      if (account.success) {
        toggleModal('login', false);
        setEmail('');
        setPassword('');
        setUser(user, account);
        setBusy(false);
        if (window.location.hostname === 'localhost') {
          alert('Please do not use localhost; Nekometrics needs to be on 127.0.0.1 (because Mailchimp requires it).');
        }
        return;
      }
    }
    setBusy(false);
    alert(res.message);
  };

  return (
    <Dialog open={modals.login} onAccountClose={() => toggleModal('login')}
      onClose={() => toggleModal('login')} className={css.dialog}>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer' }} 
        onClick={() => toggleModal('login')} />
      <h5>{mode === 'login' ? 'LOGIN' : mode === 'reset' ? 'RESET PASSWORD' : 'CREATE ACCOUNT'} </h5>
      <NekoDialogContentWrapper>

        <FormControl style={{ display: 'flex' }}>

          {user && mode === 'login' &&
            <p>You are connected! In fact, this is not really supposed to show up :)</p>
          }

          {!user &&
            <>

              <TextField disabled={busy} type="text" label="Email" value={email}
                style={{ marginBottom: 10 }} onChange={(ev) => setEmail(ev.target.value)} />

              {mode === 'register' && <>
                <TextField disabled={busy} type="text" label="Invitation Code" value={invitationCode}
                  style={{ marginBottom: 10 }} onChange={(ev) => setInvitationCode(ev.target.value)} />
                <p>You need a invitation code in order to create a Nekometrics account. If you do not know about this, please have a look at the bottom of the homepage.</p>
              </>}

              {mode === 'login' &&
                <>
                  <TextField disabled={busy} type="password" label="Password" value={password}
                    style={{ marginBottom: 10 }} onChange={(ev) => setPassword(ev.target.value)} />
                  <NekoButton disabled={busy} tertiary style={{ marginTop: 10, marginBottom: 10, width: '100%' }} onClick={onLogin}>
                      Sign In
                  </NekoButton>                    
                  <Divider style={{ margin: '10px 0' }} />
                  <NekoButton quarternary onClick={() => setMode('register')}> Create a free account </NekoButton>   
                  <NekoButton quarternary onClick={() => setMode('reset')}> I forgot my password </NekoButton>                   
                </>
              }

              {mode === 'register' && 
              <NekoButton disabled={busy} tertiary style={{ marginTop: 10, marginBottom: 10, width: '100%' }} onClick={onSignUp}>
                  Create An Account
              </NekoButton>}
              {mode === 'reset' && 
              <NekoButton disabled={busy} tertiary style={{ marginTop: 10, marginBottom: 10, width: '100%' }} onClick={onResetPassword}>
                  Reset Password
              </NekoButton>}
              {(mode === 'register' || mode === 'reset') &&
                <>
                  <Divider style={{ margin: '10px 0' }} />
                  <NekoButton quarternary onClick={() => setMode('login')}>Go Back</NekoButton>   
                </>
              }

            </>
          }
        </FormControl>
      </NekoDialogContentWrapper>
    </Dialog>
  );
};

const useStyles = makeStyles(() => ({
  dialog: {
    '& .MuiFormControl-root': {
        minWidth: '350px'
    }
  }
}));

SignInModal.propTypes = {
  onClose: PropTypes.func,
};

export default SignInModal;