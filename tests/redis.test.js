const chai = require('chai');

const { expect, before } = chai;
const RedisClient = require('../utils/redis');

describe('redisClient', () => {
  let client;

  before(() => {
    client = new RedisClient();
  });

  after(() => {
    // Close the Redis connection after all tests are done
    client.client.quit();
  });

  describe('isAlive', () => {
    it('should return true if connected to Redis', () => {
      expect(client.isAlive()).to.be.true;
    });
  });

  describe('set and get', () => {
    it('should set and get a key-value pair', async () => {
      await client.set('testKey', 'testValue', 10);
      const value = await client.get('testKey');
      expect(value).to.equal('testValue');
    });

    it('should return null if key does not exist', async () => {
      const value = await client.get('nonExistentKey');
      expect(value).to.be.null;
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      await client.set('keyToDelete', 'value', 10);
      await client.del('keyToDelete');
      const value = await client.get('keyToDelete');
      expect(value).to.be.null;
    });

    it('should do nothing if key does not exist', async () => {
      // Deleting a non-existent key should not throw an error
      await expect(client.del('nonExistentKey')).to.not.throw;
    });
  });
});
