import { useState } from 'react';
import styled from 'styled-components';
import { NekoGradientText, NekoFonts, NekoColors } from '~/theme';

import Layout from '~/components/Layout';
import NekoButton from '~/components/buttons/NekoButton';
import Footer from '~/components/Footer';
import { contactSupport } from '~/libs/requests';
import withAuth from '~/libs/withAuth';

const StyledWrapper = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 70px;

  @media (max-width: 900px) {

  }

  & h1 {
	text-align: center;
	margin: 60px 0;
  }
  & .gradient {
    gradient: ${NekoGradientText}
  }
`

const StyledForm = styled.div`
	display: flex;
	flex-direction: column;
	padding: 10px 200px 0px;
`

const StyledInput = styled.textarea`
	border-color: rgb(255 255 255 / 15%);
    background: rgb(255 255 255 / 5%);
	outline: none;
    padding: 10px;
	caret-color: #FCFCFC;
	color: #FCFCFC;
	font-size: 16px;
	margin-bottom: 15px;
	width: 650px;
	border-radius: 2px;
	font-family: ${NekoFonts.FAMILY.CODA};
	resize: none;

	&::-webkit-input-placeholder {
		color: ${NekoColors.WHITE} !important;
		font-family: ${NekoFonts.FAMILY.CODA}
	}

	&&::placeholder {
		color: ${NekoColors.LIGHT_GREY};
		font-size: ${NekoFonts.SIZE[14]};
		font-family: ${NekoFonts.FAMILY.CODA}
	}
`

const ContactForm = () => {
	const [emailError, setEmailError] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const [busy, setBusy] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");

	const isOkay = name.length && email.length && subject.length && message.length;

	const sendEmail = async () => {
		if (!busy && isOkay) {
			setBusy(true);
			const res = await contactSupport(email, name, subject, message);
			if (res.success) {
				setEmailSent(true);
			}
			else {
				setEmailError(true);
			}
			setBusy(false);
		}
	}

	return (
        <>
			<Layout usePaper={true}>
				<StyledWrapper>
					<h1><span className="gradient">Contact</span></h1>

					{!emailSent && <>
						<p style={{ textAlign: 'center', fontSize: '16px', marginTop: 35 }}>Any questions or concerns? Send us a message and we will get back to you within 24 hours.</p>
						<StyledForm>
							<StyledInput disabled={busy} type="text" rows="1" id="" placeholder="YOUR NAME" value={name} 
								onChange={ev => setName(ev.target.value)} />
							<StyledInput disabled={busy} type="email" rows="1" id="" placeholder="YOUR EMAIL" value={email}
								onChange={ev => setEmail(ev.target.value)} />
							<StyledInput disabled={busy} type="text" rows="1" id="" placeholder="SUBJECT" value={subject}
								onChange={ev => setSubject(ev.target.value)} />
							<StyledInput disabled={busy} type="text" rows="5" id="" placeholder="MESSAGE" value={message} style={{height: '200px'}} 
								onChange={ev => setMessage(ev.target.value)} />
						</StyledForm>
						<button primary disabled={busy || !isOkay} text="SEND THIS MESSAGE" style={{ width: '650px' }} 
							onClick={() => sendEmail()} />
					</>}

					{emailSent && <>
						<p style={{ textAlign: 'center', fontSize: '16px', marginTop: 35 }}>
							Your message has been sent successfully.<br />Talk to you soon! ♥️
						</p>
					</>}


				</StyledWrapper>
				<Footer/>
			</Layout>
		</>
    );
}

export default withAuth(ContactForm);