const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === 'GET') {
    if (url === '/index.html') {
      serveHtmlFile('index.html', res);
    } else {
      serve404Page(res);
    }
  } else {
    serve404Page(res);
  }
});

function serveHtmlFile(filename, res) {
  const filePath = path.join(__dirname, 'public', filename);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    }
  });
}

function serve404Page(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});