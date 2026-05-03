const http = require("http");
const fs = require("fs");
const path = require("path");

function startServer(port = 3000) {
  const apiDir = path.join(process.cwd(), "api");

  const server = http.createServer((req, res) => {
    const { url, method } = req;
    
    // Simple path cleaning: remove trailing slashes and get file path
    const cleanPath = url === "/" ? "/index" : url;
    const filePath = path.join(apiDir, `${cleanPath}.js`);

    if (fs.existsSync(filePath)) {
      try {
        // Clear cache for hot-reloading in dev (optional, but good for DX)
        delete require.cache[require.resolve(filePath)];
        const handler = require(filePath);

        if (typeof handler === "function") {
          handler(req, res);
        } else {
          res.statusCode = 500;
          res.end(`Error: Handler in ${cleanPath}.js must be a function.`);
        }
      } catch (err) {
        res.statusCode = 500;
        res.end(`Runtime Error: ${err.message}`);
      }
    } else {
      res.statusCode = 404;
      res.end(`Route ${url} not found (No file at ${filePath})`);
    }
  });

  server.listen(port, () => {
    console.log(`\n🚀 Zerra Engine started on http://localhost:${port}`);
    console.log(`📁 Mapping routes from: ${apiDir}\n`);
  });
}

module.exports = { startServer };
