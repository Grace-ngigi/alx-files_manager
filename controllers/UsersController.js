const sha1 = require('sha1');
const db = require('../utils/db');

const UsersController = {
  postNew: async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const existinUser = await db.findUserByEmail(email);
    if (existinUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashedPasswd = sha1(password);

    try {
      const newUser = await db.createUser(email, hashedPasswd);
      return res.status(201).json({ id: newUser.id, email: newUser.email });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = UsersController;
