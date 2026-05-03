const http = require("http");
const fs = require("fs");
const path = require("path");

function startServer(port = 3000) {
  const apiDir = path.join(process.cwd(), "api");

  const server = http.createServer(async (req, res) => {
    const { url, method } = req;
    
    // 1. Enhanced DX: Add res.status and res.json helpers
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    res.json = (data) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    };

    // 2. Enhanced DX: Parse query parameters
    const parsedUrl = new URL(url, `http://localhost:${port}`);
    req.query = Object.fromEntries(parsedUrl.searchParams);
    req.path = parsedUrl.pathname;

    // 3. Enhanced DX: CORS Helper
    res.cors = (options = { origin: '*', methods: 'GET,POST,PUT,DELETE,OPTIONS' }) => {
      res.setHeader('Access-Control-Allow-Origin', options.origin);
      res.setHeader('Access-Control-Allow-Methods', options.methods);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res;
    };

    // 4. Enhanced DX: Automatic Body Parsing
    const parseBody = () => {
      return new Promise((resolve) => {
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return resolve(null);
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            if (req.headers['content-type']?.includes('application/json') && body) {
              resolve(JSON.parse(body));
            } else {
              resolve(body);
            }
          } catch (e) {
            resolve({});
          }
        });
      });
    };

    req.body = await parseBody();

    // Handle OPTIONS requests automatically for CORS if requested
    if (method === 'OPTIONS') {
      res.cors();
      res.statusCode = 204;
      return res.end();
    }

    const cleanPath = req.path === "/" ? "/index" : req.path;
    const filePath = path.join(apiDir, `${cleanPath}.js`);

    if (fs.existsSync(filePath)) {
      try {
        delete require.cache[require.resolve(filePath)];
        const handler = require(filePath);

        if (typeof handler === "function") {
          await handler(req, res);
        } else {
          res.status(500).json({ error: `Handler in ${cleanPath}.js must be a function.` });
        }
      } catch (err) {
        res.status(500).json({ error: "Runtime Error", message: err.message });
      }
    } else {
      res.status(404).json({ error: "Not Found", route: url, expectedFile: filePath });
    }
  });

  server.listen(port, () => {
    console.log(`\n🚀 Zerra Engine started on http://localhost:${port}`);
    console.log(`📁 Mapping routes from: ${apiDir}\n`);
  });
}

module.exports = { startServer };
