const redis = require('redis');

class RedisClient {
  constructor() {
    // constructor tat creates a client to Redis
    this.client = redis.createClient();
    // display errors in console
    this.isConnected = false;

    this.client.on('error', (err) => {
      console.error('Redis Error', err);
    });
    this.client.on('connect', () => {
      this.isConnected = true;
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(value);
      });
    });
  }

  async set(key, value, duration) {
    const res = await new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
    return res;
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  }
}
const redisClient = new RedisClient();
module.exports = redisClient;
