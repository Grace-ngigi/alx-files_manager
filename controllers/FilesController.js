const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const redis = require('../utils/redis');
const db = require('../utils/db');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const FilesController = {
  postUpload: async (req, res) => {
    const token = req.headers['x-token'];
    const userId = await redis.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }
    const user = db.findUserById(userId);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
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
      userId: user._id,
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
};

module.exports = FilesController;
