const express = require('express');

const PORT = process.env.PORT || 5000;
const routes = require('./routes');

const app = express();
app.use(express.json({ limit: '100mb' }));
app.use(routes);
app.listen(PORT, () => {});
