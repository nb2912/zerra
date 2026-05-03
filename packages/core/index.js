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

  const customEnvKeys = new Set();
  const recentRequests = [];
  const MAX_LOGS = 20;

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
          
          if (!process.env.hasOwnProperty(key)) {
            process.env[key] = value;
          }
          customEnvKeys.add(key);
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
      const duration = Date.now() - startTime;
      const path = req.path || url;

      // Log to terminal
      if (config.features.logging) {
        const statusColor = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
        const resetColor = '\x1b[0m';
        console.log(`${statusColor}[${method}]${resetColor} ${path} ➜ ${statusColor}${res.statusCode}${resetColor} (${duration}ms)`);
      }

      // Store for dashboard (exclude the dashboard itself)
      if (path !== '/__zerra' && path !== '/favicon.ico') {
        recentRequests.unshift({
          method,
          path,
          statusCode: res.statusCode,
          duration,
          timestamp: new Date().toLocaleTimeString()
        });
        if (recentRequests.length > MAX_LOGS) recentRequests.pop();
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
            const fullPath = `/${route === 'index' ? '' : route}`;
            
            // Try to extract schema for playground presets
            let schema = null;
            try {
              const mod = jiti(filePath);
              schema = mod.schema || (mod.default && mod.default.schema);
            } catch (e) {}

            results.push({ path: fullPath, schema });
          }
        });
        return results;
      };

      const routes = getRoutes(apiDir);
      const featureList = Object.entries(config.features)
        .map(([k, v]) => `<li><strong>${k}</strong>: ${v ? '✅' : '❌'}</li>`).join('');
      const routeList = routes.map(r => `<li><a href="${r.path}">${r.path}</a></li>`).join('');

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Zerra Dev Dashboard</title>
            <style>
              :root {
                --primary: #0070f3;
                --bg: #fafafa;
                --card-bg: #ffffff;
                --text: #171717;
                --text-light: #666;
                --border: #eaeaea;
                --success: #0070f3;
                --warning: #f5a623;
                --error: #ff0000;
              }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                line-height: 1.5; 
                background: var(--bg); 
                color: var(--text);
                margin: 0;
                padding: 0;
              }
              header {
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                color: #fff;
                padding: 16px 40px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                position: sticky;
                top: 0;
                z-index: 100;
              }
              header h1 { 
                margin: 0; 
                font-size: 1.2rem; 
                display: flex; 
                align-items: center; 
                gap: 12px; 
                letter-spacing: 2px;
                font-weight: 800;
              }
              header h1 span.console-text { 
                font-weight: 300; 
                opacity: 0.6; 
                font-size: 0.9rem; 
                letter-spacing: 0;
                border-left: 1px solid rgba(255,255,255,0.2);
                padding-left: 12px;
              }
              .badge { font-size: 0.75rem; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 20px; font-weight: normal; }
              
              main { max-width: 1300px; margin: 40px auto; padding: 0 20px; }
              
              .grid { display: grid; grid-template-columns: 2.5fr 1fr; gap: 25px; margin-bottom: 20px; }
              @media (max-width: 1024px) { .grid { grid-template-columns: 1fr; } }
              
              section { 
                background: var(--card-bg); 
                padding: 24px; 
                border-radius: 12px; 
                border: 1px solid var(--border);
                box-shadow: 0 4px 6px rgba(0,0,0,0.02);
              }
              h2 { margin-top: 0; font-size: 1.1rem; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; color: var(--text-light); text-transform: uppercase; letter-spacing: 1px; }
              
              ul { list-style: none; padding: 0; margin: 0; }
              li { margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
              
              .route-link { color: var(--primary); text-decoration: none; font-weight: 500; font-family: monospace; font-size: 1rem; }
              .route-link:hover { text-decoration: underline; }
              
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { text-align: left; padding: 12px 8px; border-bottom: 2px solid var(--border); font-size: 0.85rem; color: var(--text-light); }
              td { padding: 12px 8px; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
              
              .status-badge { 
                padding: 4px 10px; 
                border-radius: 6px; 
                font-size: 0.75rem; 
                font-weight: bold; 
                color: #fff;
              }
              
              .env-item { background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 0.85rem; color: #444; }
              
              /* Fix for long error messages/stacks */
              pre { 
                white-space: pre-wrap !important; 
                word-break: break-all !important; 
                max-height: 300px !important; 
                overflow-y: auto !important; 
                margin: 0 !important; 
              }
            </style>
          </head>
          <body>
            <main style="margin-top: 20px;">
              <div class="grid">
                <section>
                  <h2>📂 Active Routes & Playground</h2>
                  <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${routes.length > 0 ? routes.map(r => {
                      const sampleBody = r.schema ? JSON.stringify(Object.fromEntries(
                        Object.entries(r.schema).map(([k, t]) => [k, t === 'number' ? 0 : t === 'boolean' ? false : 'text'])
                      )) : '{}';
                      
                      return `
                      <div style="border: 1px solid var(--border); border-radius: 8px; padding: 15px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                          <a href="${r.path}" class="route-link" style="font-size: 1.1rem;">${r.path}</a>
                          ${r.schema ? '<span class="badge" style="background:#eee; color:#666;">Has Schema</span>' : ''}
                        </div>
                        
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;">
                          <select id="method-${r.path}" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); background: #fff; font-family: inherit;">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="PATCH">PATCH</option>
                            <option value="DELETE">DELETE</option>
                          </select>
                          <input type="text" id="body-${r.path}" value='${sampleBody}' placeholder='{"key": "value"}' style="flex-grow: 1; padding: 4px 10px; border-radius: 4px; border: 1px solid var(--border); font-family: monospace; font-size: 0.8rem;">
                          <button onclick="testRoute('${r.path}')" style="background: var(--primary); color: #fff; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.8rem;">SEND</button>
                        </div>

                        <div id="res-${r.path}" style="display: none; background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; overflow-x: auto; margin-top: 10px; position: relative;">
                          <div id="status-${r.path}" style="position: absolute; top: 8px; right: 8px; font-size: 0.7rem; font-weight: bold;"></div>
                          <pre style="margin: 0;"></pre>
                        </div>
                      </div>
                    `}).join('') : '<div style="color:#999">No routes found in /api</div>'}
                  </div>
                </section>

                <section>
                  <h2>⚙️ Features</h2>
                  <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${Object.entries(config.features).map(([k, v]) => `
                      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.9rem; border-bottom: 1px solid #f9f9f9; padding-bottom: 8px;">
                        <span style="color: ${v ? 'inherit' : '#999'}; font-weight: 500;">${k}</span>
                        <span>${v ? '✅' : '❌'}</span>
                      </div>
                    `).join('')}
                  </div>
                </section>
              </div>

              <section style="margin-bottom: 20px;">
                <h2>📊 Recent Activity</h2>
                <table>
                  <thead>
                    <tr>
                      <th>METHOD</th>
                      <th>PATH</th>
                      <th>STATUS</th>
                      <th>TIME</th>
                      <th>DURATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recentRequests.map(req => {
                      const color = req.statusCode >= 500 ? 'var(--error)' : req.statusCode >= 400 ? 'var(--warning)' : 'var(--success)';
                      return `
                        <tr>
                          <td><strong>${req.method}</strong></td>
                          <td style="font-family: monospace; color: #444;">${req.path}</td>
                          <td><span class="status-badge" style="background: ${color}">${req.statusCode}</span></td>
                          <td style="color: #888;">${req.timestamp}</td>
                          <td style="color: #888;">${req.duration}ms</td>
                        </tr>
                      `;
                    }).join('') || '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">Waiting for requests...</td></tr>'}
                  </tbody>
                </table>
              </section>

              <section>
                <h2>🔐 Environment</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                  ${Object.keys(process.env).filter(k => {
                    const isCustom = customEnvKeys.has(k);
                    const isImportant = ['PORT', 'NODE_ENV'].includes(k);
                    const isSystem = /^(ALLUSERSPROFILE|APPDATA|COMPUTERNAME|ComSpec|Common|DriverData|HOMEDRIVE|HOMEPATH|LOCALAPPDATA|LOGONSERVER|NUMBER_OF_PROCESSORS|OS|Path|PATHEXT|PROCESSOR|Program|PSModulePath|PUBLIC|System|TEMP|TMP|USER|windir|ZES_|VSCODE_|ANTIGRAVITY_)/i.test(k);
                    return (isCustom || isImportant) && !isSystem;
                  }).map(k => `
                    <div style="background: #f9f9f9; border: 1px solid #eee; padding: 10px 15px; border-radius: 8px;">
                      <div style="font-size: 0.7rem; color: #999; margin-bottom: 4px; font-weight: bold;">${k}</div>
                      <div class="env-item">${process.env[k]}</div>
                    </div>
                  `).join('') || '<div style="color:#999">No custom variables loaded</div>'}
                </div>
              </section>
            </main>

            <script>
              async function testRoute(path) {
                const method = document.getElementById('method-' + path).value;
                const bodyStr = document.getElementById('body-' + path).value;
                const resDiv = document.getElementById('res-' + path);
                const statusDiv = document.getElementById('status-' + path);
                const pre = resDiv.querySelector('pre');
                
                resDiv.style.display = 'block';
                pre.innerText = 'Sending request...';
                statusDiv.innerText = '';
                
                try {
                  const options = { method, headers: {} };
                  if (['POST', 'PUT', 'PATCH'].includes(method) && bodyStr) {
                    options.headers['Content-Type'] = 'application/json';
                    options.body = bodyStr;
                  }
                  
                  const start = Date.now();
                  const response = await fetch(path, options);
                  const duration = Date.now() - start;
                  const data = await response.json().catch(() => null);
                  
                  statusDiv.innerText = response.status + ' (' + duration + 'ms)';
                  statusDiv.style.color = response.status >= 400 ? '#ff4d4f' : '#52c41a';
                  pre.innerText = JSON.stringify(data, null, 2) || 'No response body';
                } catch (err) {
                  statusDiv.innerText = 'ERROR';
                  statusDiv.style.color = '#ff4d4f';
                  pre.innerText = err.message;
                }
              }

              // Soft refresh every 5 seconds
              let refreshTimeout = setTimeout(() => {
                window.location.reload();
              }, 5000);

              // Pause refresh if user is interacting with playground
              document.addEventListener('mousedown', () => {
                clearTimeout(refreshTimeout);
                refreshTimeout = setTimeout(() => window.location.reload(), 15000);
              });
            </script>
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
              if (config.features.validation && schema) {
                if (!req.body || typeof req.body !== 'object') {
                  return res.status(400).json({ 
                    error: "Validation Failed", 
                    details: ["Request body is required for this route."] 
                  });
                }

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
