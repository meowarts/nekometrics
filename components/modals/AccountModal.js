import { useEffect, useMemo, useState } from 'react';
import { TextField, Paper, Button, Dialog, DialogContent } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

import DayJS from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

import SoftBusyOverlay from '~/components/SoftBusyOverlay';
import useGlobalState from '~/libs/context';
import { updateAccount, modifyPwd } from '~/libs/requests';
import NekoButton from '~/components/buttons/NekoButton';

DayJS.extend(LocalizedFormat)

const AccountModal = (props) => {
  const css = useStyles();
  const { user, setUser, modals, toggleModal } = useGlobalState(); 
  const [ lastName, setLastName ] =  useState('');
  const [ firstName, setFirstName ] =  useState('');
  const [ newPassword, setNewPassword ] =  useState('');
  const [ newPasswordCheck, setNewPasswordCheck ] =  useState('');
  const [ busyAccount, setBusyAccount ] = useState(false);

  const isModified = user && (lastName !== user.lastName || firstName !== user.firstName);

  useEffect(() => {
    setLastName(user && user.lastName ? user.lastName : '');
    setFirstName(user && user.firstName ? user.firstName : '');
  }, [user]);

  const onModifyPwd = async () => {
    setBusyAccount(true);
    let res = await modifyPwd(newPassword);
    setBusyAccount(false);
    if (res.success) {
      alert('The password has been updated.');
      setNewPassword('');
      setNewPasswordCheck('');
      return;
    }
    alert(res.message);
	};

  const onSaveChanges = async () => {
    setBusyAccount(true);
    let res = await updateAccount({ ...user, lastName, firstName });
    if (res.success) {
      setUser(res.user, res);
    }
    if (!res.success) {
      alert('Error');
    }
    setBusyAccount(false);
  }

  const jsxAccountStatus = useMemo(() => {
    if (!user) {
      return null;
    }
    let expireOn = DayJS(user.expireOn).format('LL');
    if (user.isActive) {
      if (user.accountType === 'trial') {
        return <>Your free <u>trial</u> account will be active until <b>{expireOn}</b>.</>;
      }
      else if (user.accountType === 'admin') {
        return <>Your account is free forever... because you are the boss! 😊</>;
      }
      else if (user.accountType === 'customer') {
        return <>Your account will be active until <b>{expireOn}</b>.</>;
      }
      else if (user.accountType === 'friend') {
        return <>Your account is free forever, because you are my friend! 💖 </>;
      }
    }
    else {
      return `Your account has expired on ${expireOn}.`;
    }
  }, [user]);

  return (
    <Dialog open={modals.account} onClose={() => toggleModal('account')} className={css.dialog} {...props} >
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}}
        onClick={() => toggleModal('account')}/>
      <h5>ACCOUNT SETTINGS</h5>
      <DialogContent>
        <h3 className={css.subheader} style={{margin: '10px 0' }}>Status</h3>
        <p style={{margin: '0 0 30px'}}>{jsxAccountStatus}</p>

        <h3 className={css.subheader}>Personal Information</h3>
        <SoftBusyOverlay busy={busyAccount} style={{margin: '0 0 30px'}}>
            <Paper style={{background: 'none'}}>
            <p style={{ margin: '0px 0px 20px' }}>
                We are trying to ask you the least minimum personal information as we can. Please at least provide your first and last name for accounting purposes and in case of issue with your account.
            </p>
            <div style={{ display: 'flex' }}>
                <TextField className={css.textfield} id="email" label="Email" value={user ? user.email : ''} disabled={true} />
                <TextField className={css.textfield} id="firstName" label="First Name" value={firstName} autoComplete='given-name'
                onChange={ev => setFirstName(ev.target.value)} />
                <TextField className={css.textfield} id="lastName" label="Last Name" value={lastName} autoComplete='family-name'
                onChange={ev => setLastName(ev.target.value)} />
            </div>
            {isModified && <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <NekoButton tertiary disabled={busyAccount} onClick={onSaveChanges}>
                  Save Changes</NekoButton>
            </div>}
            </Paper>
            
        </SoftBusyOverlay>

        <h3 className={css.subheader}>Password</h3>
        <SoftBusyOverlay busy={busyAccount} style={{margin: '0px 0px 30px'}}>
            <Paper>
            <p style={{ margin: '0px 0px 10px' }}>
                Type your new password twice in order to change it.
            </p>
            <form style={{ display: 'flex' }}>
                <TextField className={css.textfield} type='password' autoComplete='new-password' id="new-password" 
                label="New Password" value={newPassword} 
                onChange={ev => setNewPassword(ev.target.value)} />
                <TextField className={css.textfield} type='password' autoComplete='new-password' id="new-password-again" 
                label="New Password (Again)" value={newPasswordCheck}
                onChange={ev => setNewPasswordCheck(ev.target.value)} />
            </form>
            {(newPassword || newPasswordCheck) && <div style={{marginTop: 20, display: 'flex', justifyContent: 'flex-end'}}>
                <NekoButton quarternary style={{ marginRight: 10 }} onClick={() => { setNewPassword(''); setNewPasswordCheck(''); }}
                >Cancel</NekoButton>
                <NekoButton tertiary disabled={busyAccount || newPassword !== newPasswordCheck} onClick={onModifyPwd}
                >Set Password</NekoButton>
            </div>}
            </Paper>
        </SoftBusyOverlay>
      </DialogContent>    
    </Dialog>
  );
}

const useStyles = makeStyles(theme => ({
  subheader: {
    margin: '10px 0',
    color: theme.common.COLOR_SECONDARY_NEKO
  },
  textfield: {
    flex: 1,
    '& .MuiInputBase-input, & .Mui-disabled':{ opacity: 0.8 }
  },
  dialog: {
    '& .MuiPaper-elevation1': {
        boxShadow: 'none'
    },
  },
}));

export default AccountModal;