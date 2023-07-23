const useAuth = async (req) => {
  req.isAuth = false;
  const token = req.cookies?.['nekometrics_token'];
  if (!token)
    return;

  // Retrieve the user from cache, if not, from DB
  let user = await req.cache.get(token);
  if (!user) {
    let data = await req.db.collection('Token').findOne({ token: token });
    if (data) {
      let expireOn = new Date();
      expireOn.setDate(expireOn.getDate() + 90);
      if (data.expireOn < new Date()) {
        await req.db.collection('Token').deleteOne({ token: token });
        return;
      }
      user = data.user;
      await req.cache.set(token, user);
    }
  }
  req.user = user;
  req.isAuth = !!req.user;
}

export default useAuth;
