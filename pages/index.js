import withAuth from '~/libs/withAuth';
import Layout from '~/components/Layout';

import Title from '../components/elements/Title';
import InTheKnow from '../components/elements/InTheKnow';
import AvailableWidgets from '../components/elements/AvailableWidgets';
import WhyNeko from '../components/elements/WhyNeko';
import NekoStory from '../components/elements/NekoStory';
import Dashboard from '../components/elements/Dashboard';
import Pricing from '../components/elements/Pricing';
import Footer from '../components/Footer';

const Index = () =>
    <Layout usePaper={true}>
        <Title/>
        <InTheKnow/>
        <WhyNeko/>
        <AvailableWidgets/>
        <NekoStory/>
        <Dashboard/>
        <Pricing/>
        <Footer/>
    </Layout>

export default withAuth(Index);