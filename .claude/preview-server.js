// Minimal static file server for the ATB prototype previews.
// Never calls process.cwd(), because the preview sandbox can start this
// process in a directory it won't let us stat -- that is what made
// `python3 -m http.server` die on os.getcwd() during startup.

const http = require('http');
const fs = require('fs');
const path = require('path');

// Resolved from this file's own location (<repo>/.claude/preview-server.js)
// rather than process.cwd(), so it works from any checkout or worktree.
const ROOT = path.resolve(__dirname, '..');
const PORT = 8731;
const INDEX = '/why-atb-demo.html';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

http
  .createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel === '/') rel = INDEX;

    const file = path.join(ROOT, path.normalize(rel));
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.readFile(file, (err, buf) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Not found: ' + rel);
      }
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(buf);
    });
  })
  .listen(PORT, '127.0.0.1', () => {
    console.log('Serving ' + ROOT + ' on http://127.0.0.1:' + PORT);
  });
