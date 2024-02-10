const { MongoClient } = require('mongodb');

const { env } = process;

class DBClient {
  constructor() {
    const host = env.DB_HOST || 'localhost';
    const port = env.DB_PORT || 27017;
    const database = env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopoloy: true,
    });
    this.db = null;
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db();
    } catch (error) {
      console.log(error);
    }
  }

  isAlive() {
    return !!this.client;
  }

  async nbUsers() {
	  try {
	  if (!this.alive()) {
		  await this.connect();
		   }
      const count = await this.db.collection('users').countDocuments();
      return count;
	   } catch (err) {
		   throw err;
		    }
	  }

  async nFiles() {
    const count = await this.db.collection('files').countDocuments();
    return count;
  }
}
const dbClient = new DBClient();
module.exports = dbClient;
