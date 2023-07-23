import { useEffect } from 'react';
import { Typography } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import Router from 'next/router';
import Link from 'next/link';

import Layout from '~/components/Layout';
import useGlobalState from '~/libs/context';
import { handleOauth } from '~/libs/requests';
import withAuth from '~/libs/withAuth';
import NekoButton from '~/components/buttons/NekoButton';

const OauthResult = (props) => {
  const { message, service } = props;
  const { refreshServices } = useGlobalState(); 

  useEffect(() => {
    if (service) {
      refreshServices();
      Router.push('/dashboard?modal=datasources');
    }
  });

  return (
    <Layout usePaper={true}>
      <Typography variant="h2">Services</Typography>
      {service && <p>Success! Refreshing...</p>}
      {message && 
        <>
          <p>{message}</p>
          <Link href="/dashboard?modal=datasources" passHref>
            <NekoButton tertiary><ArrowBack /> Data Sources</NekoButton>
          </Link>
        </>
      }
    </Layout>
  );
}

OauthResult.getInitialProps = async ({ query, res, req }) => {
  const result = await handleOauth(query, req?.headers?.cookie);
  if (!result.success) {
    return { service: null, message: result.message };
  }
  return { service: result.service };
}

export default withAuth(OauthResult);
