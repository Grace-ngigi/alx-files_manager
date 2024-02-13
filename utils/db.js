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

  findFileById(id) {
    return this.db.collection('files').findOne({ _id: ObjectId(id) });
  }

  findFileByIdAndUserId(id, userId) {
    return this.db.collection('files').find({ _id: ObjectId(id), userId });
  }

  findFiles(fileReq) {
    const {
      parentId, userId, limit, skip,
    } = fileReq;
    const files = this.db.collection('files').find({ parentId, userId }).skip(skip).limit(limit)
      .toArray();
    return files;
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

  async createFile(file) {
    const res = await this.db.collection('files').insertOne(file);
    return res.ops[0];
  }

  async updateFile(id, ispublic) {
    return this.db.collection('files').updateOne({ _id: ObjectId(id) }, { $set: { isPublic: ispublic } });
  }
}
const dbClient = new DBClient();
module.exports = dbClient;
