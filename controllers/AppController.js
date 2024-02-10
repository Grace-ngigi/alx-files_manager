const db = require('../utils/db');
const redis = require('../utils/redis');

const AppController = {
  getStatus: async (req, res) => {
    const redisAlive = redis.isAlive();
    const dbAlive = db.isAlive();
    if (redisAlive && dbAlive) {
      res.status(200).json({ redis: true, db: true });
    } else {
      res.status(500).json({ redis: redisAlive, db: dbAlive });
    }
  },
  getStats: async (req, res) => {
    try {
      const users = await db.nbUsers();
      const files = await db.nFiles();
      res.status(200).json({ users, files });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = AppController;
