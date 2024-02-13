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
    const skip = parseInt(page, 10) * limit;
    // const fileReq = { parentId, limit, skip };
    const files = await db.findFiles({ parentId, limit, skip });
    console.log(`te so called files: ${files}`);
    return res.status(200).json(files);
  },
  putPublish: async(req, res) => {
    const user = retrieveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const {id} = req.params;
        const file = await db.findFileByIdAndUserId(id, user.id);
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    const publish = await db.updateFile(id, true);
    console.log(publish);
    return res.status(200).json(publish);

  },
  putUnpublish: async(req, res) => {
    const user = retrieveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const {id} = req.params;
    const file = await db.findFileByIdAndUserId(id, user.id);
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    const publish = await db.updateFile(id, false);
    console.log(publish);
    return res.status(200).json(publish);
  },
  getFile: async(req, res) => {
    try {
      const fileId = req.params.id;
      const file = await db.findFileById(fileId);
      const user = retrieveUser(req);
      // If no file document is linked to the ID passed as parameter, return 404
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }
      if (!file.isPublic && (user.id !== file.userId)) {
        return res.status(404).json({ error: 'Not found' });
      }

      // If the type of the file document is a folder, return 400
      if (file.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      // If the file is not locally present, return 404
      if (!fs.existsSync(file.localPath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Get MIME-type based on the name of the file
      const mimeType = mime.lookup(file.name);

      // Return the content of the file with the correct MIME-type
      res.setHeader('Content-Type', mimeType);
      fs.createReadStream(file.localPath).pipe(res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

module.exports = FilesController;
