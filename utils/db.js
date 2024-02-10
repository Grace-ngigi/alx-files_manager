const { MongoClient } = require('mongodb');

const { env } = process;

const host = env.DB_HOST || 'localhost';
const port = env.DB_PORT || 27017;
const database = env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    const url = `mongodb://${host}:${port}/${database}`;
    this.client = new MongoClient(url);
    this.isConnected = false;
    this.db = null;
    this.client.connect((error) => {
      if (!error) {
        this.isConnected = true;
        this.db = this.client.db(database);
      }
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nFiles() {
    return this.db.collection('files').countDocuments();
  }
}
const dbClient = new DBClient();
module.exports = dbClient;
