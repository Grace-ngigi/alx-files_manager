const express = require('express');

const PORT = process.env.PORT || 5000;
const routes = require('./routes/index');

const app = express();

app.use('/', routes);

app.listen(PORT, () => {
});
