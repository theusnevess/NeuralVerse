const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname);
const PORT = Number(process.env.PORT) || 8080;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown',
};

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';

  const filePath = path.join(ROOT, url);
  const ext = path.extname(filePath);
  
  fs.readFile(filePath, (err, data) => {
    if (res.destroyed) return;
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// Browser route changes can close a response while an asynchronous file read is
// still pending. Treat that as a completed request rather than terminating the
// development server used by long Playwright matrices.
server.on('clientError', (_err, socket) => socket.destroy());

server.listen(PORT, '0.0.0.0', () => {
  console.log(`NeuralVerse server running on http://localhost:${PORT}`);
});
