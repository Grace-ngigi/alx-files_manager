const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const db = require('../utils/db');
const retrieveUser = require('../utils/retrieveUser');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const FilesController = {
  postUpload: async (req, res) => {
    const user = retrieveUser(req);
    if (user === null) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const {
      name, type, parentId, isPublic, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing or invalid type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }
    if (parentId) {
      const parentFile = await db.findFileById(parentId);
      //   console.log(parentFile);
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    const file = {
      userId: user.id,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    };

    if (type !== 'folder') {
      const filename = uuidv4();
      if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH, { recursive: true });
      }

      const filePath = path.join(FOLDER_PATH, filename);
      const filedata = Buffer.from(data, 'base64');
      try {
        fs.writeFileSync(filePath, filedata);
      } catch (error) {
        console.error('Error writing file:', error);
      }

      file.localPath = filePath;
    }
    const newFile = await db.createFile(file);
    return res.status(201).json(newFile);
  },
  getShow: async (req, res) => {
    const user = retrieveUser(req);
    if (user === null) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const file = await db.findFileByIdAndUserId(id, user.id);
    // console.log(file)
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(file);
  },
  getIndex: async (req, res) => {
    const user = retrieveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { parentId = '0', page = '0' } = req.query;
    const limit = 20;
    const skip = parseInt(page) * limit;
    // const fileReq = { parentId, limit, skip };
    const files = await db.findFiles({ parentId, limit, skip });
    return res.status(200).json(files);
  },
};

module.exports = FilesController;