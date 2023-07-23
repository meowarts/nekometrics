//import { Typography } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';

import withAuth from '~/libs/withAuth';
import Layout from '~/components/Layout';

const About = () => {
  //const styles = useStyles();

  return (
    <Layout>
      <p variant="h2">Metrics for Websites and Social Networks</p>
      <p>If you are looking for a <b>good-looking</b> yet <b>unexpensive</b> and <b>optimized</b> system to look at the metrics of your websites and/or your social networks, don't look any further. You are at the right place! With Nekometrics, you will be able to organize your different metrics on nice dashboards through dynamic widgets.</p>
    </Layout>
  );
}

// const useStyles = makeStyles(() => ({
// }));

export default withAuth(About);