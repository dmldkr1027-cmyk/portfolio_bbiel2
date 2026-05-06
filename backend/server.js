const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const distServerPath = path.join(__dirname, 'dist', 'standalone', 'server.js');

if (fs.existsSync(distServerPath)) {
  require(distServerPath);
} else {
  app.use(cors());
  app.use(express.json());

  app.get('/api', (req, res) => {
    res.json({ message: 'Backend is running!' });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
