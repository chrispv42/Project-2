require('dotenv').config();
const express = require('express');
const path = require('path');
const giphyHandler = require('./giphy');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..')));

app.get('/api/giphy', giphyHandler);

app.get('/:page.html', (req, res) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, `${page}.html`));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
