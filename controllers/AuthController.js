const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');
const redis = require('../utils/redis');

const AuthController = {
  connect: async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Creds = auth.split(' ')[1];
    const creds = Buffer.from(base64Creds, 'base64').toString('ascii');
    const [email, password] = creds.split(':');

    const user = await db.findUserByEmail(email);
    if (!user || user.password !== sha1(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const randToken = uuidv4();
    redis.set(`auth_${randToken}`, user.id, 24 * 60 * 60);
    return res.status(200).json({ token: randToken });
  },
  disconnect: async (req, res) => {
    const token = req.headers['X-Token'];
    const userId = await redis.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // delete token from redis
    redis.del(`auth_${token}`);
    return res.status(204).send();
  },
};

module.exports = AuthController;
