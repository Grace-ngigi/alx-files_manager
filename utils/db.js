const { MongoClient, ObjectId } = require('mongodb');

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

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  findUserByEmail(email) {
    return this.db.collection('users').findOne({ email });
  }

  findUserById(id) {
    return this.db.collection('users').findOne({ _id: ObjectId(id) });
  }

  async createUser(email, password) {
    const res = await this.db.collection('users').insertOne(
      {
        email,
        password,
      },
    );
    return {
      email: res.ops[0].email,
      id: res.ops[0]._id,
    };
  }
}
const dbClient = new DBClient();
module.exports = dbClient;
