const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Railway usually provides the PORT env var. 
// If it's missing, we default to 3000 but Railway's Networking tab MUST match this.
const PORT = process.env.PORT || 3000;

const buildPath = path.join(__dirname, 'build');
const distPath = path.join(__dirname, 'dist');
let finalPath = '';

if (fs.existsSync(buildPath)) {
  finalPath = buildPath;
  console.log('Serving from /build directory');
} else if (fs.existsSync(distPath)) {
  finalPath = distPath;
  console.log('Serving from /dist directory');
} else {
  console.error('CRITICAL: No build or dist directory found!');
  console.log('Contents of ' + __dirname + ':', fs.readdirSync(__dirname));
}

if (finalPath) {
  app.use(express.static(finalPath));
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(finalPath, 'index.html'));
  });
}

// IMPORTANT: Must listen on 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server successfully started on 0.0.0.0:${PORT}`);
});
