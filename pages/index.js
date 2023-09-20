import withAuth from '~/libs/withAuth';
import Layout from '~/components/Layout';

import Title from '../components/elements/Title';
import InTheKnow from '../components/elements/InTheKnow';
import AvailableWidgets from '../components/elements/AvailableWidgets';
import NekoStory from '../components/elements/NekoStory';
import Dashboard from '../components/elements/Dashboard';
import Footer from '../components/Footer';

const Index = () =>
    <Layout usePaper={true}>
        <Title/>
        <InTheKnow/>
        <AvailableWidgets/>
        <NekoStory/>
        <Dashboard/>
        <Footer/>
    </Layout>

export default withAuth(Index);