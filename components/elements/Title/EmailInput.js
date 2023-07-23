import { useState } from 'react';
import styled from 'styled-components';
import { contactSupport } from '~/libs/requests';
import { NekoFonts, NekoColors } from '~/theme';
import NekoButton from '../../buttons/NekoButton';

const StyledEmailInput = styled.input`
	border: none;
	background: transparent;
	border-bottom-style: solid;
	border-bottom-color: ${NekoColors.WHITE};
	border-bottom-width: thin;       
	outline: none;
	padding-bottom: 5px;
	caret-color: ${NekoColors.WHITE};
	color: ${NekoColors.WHITE};
	font-size: ${NekoFonts.SIZE[16]};
	font-family: ${NekoFonts.FAMILY.CODA};
	margin-right: 10px;

	&::-webkit-input-placeholder {
		color: ${NekoColors.WHITE} !important;
		font-family: ${NekoFonts.FAMILY.ROBOTO}
  }

	&&::placeholder {
		color: ${NekoColors.LIGHT_GREY};
    	font-size: ${NekoFonts.SIZE[12]};
		font-family: ${NekoFonts.FAMILY.ROBOTO}
  }
`

const EmailInput = () => {
	const [busy, setBusy] = useState(false);
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const sendEmail = async () => {
		if (!busy && email.length) {
			setBusy(true);
			const res = await contactSupport(email, 'Unknown', "[Early Access] Nekometrics", 'This is a request to access Nekometrics.');
			if (res.success) {
				setEmailSent(true);
			}
			else {
				setEmailError(true);
			}
			setBusy(false);
		}
	}

	return (<>
		{!emailSent && <div style={{ display: 'flex' }}>
			<StyledEmailInput type="email" placeholder="YOUR EMAIL" value={email}
				onChange={ev => setEmail(ev.target.value)} />
			<NekoButton small secondary text="Submit" style={{ alignSelf: 'flex-end' }} disabled={busy || !email.length}
				onClick={sendEmail}/>
		</div>}
		{emailSent && <>
			<span>Thank you! ☘️</span>
		</>}
	</>)
}

export default EmailInput