import App from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'react-grid-layout/css/styles.css';

import { NekoTheme } from '~/theme';
import { GlobalStateProvider } from '~/libs/context';

class Nekometrics extends App {

  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <title>Nekometrics - The Metrics Dashboard for Sites & SNS</title>
          <meta name="description" content="Analytics for your websites and social networks accounts made easier." />
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
          <link rel="shortcut icon" href="/favicon.png" />
        </Head>
        <ThemeProvider theme={NekoTheme}>
          {/* This is basically like normalize.css.  */}
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </>
    );
  }
}

const NekometricsWithState = (props) => {
  return (
    <GlobalStateProvider>
      <Nekometrics {...props} />
    </GlobalStateProvider>
  );
};

export default NekometricsWithState;