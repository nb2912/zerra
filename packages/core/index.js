const http = require("http");
const fs = require("fs");
const path = require("path");

function startServer(port = 3000) {
  const jiti = require("jiti")(__filename);
  const configPath = path.join(process.cwd(), 'zerra.config.json');
  let config = {
    features: {
      logging: true,
      dynamicRouting: true,
      middleware: true,
      dotenv: true,
      validation: true,
      multipart: true,
      errors: true,
      dashboard: true
    },
    plugins: []
  };
  if (fs.existsSync(configPath)) {
    try {
      const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config.features = { ...config.features, ...(userConfig.features || {}) };
    } catch (e) {
      console.warn("⚠️ Invalid zerra.config.json. Using defaults.");
    }
  }

  // 8. Enhanced DX: Auto-load .env files
  if (config.features.dotenv) {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      envFile.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          // Remove quotes
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (!process.env.hasOwnProperty(key)) process.env[key] = value;
        }
      });
    }
  }

  const globalMiddleware = [];
  const resDecorators = {};
  const reqDecorators = {};

  const zerra = {
    use: (fn) => globalMiddleware.push(fn),
    decorate: (target, name, fn) => {
      if (target === 'res') resDecorators[name] = fn;
      if (target === 'req') reqDecorators[name] = fn;
    },
    config
  };

  // Load Plugins
  if (config.plugins && Array.isArray(config.plugins)) {
    config.plugins.forEach(pluginPath => {
      try {
        const plugin = jiti(path.isAbsolute(pluginPath) ? pluginPath : path.join(process.cwd(), pluginPath));
        if (typeof plugin === 'function') plugin(zerra);
      } catch (e) {
        console.error(`❌ Failed to load plugin: ${pluginPath}`, e);
      }
    });
  }

  const apiDir = path.join(process.cwd(), "api");

  const server = http.createServer(async (req, res) => {
    const { url, method } = req;
    const startTime = Date.now();

    // 1. Enhanced DX: Beautiful Request Logging
    const originalEnd = res.end;
    res.end = function (...args) {
      if (config.features.logging) {
        const duration = Date.now() - startTime;
        const statusColor = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
        const resetColor = '\x1b[0m';
        console.log(`${statusColor}[${method}]${resetColor} ${req.path || url} ➜ ${statusColor}${res.statusCode}${resetColor} (${duration}ms)`);
      }
      return originalEnd.apply(this, args);
    };

    // 2. Enhanced DX: Add res.status and res.json helpers
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

    // Apply Decorators
    Object.entries(resDecorators).forEach(([name, fn]) => { res[name] = fn.bind(res); });
    Object.entries(reqDecorators).forEach(([name, fn]) => { req[name] = fn.bind(req); });

    // 3. Enhanced DX: CORS Helper
    res.cors = (options = { origin: '*', methods: 'GET,POST,PUT,DELETE,OPTIONS' }) => {
      res.setHeader('Access-Control-Allow-Origin', options.origin);
      res.setHeader('Access-Control-Allow-Methods', options.methods);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res;
    };

    // 4. Enhanced DX: Automatic Body & File Parsing
    const parseBody = () => {
      return new Promise((resolve) => {
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return resolve({ body: null, files: [] });
        const contentType = req.headers['content-type'] || '';
        
        if (config.features.multipart && contentType.includes('multipart/form-data')) {
          const busboy = require('busboy');
          const bb = busboy({ headers: req.headers });
          const body = {};
          const files = [];
          
          bb.on('file', (name, file, info) => {
            const chunks = [];
            file.on('data', data => chunks.push(data));
            file.on('end', () => {
              files.push({
                fieldname: name,
                filename: info.filename,
                encoding: info.encoding,
                mimetype: info.mimeType,
                buffer: Buffer.concat(chunks)
              });
            });
          });
          
          bb.on('field', (name, val) => {
            body[name] = val;
          });
          
          bb.on('close', () => resolve({ body, files }));
          req.pipe(bb);
        } else {
          let rawBody = '';
          req.on('data', chunk => { rawBody += chunk.toString(); });
          req.on('end', () => {
            try {
              if (contentType.includes('application/json') && rawBody) {
                resolve({ body: JSON.parse(rawBody), files: [] });
              } else {
                resolve({ body: rawBody, files: [] });
              }
            } catch (e) {
              resolve({ body: {}, files: [] });
            }
          });
        }
      });
    };

    const parsedData = await parseBody();
    req.body = parsedData.body;
    req.files = parsedData.files;

    // Handle OPTIONS requests automatically for CORS if requested
    if (method === 'OPTIONS') {
      res.cors();
      res.statusCode = 204;
      return res.end();
    }

    req.params = {};
    const cleanPath = req.path === "/" ? "/index" : req.path;

    // 10. Enhanced DX: Dev Dashboard
    if (config.features.dashboard && cleanPath === '/__zerra') {
      const getRoutes = (dir, base = '') => {
        let results = [];
        if (!fs.existsSync(dir)) return results;
        const list = fs.readdirSync(dir);
        list.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat && stat.isDirectory()) {
            results = results.concat(getRoutes(filePath, path.join(base, file)));
          } else if ((file.endsWith('.js') || file.endsWith('.ts')) && !file.startsWith('_')) {
            const route = path.join(base, file).replace(/\\/g, '/').replace(/\.(js|ts)$/, '');
            results.push(route === 'index' ? '/' : `/${route}`);
          }
        });
        return results;
      };

      const routes = getRoutes(apiDir);
      const featureList = Object.entries(config.features)
        .map(([k, v]) => `<li><strong>${k}</strong>: ${v ? '✅' : '❌'}</li>`).join('');
      const routeList = routes.map(r => `<li><a href="${r}">${r}</a></li>`).join('');

      res.setHeader('Content-Type', 'text/html');
      return res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Zerra Dashboard</title>
            <style>
              body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; background: #f9f9f9; }
              h1 { color: #000; border-bottom: 2px solid #eee; padding-bottom: 10px; }
              section { background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 20px; }
              h2 { margin-top: 0; font-size: 1.2rem; }
              ul { padding-left: 20px; }
              li { margin-bottom: 5px; }
              a { color: #0070f3; text-decoration: none; }
              a:hover { text-decoration: underline; }
              .badge { font-size: 0.8rem; background: #000; color: #fff; padding: 2px 6px; border-radius: 3px; vertical-align: middle; }
            </style>
          </head>
          <body>
            <h1>🚀 Zerra Dev Dashboard <span class="badge">v1.1.1</span></h1>
            
            <section>
              <h2>📂 Active Routes</h2>
              <ul>${routeList || '<li>No routes found in /api</li>'}</ul>
            </section>

            <section>
              <h2>⚙️ Enabled Features</h2>
              <ul>${featureList}</ul>
            </section>

            <section>
              <h2>🔐 Environment Variables</h2>
              <ul>${Object.keys(process.env).filter(k => !k.startsWith('npm_') && !k.startsWith('NODE_')).map(k => `<li>${k}</li>`).join('') || '<li>No custom env vars loaded</li>'}</ul>
            </section>

            <p><small>Zerra Engine is running in development mode.</small></p>
          </body>
        </html>
      `);
    }

    let filePath = path.join(apiDir, `${cleanPath}.js`);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(apiDir, `${cleanPath}.ts`);
    }

    // 6. Enhanced DX: Dynamic Routing ([id].js)
    if (config.features.dynamicRouting && !fs.existsSync(filePath)) {
      const parts = cleanPath.split('/').filter(Boolean);
      let currentDir = apiDir;
      let matchedFile = null;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        
        if (fs.existsSync(currentDir)) {
          const files = fs.readdirSync(currentDir);
          
          // Look for exact match first
          let match = files.find(f => isLast ? f === `${part}.js` : f === part && fs.statSync(path.join(currentDir, f)).isDirectory());
          
          // Look for dynamic parameter [param]
          if (!match) {
            match = files.find(f => isLast ? (f.startsWith('[') && (f.endsWith('].js') || f.endsWith('].ts'))) : (f.startsWith('[') && f.endsWith(']') && fs.statSync(path.join(currentDir, f)).isDirectory()));
            if (match) {
              const paramName = isLast ? match.slice(1, match.lastIndexOf('].')) : match.slice(1, -1);
              req.params[paramName] = part;
            }
          }

          if (match) {
            if (isLast) {
              matchedFile = path.join(currentDir, match);
            } else {
              currentDir = path.join(currentDir, match);
            }
          } else {
            break;
          }
        } else {
          break;
        }
      }
      
      if (matchedFile) {
        filePath = matchedFile;
      }
    }

    if (fs.existsSync(filePath)) {
      try {
        // 7. Enhanced DX: Middleware (_middleware.js)
        const targetDir = path.dirname(filePath);
        let currentPath = targetDir;
        const middlewarePaths = [];
        
        if (config.features.middleware) {
          while (currentPath.length >= apiDir.length && currentPath.startsWith(apiDir)) {
            let mwPath = path.join(currentPath, '_middleware.js');
            if (!fs.existsSync(mwPath)) mwPath = path.join(currentPath, '_middleware.ts');
            
            if (fs.existsSync(mwPath)) {
              middlewarePaths.unshift(mwPath); // Run top-down
            }
            if (currentPath === apiDir) break;
            currentPath = path.dirname(currentPath);
          }
        }

        let middlewareIndex = 0;
        let responseSent = false;
        
        // Track if a response was sent to avoid double execution
        const originalEndM = res.end;
        res.end = function (...args) {
          responseSent = true;
          return originalEndM.apply(this, args);
        };

        const runNext = async () => {
          if (responseSent) return;

          if (middlewareIndex < middlewarePaths.length) {
            const mwPath = middlewarePaths[middlewareIndex++];
            delete require.cache[require.resolve(mwPath)];
            const mw = jiti(mwPath);
            if (typeof mw === 'function' || (mw && typeof mw.default === 'function')) {
               const actualMw = mw.default || mw;
               await actualMw(req, res, runNext);
            } else {
               await runNext();
            }
          } else {
            delete require.cache[require.resolve(filePath)];
            const handler = jiti(filePath);

            if (typeof handler === "function" || (handler && typeof handler.default === "function")) {
              const actualHandler = handler.default || handler;
              
              // 9. Enhanced DX: Input Validation
              const schema = handler.schema;
              if (config.features.validation && schema && typeof req.body === 'object' && req.body !== null) {
                const errors = [];
                for (const [key, type] of Object.entries(schema)) {
                   if (typeof req.body[key] !== type) {
                     errors.push(`Expected '${key}' to be '${type}', got '${typeof req.body[key]}'`);
                   }
                }
                if (errors.length > 0) {
                  return res.status(400).json({ error: "Validation Failed", details: errors });
                }
              }

              await actualHandler(req, res);
            } else {
              res.status(500).json({ error: `Handler in ${filePath} must be a function.` });
            }
          }
        };

        // 11. Enhanced DX: Global Middleware (Plugins)
        let globalIndex = 0;
        const runGlobal = async () => {
          if (globalIndex < globalMiddleware.length) {
            await globalMiddleware[globalIndex++](req, res, runGlobal);
          } else {
            await runNext();
          }
        };

        await runGlobal();

      } catch (err) {
        if (config.features.errors) {
          // Check for custom _error.js handler
          const errorHandlerPath = path.join(apiDir, '_error.js');
          if (fs.existsSync(errorHandlerPath)) {
            try {
              delete require.cache[require.resolve(errorHandlerPath)];
              const errorHandler = jiti(errorHandlerPath);
              const actualErrorHandler = errorHandler.default || errorHandler;
              if (typeof actualErrorHandler === 'function') {
                return await actualErrorHandler(err, req, res);
              }
            } catch (e) {
              console.error("❌ Error in custom error handler:", e);
            }
          }

          const statusCode = err.status || 500;
          const message = err.message || "Internal Server Error";
          
          return res.status(statusCode).json({ 
            error: statusCode >= 500 ? "Runtime Error" : "Request Error",
            message: message,
            stack: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV ? err.stack : undefined 
          });
        }
        
        // Fallback if errors feature is disabled
        res.status(500).json({ error: "Runtime Error", message: err.message });
      }
    } else {
      res.status(404).json({ error: "Not Found", route: url });
    }
  });

  server.listen(port, () => {
    console.log(`\n🚀 Zerra Engine started on http://localhost:${port}`);
    console.log(`📁 Mapping routes from: ${apiDir}\n`);
  });
}

module.exports = { startServer };
