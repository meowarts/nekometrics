import { makeStyles } from '@material-ui/core/styles';

import Layout from '~/components/Layout';
import Contact from '~/components/elements/Contact';
import Footer from '~/components/Footer';
import withAuth from '~/libs/withAuth';

const FAQ = () => {
	const css = useStyles();

	const FAQItem = ({ question, answer }) =>
		<div className={css.faqItem}>
			<h4 className={css.question}>{question}</h4>
			<p className={css.answer}>{answer}</p>
		</div>


	return (
    <>
			<Layout usePaper={true}>
				<h1 className={css.pageTitle}><span className={css.gradient}>FAQ</span></h1>
				<div className={css.faqWrapper}>
					<FAQItem
						question="I can't see some of my Facebook pages, but not all of them."
						answer={<span>If not all your Facebook pages are being displayed, you need to make sure they have been all authorized to be seen by Nekometrics. Have a look here: <a target='_blank' rel="noreferrer" href='https://www.facebook.com/settings?tab=business_tools'>Business Integrations</a>. Click on View and edit next to Nekometrics, and select the pages you would like to see. Then, the service on Nekometrics will need to be refreshed.</span>}
					/>
					<FAQItem
						question="My instagram profile is not listed. My Facebook account is properly linked and I can see my Facebook pages as well."
						answer={<span>For your Instagram profile to show up, you need to switch it to a Business Account (it’s free, no worries), and make sure it is linked to one of your Facebook pages (or create a Facebook page or it). Facebook has a tutorial about this <a href='https://www.facebook.com/business/help/502981923235522' target='_href' rel="noreferrer">here</a>.</span>}
					/>
				</div>
				
				<Contact message="Didn’t find an answer to your question?" />
				<Footer/>
			</Layout>
		</>
    );
}

const useStyles = makeStyles(theme => ({
	pageTitle: {
		textAlign: 'center',
		margin: '60px 0'
	},
	gradient: theme.gradient,
	faqWrapper: {
		marginBottom: '80px'
	},
	faqItem: {
		margin: '40px 130px'
	},
	question: {
		margin: 0,
		fontSize: theme.fonts.SIZE[18],
		lineHeight: '22px',
		fontFamily: theme.fonts.FAMILY.NOVA_FLAT
	},
	answer: {
		margin: '20px 0 0 0',
		fontSize: theme.fonts.SIZE[15],
		"& a": {
			textDecoration: 'underline'
		}
	}
}));

export default withAuth(FAQ);