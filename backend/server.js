const fs = require('fs');
const path = require('path');
const standaloneDir = path.join(__dirname, 'dist', 'standalone');
const standaloneServerPath = path.join(standaloneDir, 'server.js');

if (!fs.existsSync(standaloneServerPath)) {
  throw new Error(
    `Missing frontend standalone build at ${standaloneServerPath}. Run the frontend build and publish step before starting the backend.`
  );
}

process.chdir(standaloneDir);
require(standaloneServerPath);
