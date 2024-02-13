const { expect } = require('chai');
const sinon = require('sinon');
const DBClient = require('./DBClient');

describe('dBClient', () => {
  let dbClient;

  before(() => {
    dbClient = new DBClient();
  });

  describe('isAlive', () => {
    it('should return true if connected to MongoDB', () => {
      expect(dbClient.isAlive()).to.be.true;
    });
  });

  describe('nbUsers', () => {
    it('should return the number of users in the database', async () => {
      const count = await dbClient.nbUsers();
      expect(count).to.be.a('number');
    });
  });

  describe('nbFiles', () => {
    it('should return the number of files in the database', async () => {
      const count = await dbClient.nbFiles();
      expect(count).to.be.a('number');
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      const user = await dbClient.findUserByEmail('test@example.com');
      expect(user).to.exist;
      expect(user.email).to.equal('test@example.com');
    });

    it('should return null if user does not exist', async () => {
      const user = await dbClient.findUserByEmail('nonexistent@example.com');
      expect(user).to.be.null;
    });
  });

  describe('findUserById', () => {
    it('should find a user by id', async () => {
      // Mock an ObjectId for testing
      const fakeObjectId = '507f191e810c19729de860ea';
      const user = await dbClient.findUserById(fakeObjectId);
      expect(user).to.exist;
      expect(user._id).to.equal(fakeObjectId);
    });

    it('should return null if user does not exist', async () => {
      const user = await dbClient.findUserById('invalidObjectId');
      expect(user).to.be.null;
    });
  });

  // Similar tests can be written for other methods like findFileById, findFileByIdAndUserId, findFiles, createUser, createFile, updateFile, etc.
});
