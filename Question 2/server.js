const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ITEMS_PATH = path.join(__dirname, 'data', 'items.json');

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/items') {
      getAllItems(res);
    } else if (req.url.startsWith('/items/')) {
      const itemId = req.url.split('/')[2];
      getOneItem(itemId, res);
    } else {
      serve404(res);
    }
  } else if (req.method === 'POST') {
    if (req.url === '/items') {
      createItem(req, res);
    } else {
      serve404(res);
    }
  } else if (req.method === 'PUT') {
    if (req.url.startsWith('/items/')) {
      const itemId = req.url.split('/')[2];
      updateItem(itemId, req, res);
    } else {
      serve404(res);
    }
  } else if (req.method === 'DELETE') {
    if (req.url.startsWith('/items/')) {
      const itemId = req.url.split('/')[2];
      deleteItem(itemId, res);
    } else {
      serve404(res);
    }
  } else {
    serve404(res);
  }
});

function getAllItems(res) {
  readItemsData((err, data) => {
    if (err) {
      serveError(res, 500, 'Internal Server Error');
    } else {
      serveJson(res, data);
    }
  });
}

function getOneItem(itemId, res) {
  readItemsData((err, data) => {
    if (err) {
      serveError(res, 500, 'Internal Server Error');
    } else {
      const item = data.find(item => item.id === itemId);
      if (item) {
        serveJson(res, item);
      } else {
        serveError(res, 404, 'Item not found');
      }
    }
  });
}

function createItem(req, res) {
  readItemsData((err, data) => {
    if (err) {
      serveError(res, 500, 'Internal Server Error');
    } else {
      readRequestBody(req, (body) => {
        const newItem = {
          id: generateUniqueId(),
          name: body.name,
          price: body.price,
          size: body.size,
        };
        data.push(newItem);
        writeItemsData(data, () => {
          serveJson(res, newItem, 201);
        });
      });
    }
  });
}

function updateItem(itemId, req, res) {
  readItemsData((err, data) => {
    if (err) {
      serveError(res, 500, 'Internal Server Error');
    } else {
      const item = data.find(item => item.id === itemId);
      if (item) {
        readRequestBody(req, (body) => {
          item.name = body.name || item.name;
          item.price = body.price || item.price;
          item.size = body.size || item.size;
          writeItemsData(data, () => {
            serveJson(res, item);
          });
        });
      } else {
        serveError(res, 404, 'Item not found');
      }
    }
  });
}

function deleteItem(itemId, res) {
  readItemsData((err, data) => {
    if (err) {
      serveError(res, 500, 'Internal Server Error');
    } else {
      const itemIndex = data.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        const deletedItem = data.splice(itemIndex, 1)[0];
        writeItemsData(data, () => {
          serveJson(res, deletedItem);
        });
      } else {
        serveError(res, 404, 'Item not found');
      }
    }
  });
}

function readItemsData(callback) {
  fs.readFile(ITEMS_PATH, 'utf8', (err, data) => {
    if (err) {
      callback(err);
    } else {
      try {
        const items = JSON.parse(data);
        callback(null, items);
      } catch (parseError) {
        callback(parseError);
      }
    }
  });
}

function writeItemsData(data, callback) {
  const itemsJson = JSON.stringify(data, null, 2);
  fs.writeFile(ITEMS_PATH, itemsJson, 'utf8', callback);
}

function readRequestBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });
  req.on('end', () => {
    try {
      const parsedBody = JSON.parse(body);
      callback(parsedBody);
    } catch (parseError) {
      serveError(res, 400, 'Invalid JSON data');
    }
  });
}

function serveJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function serveError(res, statusCode, message) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
  res.end(message);
}

function serve404(res) {
  serveError(res, 404, 'Not Found');
}

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
