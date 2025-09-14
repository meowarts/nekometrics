const dashId = ':dashId([a-z0-9]{24,24})';

const moduleExports = {
  output: 'standalone', // Required for Docker deployment
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV !== 'development',
    analytics: process.env.NODE_ENV === 'development' ? 'UA-000000-01' : process.env.NEXT_PUBLIC_APP_ANALYTICS
  },
  async rewrites() {
    return [
      {
        source: `/db/${dashId}{/}?`, // => /db/5e6ce5912545d55a316d15b8
        destination: `/dashboard`
      }
    ]
  }
}

module.exports = moduleExports;
