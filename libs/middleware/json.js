const useJson = async (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    req.json = req.body ? JSON.parse(req.body) : {};
  }
}

export default useJson;
