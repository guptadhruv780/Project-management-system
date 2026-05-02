const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Try to find the build directory
const buildPath = path.join(__dirname, 'build');
const distPath = path.join(__dirname, 'dist');
let finalPath = '';

if (fs.existsSync(buildPath)) {
  finalPath = buildPath;
  console.log('Using /build directory');
} else if (fs.existsSync(distPath)) {
  finalPath = distPath;
  console.log('Using /dist directory');
} else {
  console.error('CRITICAL: No build or dist directory found!');
  console.log('Current directory contents:', fs.readdirSync(__dirname));
}

if (finalPath) {
  app.use(express.static(finalPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(finalPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server is running on port ${PORT}`);
});
