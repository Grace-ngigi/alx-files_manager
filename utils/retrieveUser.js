const redis = require('./redis');
const db = require('./db');

export async function retrieveUser(req) {
  const token = req.headers['x-token'];
  if (!token) return null;
  const userId = await redis.get(`auth_${token}`);
  if (!userId) return null;
  const user = db.findUserById(userId);
  if (!user) return null;
  return { email: user.email, id: user._id };
}
