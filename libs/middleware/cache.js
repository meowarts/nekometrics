const NodeCache = require( "node-cache" );

const useCache = async (req) => {
  if (!global.cache) {
    global.cache = new NodeCache();
    console.log('Initialized the cache.');
  }
  req.cache = global.cache;
}

export default useCache;
