const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

function startServer(port = 3000) {
  const isDev = process.env.NODE_ENV !== 'production';
  const jiti = require("jiti")(__filename);
  const configJsonPath = path.join(process.cwd(), 'zerra.config.json');
  const configJsPath = path.join(process.cwd(), 'zerra.config.js');
  const configTsPath = path.join(process.cwd(), 'zerra.config.ts');
  
  let userConfig = {};
  if (fs.existsSync(configJsPath) || fs.existsSync(configTsPath)) {
    try {
      const p = fs.existsSync(configJsPath) ? configJsPath : configTsPath;
      const mod = require("jiti")(__filename)(p);
      userConfig = mod.default || mod;
    } catch (e) {
      console.warn("⚠️ Invalid zerra.config file.", e);
    }
  } else if (fs.existsSync(configJsonPath)) {
    try {
      userConfig = JSON.parse(fs.readFileSync(configJsonPath, 'utf8'));
    } catch (e) {
      console.warn("⚠️ Invalid zerra.config.json. Using defaults.");
    }
  }

  let config = {
    features: {},
    cors: { origin: '*', methods: 'GET,POST,PUT,DELETE,OPTIONS' },
    routePrefix: '',
    plugins: []
  };

  if (userConfig.features) config.features = { ...config.features, ...userConfig.features };
  if (userConfig.cors) config.cors = { ...config.cors, ...userConfig.cors };
  if (userConfig.routePrefix !== undefined) config.routePrefix = userConfig.routePrefix;
  if (userConfig.plugins) config.plugins = userConfig.plugins;

  // 1. Optimized module caching mechanism
  const moduleCache = new Map();
  const getModule = (modulePath) => {
    if (isDev) {
      try {
        delete require.cache[require.resolve(modulePath)];
      } catch (e) {}
      return jiti(modulePath);
    }
    if (moduleCache.has(modulePath)) {
      return moduleCache.get(modulePath);
    }
    const mod = jiti(modulePath);
    moduleCache.set(modulePath, mod);
    return mod;
  };

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

  const lifecycleHooks = {
    onInit: [],
    onServerStart: [],
    onRequest: [],
    onResponse: [],
    onError: [],
    onShutdown: []
  };

  const registerPlugin = (plugin) => {
    if (plugin.onInit) lifecycleHooks.onInit.push(plugin.onInit);
    if (plugin.onServerStart) lifecycleHooks.onServerStart.push(plugin.onServerStart);
    if (plugin.onRequest) lifecycleHooks.onRequest.push(plugin.onRequest);
    if (plugin.onResponse) lifecycleHooks.onResponse.push(plugin.onResponse);
    if (plugin.onError) lifecycleHooks.onError.push(plugin.onError);
    if (plugin.onShutdown) lifecycleHooks.onShutdown.push(plugin.onShutdown);
  };

  // Load Plugins
  if (config.plugins && Array.isArray(config.plugins)) {
    config.plugins.forEach(plugin => {
      try {
        if (typeof plugin === 'string') {
          const loaded = getModule(path.isAbsolute(plugin) ? plugin : path.join(process.cwd(), plugin));
          if (typeof loaded === 'function') loaded(zerra);
          else if (loaded && typeof loaded === 'object') registerPlugin(loaded.default || loaded);
        } else if (plugin && typeof plugin === 'object') {
          registerPlugin(plugin);
        }
      } catch (e) {
        console.error(`✖ Failed to load plugin:`, e);
      }
    });
  }

  // Execute onInit hooks
  for (const hook of lifecycleHooks.onInit) {
    try { hook(zerra); } catch (e) { console.error('Plugin onInit Error:', e); }
  }

  const apiDir = path.join(process.cwd(), "api");

  // In-memory Radix Trie for fast production route resolution
  let routeTrie = { children: {}, dynamicChild: null, route: null };
  let routeTable = [];
  
  function buildRouteTable(dir, base = '') {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(buildRouteTable(filePath, path.join(base, file)));
      } else if ((file.endsWith('.js') || file.endsWith('.ts')) && !file.startsWith('_')) {
        const relRoute = path.join(base, file).replace(/\\/g, '/').replace(/\.(js|ts)$/, '');
        const segments = relRoute.split('/').filter(Boolean);
        
        // Resolve middleware paths for this route
        const middlewarePaths = [];
        if (config.features.middleware) {
          let currentPath = path.dirname(filePath);
          while (currentPath.length >= apiDir.length && currentPath.startsWith(apiDir)) {
            let mwPath = path.join(currentPath, '_middleware.js');
            if (!fs.existsSync(mwPath)) mwPath = path.join(currentPath, '_middleware.ts');
            if (fs.existsSync(mwPath)) {
              middlewarePaths.unshift(mwPath);
            }
            if (currentPath === apiDir) break;
            currentPath = path.dirname(currentPath);
          }
        }
        
        results.push({
          filePath,
          segments,
          middlewarePaths
        });
      }
    });
    return results;
  }

  if (!isDev) {
    routeTable = buildRouteTable(apiDir);
    for (const route of routeTable) {
      let node = routeTrie;
      for (const segment of route.segments) {
        if (segment.startsWith('[') && segment.endsWith(']')) {
          const paramName = segment.slice(1, -1);
          if (!node.dynamicChild) node.dynamicChild = { paramName, node: { children: {}, dynamicChild: null, route: null } };
          node = node.dynamicChild.node;
        } else {
          if (!node.children[segment]) node.children[segment] = { children: {}, dynamicChild: null, route: null };
          node = node.children[segment];
        }
      }
      node.route = route;
    }
  }

  // Pre-cached static files set for production static serving
  const publicFilesSet = new Set();
  
  function scanPublicFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        scanPublicFiles(filePath);
      } else {
        publicFilesSet.add(filePath);
      }
    });
  }

  if (!isDev && config.features.static) {
    scanPublicFiles(path.join(process.cwd(), "public"));
  }

  const server = http.createServer(async (req, res) => {
    const { url, method } = req;
    const startTime = Date.now();

    // Execute onRequest hooks
    for (const hook of lifecycleHooks.onRequest) {
      try { await hook(req, res); } catch (e) { console.error('Plugin onRequest Error:', e); }
    }

    // Feature: Request Tracing
    if (config.features.requestTracing) {
      req.id = req.headers['x-request-id'] || crypto.randomUUID();
      res.setHeader('X-Request-Id', req.id);
    }

    // Feature: Security Headers
    if (config.features.securityHeaders) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    // Feature: Global CORS
    if (config.features.cors && config.cors) {
      res.setHeader('Access-Control-Allow-Origin', config.cors.origin);
      res.setHeader('Access-Control-Allow-Methods', config.cors.methods);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
      if (method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
      }
    }

    // 1. Enhanced DX: Beautiful Request Logging
    const originalEnd = res.end;
    res.end = function (...args) {
      // Execute onResponse hooks
      for (const hook of lifecycleHooks.onResponse) {
        try { hook(req, res); } catch (e) { console.error('Plugin onResponse Error:', e); }
      }

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

    // Feature: Response Caching
    res.cache = (ttlSeconds) => {
      res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}`);
      return res;
    };

    // 2. Enhanced DX: Parse query parameters
    const parsedUrl = new URL(url, `http://localhost:${port}`);
    req.query = Object.fromEntries(parsedUrl.searchParams);
    req.path = parsedUrl.pathname;

    // Feature 1: Auto-parsed Cookies
    req.cookies = {};
    if (req.headers.cookie) {
      req.headers.cookie.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        const key = (parts.shift() || '').trim();
        if (key) {
          try { req.cookies[key] = decodeURIComponent(parts.join('=')); } catch (e) { req.cookies[key] = parts.join('='); }
        }
      });
    }

    // Feature 2: res.sendFile helper
    res.sendFile = (filePath) => {
       const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
       if (fs.existsSync(absolutePath)) {
         return fs.createReadStream(absolutePath).pipe(res);
       }
       res.status(404).json({ error: "File not found" });
    };

    // Feature 3: res.redirect helper
    res.redirect = (redirectUrl, status = 302) => {
      res.writeHead(status, { Location: redirectUrl });
      res.end();
    };

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
    const MAX_BODY_SIZE = (config.maxBodySize || 1) * 1024 * 1024; // Default 1MB
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
            const tmpPath = path.join(os.tmpdir(), `zerra-upload-${crypto.randomUUID()}`);
            const stream = fs.createWriteStream(tmpPath);
            file.pipe(stream);
            
            files.push({
              fieldname: name,
              filename: info.filename,
              encoding: info.encoding,
              mimetype: info.mimeType,
              tmpPath
            });
          });
          
          bb.on('field', (name, val) => {
            body[name] = val;
          });
          
          bb.on('close', () => resolve({ body, files }));
          req.pipe(bb);
        } else {
          let rawBody = [];
          let receivedBytes = 0;
          let aborted = false;
          req.on('data', chunk => {
            receivedBytes += chunk.length;
            if (receivedBytes > MAX_BODY_SIZE) {
              aborted = true;
              req.destroy();
              resolve({ body: null, files: [], error: 'BODY_TOO_LARGE' });
              return;
            }
            rawBody.push(chunk);
          });
          req.on('end', () => {
            if (aborted) return;
            try {
              const strBody = Buffer.concat(rawBody).toString();
              if (contentType.includes('application/json') && strBody) {
                resolve({ body: JSON.parse(strBody), files: [] });
              } else {
                resolve({ body: strBody, files: [] });
              }
            } catch (e) {
              resolve({ body: {}, files: [] });
            }
          });
        }
      });
    };

    // Conditional body parsed execution (optimization)
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      req.body = null;
      req.files = [];
    } else {
      const parsedData = await parseBody();
      if (parsedData.error === 'BODY_TOO_LARGE') {
        return res.status(413).json({ error: 'Payload Too Large', message: `Request body exceeds the maximum size of ${MAX_BODY_SIZE / (1024*1024)}MB.` });
      }
      req.body = parsedData.body;
      req.files = parsedData.files;
    }

    // Handle OPTIONS requests automatically for CORS if requested
    if (method === 'OPTIONS') {
      res.cors();
      res.statusCode = 204;
      return res.end();
    }

    req.params = {};
    let rawPath = req.path;
    if (config.routePrefix && rawPath.startsWith(config.routePrefix)) {
      rawPath = rawPath.slice(config.routePrefix.length);
    }
    const cleanPath = (rawPath === "/" || rawPath === "") ? "/index" : rawPath;

    // Feature 4: Built-in Rate Limiting
    if (config.features.rateLimiting) {
      if (!global.rateLimitStore) {
        global.rateLimitStore = new Map();
      }
      const ip = req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      
      const rlConfig = typeof config.features.rateLimiting === 'object' ? config.features.rateLimiting : { max: 100, windowMs: 60000 };
      const entry = global.rateLimitStore.get(ip);
      
      if (!entry || now > entry.resetTime) {
        // Enforce max size to prevent memory leak (passive eviction)
        if (global.rateLimitStore.size > 10000) {
          const firstKey = global.rateLimitStore.keys().next().value;
          global.rateLimitStore.delete(firstKey);
        }
        global.rateLimitStore.set(ip, { count: 1, resetTime: now + rlConfig.windowMs });
      } else {
        entry.count++;
      }
      
      const current = global.rateLimitStore.get(ip);
      if (current && current.count > rlConfig.max) {
        return res.status(429).json({ error: "Too Many Requests", message: "Rate limit exceeded. Try again later." });
      }
    }

    // Feature 5: Static File Serving (optimized via Set lookup in production)
    if (config.features.static && method === 'GET') {
      const publicDir = path.resolve(process.cwd(), "public");
      const publicPath = path.resolve(publicDir, (cleanPath === "/index" ? "/" : cleanPath).replace(/^\//, ''));
      
      // Path traversal protection: ensure resolved path is within public dir
      if (cleanPath.indexOf('\0') !== -1 || !publicPath.startsWith(publicDir)) {
        // Attempted path traversal — skip static serving
      } else {
        let isStaticFile = false;
        let stat = null;
        if (!isDev) {
          isStaticFile = publicFilesSet.has(publicPath);
          if (isStaticFile) stat = fs.statSync(publicPath);
        } else {
          isStaticFile = fs.existsSync(publicDir) && fs.existsSync(publicPath) && (stat = fs.statSync(publicPath)) && stat.isFile();
        }

        if (isStaticFile && stat) {
           const ext = path.extname(publicPath);
           const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2' };
           
           const etag = `W/"${stat.size}-${stat.mtime.getTime()}"`;
           if (req.headers['if-none-match'] === etag) {
             res.statusCode = 304;
             return res.end();
           }

           res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
           res.setHeader('Content-Length', stat.size);
           res.setHeader('ETag', etag);
           res.setHeader('Cache-Control', 'public, max-age=3600');
           return fs.createReadStream(publicPath).pipe(res);
        }
      }
    }

    // HTML escape utility to prevent XSS in dashboard
    const escapeHtml = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // 10. Enhanced DX: Dev Dashboard (dev-only)
    if (config.features.dashboard && isDev && cleanPath === '/__zerra') {
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
              const mod = getModule(filePath);
              schema = mod.schema || (mod.default && mod.default.schema);
            } catch (e) {}

            results.push({ path: fullPath, schema });
          }
        });
        return results;
      };

      const routes = getRoutes(apiDir);
      const featureList = Object.entries(config.features)
        .map(([k, v]) => `<li><strong>${k}</strong>: ${v ? '✔' : '✖'}</li>`).join('');
      const routeList = routes.map(r => `<li><a href="${r.path}">${r.path}</a></li>`).join('');

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zerra Dev Console</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --bg: #0f172a;
      --card-bg: rgba(30, 41, 59, 0.7);
      --text: #f8fafc;
      --text-light: #94a3b8;
      --border: rgba(255, 255, 255, 0.1);
      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;
    }
    * { box-sizing: border-box; }
    body { 
      font-family: 'Inter', sans-serif; 
      line-height: 1.6; 
      background: var(--bg); 
      background-image: 
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%);
      background-attachment: fixed;
      color: var(--text);
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
    header {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    header h1 { 
      margin: 0; 
      font-size: 1.5rem; 
      font-weight: 700;
      background: linear-gradient(to right, #818cf8, #c084fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge { 
      font-size: 0.7rem; 
      background: rgba(99, 102, 241, 0.2); 
      color: #818cf8;
      padding: 2px 8px; 
      border-radius: 9999px; 
      font-weight: 600; 
      letter-spacing: 0.5px;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    main { max-width: 1400px; margin: 2rem auto; padding: 0 2rem; }
    .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 2rem; }
    @media (max-width: 1024px) { .grid { grid-template-columns: 1fr; } }
    
    section { 
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      padding: 1.5rem; 
      border-radius: 16px; 
      border: 1px solid var(--border);
      box-shadow: 0 4px 24px -1px rgba(0,0,0,0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    section:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px -1px rgba(0,0,0,0.3);
    }
    h2 { 
      margin-top: 0; 
      font-size: 1.1rem; 
      margin-bottom: 1.5rem; 
      color: var(--text); 
      display: flex; 
      align-items: center; 
      gap: 10px;
      font-weight: 600;
    }
    
    /* Route Cards */
    .route-card {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }
    .route-card:hover {
      border-color: rgba(99, 102, 241, 0.5);
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);
    }
    .route-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .route-link { 
      color: #e2e8f0; 
      text-decoration: none; 
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 1.1rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .route-link:hover { color: #818cf8; }
    
    /* Form Elements */
    .input-group {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    select, input[type="text"] {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.2s;
    }
    select:focus, input[type="text"]:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    input[type="text"] { flex-grow: 1; }
    button {
      background: linear-gradient(135deg, var(--primary), var(--primary-hover));
      color: white;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    button:active { transform: translateY(0); }
    
    /* Response Area */
    .response-area {
      background: #000;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 0.85rem;
      position: relative;
      overflow-x: auto;
      border: 1px solid var(--border);
    }
    .status-tag {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
    }
    pre { margin: 0; color: #a5b4fc; }
    
    /* Tables */
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1rem; border-bottom: 1px solid var(--border); color: var(--text-light); font-weight: 500; font-size: 0.85rem; }
    td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem; }
    tr:hover td { background: rgba(255,255,255,0.02); }
    
    .status-pill {
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #fff;
    }
    
    /* Features & Env */
    .feature-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .feature-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      border-radius: 6px;
      background: rgba(0,0,0,0.1);
    }
    .env-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .env-card {
      background: rgba(0,0,0,0.2);
      border: 1px solid var(--border);
      padding: 0.75rem 1rem;
      border-radius: 8px;
    }
    .env-key { font-size: 0.75rem; color: var(--text-light); margin-bottom: 0.25rem; font-weight: 600; text-transform: uppercase; }
    .env-val { font-family: 'SF Mono', Consolas, monospace; font-size: 0.9rem; color: #e2e8f0; }
  </style>
</head>
<body>
  <header>
    <h1>🚀 Zerra<span style="font-weight:300;opacity:0.7;">Console</span></h1>
    <div class="badge">LIVE ENGINE</div>
  </header>
  <main>
    <div class="grid">
      <section>
        <h2>⚡ Active Routes & Playground</h2>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${routes.length > 0 ? routes.map(r => {
            const sampleBody = r.schema ? JSON.stringify(Object.fromEntries(
              Object.entries(r.schema).map(([k, t]) => [k, t === 'number' ? 0 : t === 'boolean' ? false : 'text'])
            )) : '{}';
            
            return `
            <div class="route-card">
              <div class="route-header">
                <a href="${r.path}" class="route-link">${r.path}</a>
                ${r.schema ? '<span class="badge">Protected by Schema</span>' : ''}
              </div>
              <div class="input-group">
                <select id="method-${r.path}">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input type="text" id="body-${r.path}" value='${sampleBody}' placeholder='{"key": "value"}'>
                <button onclick="testRoute('${r.path}')">SEND</button>
              </div>
              <div id="res-${r.path}" class="response-area" style="display: none;">
                <div id="status-${r.path}" class="status-tag"></div>
                <pre></pre>
              </div>
            </div>
            `
          }).join('') : '<div style="color:var(--text-light);text-align:center;padding:2rem;">No routes found in /api</div>'}
        </div>
      </section>

      <section>
        <h2>⚙️ Framework Features</h2>
        <div class="feature-list">
          ${Object.entries(config.features).map(([k, v]) => `
            <div class="feature-item" style="opacity: ${v ? '1' : '0.5'}">
              <span style="font-weight: 500;">${k}</span>
              <span>${v ? '✔' : '✖'}</span>
            </div>
          `).join('')}
        </div>
      </section>
    </div>

    <section style="margin-bottom: 2rem;">
      <h2>📡 Recent Activity</h2>
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>METHOD</th>
              <th>PATH</th>
              <th>STATUS</th>
              <th>TIME</th>
              <th>LATENCY</th>
            </tr>
          </thead>
          <tbody>
            ${recentRequests.map(req => {
              const color = req.statusCode >= 500 ? 'var(--error)' : req.statusCode >= 400 ? 'var(--warning)' : 'var(--success)';
              return `
                <tr>
                  <td><strong style="color: ${color};">${escapeHtml(req.method)}</strong></td>
                  <td style="font-family: 'SF Mono', monospace;">${escapeHtml(req.path)}</td>
                  <td><span class="status-pill" style="background: ${color}">${escapeHtml(String(req.statusCode))}</span></td>
                  <td style="color: var(--text-light);">${escapeHtml(req.timestamp)}</td>
                  <td style="color: var(--text-light);">${req.duration}ms</td>
                </tr>
              `;
            }).join('') || '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-light);">Listening for incoming requests...</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>🔐 Environment Variables</h2>
      <div class="env-grid">
        ${Object.keys(process.env).filter(k => {
          const isCustom = customEnvKeys.has(k);
          const isImportant = ['PORT', 'NODE_ENV'].includes(k);
          const isSystem = /^(ALLUSERSPROFILE|APPDATA|COMPUTERNAME|ComSpec|Common|DriverData|HOMEDRIVE|HOMEPATH|LOCALAPPDATA|LOGONSERVER|NUMBER_OF_PROCESSORS|OS|Path|PATHEXT|PROCESSOR|Program|PSModulePath|PUBLIC|System|TEMP|TMP|USER|windir|ZES_|VSCODE_|ANTIGRAVITY_)/i.test(k);
          return (isCustom || isImportant) && !isSystem;
        }).map(k => {
          const val = process.env[k] || '';
          const masked = val.length > 4 ? '****' + val.slice(-4) : '****';
          return `
          <div class="env-card">
            <div class="env-key">${escapeHtml(k)}</div>
            <div class="env-val">${escapeHtml(masked)}</div>
          </div>
          `
        }).join('') || '<div style="color:var(--text-light); grid-column: 1/-1; text-align:center;">No custom variables loaded</div>'}
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
        
        const contentType = response.headers.get("content-type");
        let data = null;
        if (contentType && contentType.includes("application/json")) {
           data = await response.json().catch(() => null);
        } else {
           data = await response.text();
        }
        
        statusDiv.innerText = response.status + ' (' + duration + 'ms)';
        statusDiv.style.background = response.status >= 400 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
        statusDiv.style.color = response.status >= 400 ? '#ef4444' : '#10b981';
        
        if (typeof data === 'object') {
          pre.innerText = JSON.stringify(data, null, 2) || 'No response body';
        } else {
          pre.innerText = data || 'No response body';
        }
      } catch (err) {
        statusDiv.innerText = 'ERROR';
        statusDiv.style.background = 'rgba(239, 68, 68, 0.2)';
        statusDiv.style.color = '#ef4444';
        pre.innerText = err.message;
      }
    }

    let refreshTimeout = setTimeout(() => {
      window.location.reload();
    }, 5000);

    document.addEventListener('mousedown', () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => window.location.reload(), 15000);
    });
  </script>
</body>
</html>

      `);
    }

    // 11. Enhanced DX: Auto-Generated API Docs (Swagger UI)
    if (config.features.dashboard && isDev && cleanPath === '/__zerra/docs') {
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
            
            let schema = null;
            let methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']; // default
            try {
              const mod = getModule(filePath);
              schema = mod.schema || (mod.default && mod.default.schema);
              const exportedMethods = Object.keys(mod).filter(k => ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(k));
              if (exportedMethods.length > 0) methods = exportedMethods;
            } catch (e) {}

            results.push({ path: fullPath, schema, methods });
          }
        });
        return results;
      };

      const routes = getRoutes(apiDir);
      
      const openapi = {
        openapi: "3.0.0",
        info: { title: "Zerra API", version: "1.0.0" },
        paths: {}
      };

      routes.forEach(r => {
        const swaggerPath = r.path.replace(/\[([^\]]+)\]/g, '{$1}');
        if (!openapi.paths[swaggerPath]) openapi.paths[swaggerPath] = {};
        
        const pathParams = [];
        const paramMatches = r.path.match(/\[([^\]]+)\]/g);
        if (paramMatches) {
          paramMatches.forEach(match => {
            const paramName = match.slice(1, -1);
            pathParams.push({
              name: paramName,
              in: "path",
              required: true,
              schema: { type: "string" }
            });
          });
        }

        r.methods.forEach(method => {
          const lowerMethod = method.toLowerCase();
          openapi.paths[swaggerPath][lowerMethod] = {
            summary: `${method} ${r.path}`,
            responses: {
              "200": { description: "Successful response" },
              "400": { description: "Validation Error" }
            }
          };

          if (pathParams.length > 0) {
            openapi.paths[swaggerPath][lowerMethod].parameters = pathParams;
          }

          if (r.schema && ['post', 'put', 'patch'].includes(lowerMethod)) {
            const properties = {};
            Object.entries(r.schema).forEach(([k, v]) => {
               if (typeof v === 'string') properties[k] = { type: v === 'number' ? 'number' : v === 'boolean' ? 'boolean' : 'string' };
               else properties[k] = { type: 'string' };
            });

            openapi.paths[swaggerPath][lowerMethod].requestBody = {
              content: {
                "application/json": {
                  schema: { type: "object", properties }
                }
              }
            };
          }
        });
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Zerra API Documentation</title>
          <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
          <script>
            window.onload = function() {
              window.ui = SwaggerUIBundle({
                spec: ${JSON.stringify(openapi).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
                layout: "BaseLayout"
              });
            };
          </script>
        </body>
        </html>
      `);
    }

    // 12. Enhanced DX: Health Check Endpoint
    if (config.features.dashboard && cleanPath === '/__zerra/health') { // health endpoint allowed in prod
      const memUsage = process.memoryUsage();
      const formatBytes = (bytes) => {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
      };
      const uptimeSeconds = process.uptime();
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeSeconds % 60);
      const uptimeStr = hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

      // Count routes
      const countRoutes = (dir) => {
        let count = 0;
        if (!fs.existsSync(dir)) return count;
        const list = fs.readdirSync(dir);
        list.forEach(file => {
          const fp = path.join(dir, file);
          const stat = fs.statSync(fp);
          if (stat && stat.isDirectory()) count += countRoutes(fp);
          else if ((file.endsWith('.js') || file.endsWith('.ts')) && !file.startsWith('_')) count++;
        });
        return count;
      };

      // Calculate avg response time from recent requests
      const avgResponseTime = recentRequests.length > 0
        ? (recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length).toFixed(1)
        : '0';

      return res.json({
        status: 'healthy',
        uptime: uptimeStr,
        memory: {
          rss: formatBytes(memUsage.rss),
          heapUsed: formatBytes(memUsage.heapUsed),
          heapTotal: formatBytes(memUsage.heapTotal)
        },
        routes: countRoutes(apiDir),
        avgResponseTime: avgResponseTime + 'ms',
        totalRequests: recentRequests.length,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        framework: 'Zerra'
      });
    }

    let filePath = null;
    let middlewarePaths = [];

    if (!isDev) {
      // 1. Production Mode: Ultra-fast O(K) Trie-based route lookup
      const reqSegments = cleanPath.split('/').filter(Boolean);
      let node = routeTrie;
      let isMatch = true;
      const tempParams = {};

      for (let i = 0; i < reqSegments.length; i++) {
        const seg = reqSegments[i];
        if (node.children[seg]) {
          node = node.children[seg];
        } else if (node.dynamicChild) {
          tempParams[node.dynamicChild.paramName] = seg;
          node = node.dynamicChild.node;
        } else {
          isMatch = false;
          break;
        }
      }

      if (isMatch && node.route) {
        filePath = node.route.filePath;
        req.params = tempParams;
        middlewarePaths = node.route.middlewarePaths;
      }
    } else {
      // 2. Development Mode: Dynamic Filesystem Walk for instant hot-reloading
      filePath = path.join(apiDir, `${cleanPath}.js`);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(apiDir, `${cleanPath}.ts`);
      }
      // Fallback: check for index file inside directory (e.g., /users -> /users/index.js)
      if (!fs.existsSync(filePath)) {
        const indexPathJs = path.join(apiDir, cleanPath, 'index.js');
        const indexPathTs = path.join(apiDir, cleanPath, 'index.ts');
        if (fs.existsSync(indexPathJs)) filePath = indexPathJs;
        else if (fs.existsSync(indexPathTs)) filePath = indexPathTs;
      }

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

      // Populate middleware chain for dev mode dynamically
      if (filePath && fs.existsSync(filePath) && config.features.middleware) {
        const targetDir = path.dirname(filePath);
        let currentPath = targetDir;
        while (currentPath.length >= apiDir.length && currentPath.startsWith(apiDir)) {
          let mwPath = path.join(currentPath, '_middleware.js');
          if (!fs.existsSync(mwPath)) mwPath = path.join(currentPath, '_middleware.ts');
          
          if (fs.existsSync(mwPath)) {
            middlewarePaths.unshift(mwPath);
          }
          if (currentPath === apiDir) break;
          currentPath = path.dirname(currentPath);
        }
      }
    }

    if (filePath && fs.existsSync(filePath)) {
      try {
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
            const mw = getModule(mwPath);
            if (typeof mw === 'function' || (mw && typeof mw.default === 'function')) {
               const actualMw = mw.default || mw;
               await actualMw(req, res, runNext);
            } else {
               await runNext();
            }
          } else {
            // Feature: Declarative Route Guards (_guard.js)
            if (config.features.guards) {
              const guardDir = path.dirname(filePath);
              let guardPath = path.join(guardDir, '_guard.js');
              if (!fs.existsSync(guardPath)) guardPath = path.join(guardDir, '_guard.ts');
              
              if (fs.existsSync(guardPath)) {
                try {
                  const guardModule = getModule(guardPath);
                  const guard = guardModule.default || guardModule;
                  
                  if (typeof guard === 'object' && guard !== null) {
                    // Lifecycle hook for dynamic initialization (e.g. populating req.user)
                    if (typeof guard.init === 'function') {
                      await guard.init(req, res);
                      if (responseSent) return;
                    }

                    // Check 'require' field: if "auth", req.user must exist
                    if (guard.require === 'auth' && !req.user) {
                      return res.status(401).json({ 
                        error: 'Unauthorized', 
                        message: guard.message || 'Authentication is required to access this route.' 
                      });
                    }

                    // Check 'roles' field: req.user.role must be in the array
                    if (guard.roles && Array.isArray(guard.roles)) {
                      const userRole = req.user && (req.user.role || req.user.type);
                      if (!userRole || !guard.roles.includes(userRole)) {
                        return res.status(403).json({ 
                          error: 'Forbidden', 
                          message: guard.message || `Access restricted to roles: ${guard.roles.join(', ')}` 
                        });
                      }
                    }

                    // Check 'check' field: custom predicate function
                    if (typeof guard.check === 'function') {
                      const allowed = await guard.check(req);
                      if (!allowed) {
                        return res.status(403).json({ 
                          error: 'Forbidden', 
                          message: guard.message || 'Access denied by route guard.' 
                        });
                      }
                    }

                    // Check 'methods' field: only allow specific HTTP methods
                    if (guard.methods && Array.isArray(guard.methods)) {
                      if (!guard.methods.includes(method)) {
                        return res.status(405).json({ 
                          error: 'Method Not Allowed', 
                          message: `Only ${guard.methods.join(', ')} allowed on this route.` 
                        });
                      }
                    }
                  }
                } catch (e) {
                  if (config.features.logging) console.error('✖ Guard error:', e.message);
                }
              }
            }

            const handler = getModule(filePath);
            
            // Feature: HTTP Method Exports
            let actualHandler = null;
            if (handler && typeof handler[method] === "function") {
              actualHandler = handler[method];
            } else if (typeof handler === "function" || (handler && typeof handler.default === "function")) {
              actualHandler = handler.default || handler;
            }

            if (actualHandler) {
              
              // 9. Enhanced DX: Input Validation (Zod Support)
              const schemaDef = handler.schema;
              if (config.features.validation && schemaDef) {
                let validationErrors = [];

                const validateZod = async (zodSchema, data) => {
                  const result = await zodSchema.safeParseAsync(data);
                  if (!result.success) {
                    return { error: true, details: result.error.errors };
                  }
                  return { error: false, data: result.data };
                };

                if (schemaDef.safeParseAsync || schemaDef.safeParse) {
                  // Direct Zod schema for body
                  const result = await validateZod(schemaDef, req.body);
                  if (result.error) validationErrors.push(...result.details);
                  else req.body = result.data;
                } else if (schemaDef.body || schemaDef.query || schemaDef.params) {
                  // Advanced schema object: { body: ZodSchema, query: ZodSchema }
                  if (schemaDef.body && (schemaDef.body.safeParseAsync || schemaDef.body.safeParse)) {
                    const bodyResult = await validateZod(schemaDef.body, req.body);
                    if (bodyResult.error) validationErrors.push({ target: 'body', errors: bodyResult.details });
                    else req.body = bodyResult.data;
                  }
                  if (schemaDef.query && (schemaDef.query.safeParseAsync || schemaDef.query.safeParse)) {
                    const queryResult = await validateZod(schemaDef.query, req.query);
                    if (queryResult.error) validationErrors.push({ target: 'query', errors: queryResult.details });
                    else req.query = queryResult.data;
                  }
                  if (schemaDef.params && (schemaDef.params.safeParseAsync || schemaDef.params.safeParse)) {
                    const paramsResult = await validateZod(schemaDef.params, req.params);
                    if (paramsResult.error) validationErrors.push({ target: 'params', errors: paramsResult.details });
                    else req.params = paramsResult.data;
                  }
                } else {
                  console.warn("⚠️ Legacy typeof schema validation is deprecated. Please use Zod schemas.");
                }

                if (validationErrors.length > 0) {
                  return res.status(400).json({ error: "Validation Failed", details: validationErrors });
                }
              }

              // Feature: Response Transformers (_transform.js)
              if (config.features.transforms) {
                const transformDir = path.dirname(filePath);
                let transformPath = path.join(transformDir, '_transform.js');
                if (!fs.existsSync(transformPath)) transformPath = path.join(transformDir, '_transform.ts');
                
                // Also check parent directories up to apiDir
                if (!fs.existsSync(transformPath)) {
                  let searchDir = path.dirname(transformDir);
                  while (searchDir.length >= apiDir.length && searchDir.startsWith(apiDir)) {
                    const parentTransform = path.join(searchDir, '_transform.js');
                    const parentTransformTs = path.join(searchDir, '_transform.ts');
                    if (fs.existsSync(parentTransform)) { transformPath = parentTransform; break; }
                    if (fs.existsSync(parentTransformTs)) { transformPath = parentTransformTs; break; }
                    if (searchDir === apiDir) break;
                    searchDir = path.dirname(searchDir);
                  }
                }

                if (fs.existsSync(transformPath)) {
                  // Intercept res.json to apply transform
                  const originalJson = res.json;
                  res.json = (data) => {
                    try {
                      const transformModule = getModule(transformPath);
                      const transformer = transformModule.default || transformModule;
                      if (typeof transformer === 'function') {
                        const transformed = transformer(data, req, res);
                        return originalJson.call(res, transformed);
                      }
                    } catch (e) {
                      if (config.features.logging) console.error('✖ Transform error:', e.message);
                    }
                    return originalJson.call(res, data);
                  };
                }
              }

              // Construct modern ctx object
              const ctx = Object.create(req);
              Object.assign(ctx, {
                req,
                res,
                body: req.body,
                query: req.query,
                params: req.params,
                headers: req.headers,
                files: req.files || [],
                user: req.user,
                requestId: req.id,
                services: global.services || {},
                db: global.db || null
              });

              const result = await actualHandler(ctx, res);
              
              if (result && result.__zerra) {
                if (result.headers) {
                  for (const [k, v] of Object.entries(result.headers)) res.setHeader(k, v);
                }
                if (result.type === 'json') return res.status(result.status).json(result.data);
                if (result.type === 'text') return res.status(result.status).send(result.data);
                if (result.type === 'html') {
                  res.setHeader('Content-Type', 'text/html');
                  return res.status(result.status).send(result.data);
                }
                if (result.type === 'redirect') {
                  res.statusCode = result.status;
                  res.setHeader('Location', result.url);
                  return res.end();
                }
              }
            } else {
              if (handler && typeof handler === "object" && !handler.default) {
                res.status(405).json({ error: `Method ${method} Not Allowed on this route.` });
              } else {
                res.status(500).json({ error: `Handler in ${filePath} must be a function or export HTTP methods.` });
              }
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

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            if (!responseSent) reject(new Error("Request Timeout: Handler or middleware did not send a response within 30s"));
          }, 30000).unref();
        });

        await Promise.race([runGlobal(), timeoutPromise]);
      } catch (err) {
        // Execute onError hooks
        for (const hook of lifecycleHooks.onError) {
          try { hook(err, req, res); } catch (e) { console.error('Plugin onError Error:', e); }
        }

        if (config.features.errors) {
          // Check for custom _error.js handler
          let errorHandlerPath = path.join(apiDir, '_error.js');
          if (!fs.existsSync(errorHandlerPath)) errorHandlerPath = path.join(apiDir, '_error.ts');
          if (fs.existsSync(errorHandlerPath)) {
            try {
              const errorHandler = getModule(errorHandlerPath);
              const actualErrorHandler = errorHandler.default || errorHandler;
              if (typeof actualErrorHandler === 'function') {
                return await actualErrorHandler(err, req, res);
              }
            } catch (e) {
              console.error("✖ Error in custom error handler:", e);
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

  // Feature: WebSocket Support
  server.on('upgrade', (req, socket, head) => {
    let rawPath = req.url.split('?')[0];
    if (config.routePrefix && rawPath.startsWith(config.routePrefix)) {
      rawPath = rawPath.slice(config.routePrefix.length);
    }
    const cleanPath = (rawPath === "/" || rawPath === "") ? "/index" : rawPath;
    
    const wsPathJs = path.join(apiDir, `${cleanPath}/_ws.js`);
    const wsPathTs = path.join(apiDir, `${cleanPath}/_ws.ts`);
    const filePath = fs.existsSync(wsPathJs) ? wsPathJs : (fs.existsSync(wsPathTs) ? wsPathTs : null);

    if (filePath) {
      try {
        const wsModule = getModule(filePath);
        const handleUpgrade = wsModule.handleUpgrade || (wsModule.default && wsModule.default.handleUpgrade);
        if (typeof handleUpgrade === 'function') {
          handleUpgrade(req, socket, head);
        } else {
          socket.destroy();
        }
      } catch (e) {
        socket.destroy();
      }
    } else {
      socket.destroy();
    }
  });

  // Graceful shutdown handler
  global.activeJobs = [];
  const shutdown = (signal) => {
    console.log(`\n⏹️  ${signal} received. Shutting down gracefully...`);
    
    // Execute onShutdown hooks
    for (const hook of lifecycleHooks.onShutdown) {
      try { hook(); } catch (e) { console.error('Plugin onShutdown Error:', e); }
    }

    global.activeJobs.forEach(job => {
      try { job.stop(); } catch (e) {}
    });
    server.close(() => {
      console.log('✔ Server closed. Goodbye!');
      process.exit(0);
    });
    // Force exit after 10 seconds if connections don't close
    setTimeout(() => { process.exit(1); }, 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  server.listen(port, () => {
    console.log(`\n🚀 Zerra Engine started on http://localhost:${port}`);
    console.log(`📁 Mapping routes from: ${apiDir}\n`);

    // Execute onServerStart hooks
    for (const hook of lifecycleHooks.onServerStart) {
      try { hook({ port }); } catch (e) { console.error('Plugin onServerStart Error:', e); }
    }

    // Feature 6: Built-in Cron Job Scheduler
    if (config.features.cron) {
      try {
        const nodeCron = require('node-cron');
        const jobsDir = path.join(process.cwd(), "jobs");
        if (fs.existsSync(jobsDir)) {
          const jobFiles = fs.readdirSync(jobsDir).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
          jobFiles.forEach(file => {
            const filePath = path.join(jobsDir, file);
            const job = getModule(filePath);
            const schedule = job.schedule || (job.default && job.default.schedule);
            const task = job.task || (job.default && job.default.task) || (typeof job.default === 'function' ? job.default : null);
            
            if (schedule && typeof task === 'function') {
              const cronTask = nodeCron.schedule(schedule, task);
              global.activeJobs.push(cronTask);
              console.log(`⏰ Scheduled job: ${file} [${schedule}]`);
            }
          });
        }
      } catch (e) {
        console.warn("⚠️ Failed to initialize Cron Jobs. Make sure 'node-cron' is installed.");
      }
    }
  });

  return server;
}

class ZerraError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
  }
  static BadRequest(message = "Bad Request") { return new ZerraError(400, message); }
  static Unauthorized(message = "Unauthorized") { return new ZerraError(401, message); }
  static Forbidden(message = "Forbidden") { return new ZerraError(403, message); }
  static NotFound(message = "Not Found") { return new ZerraError(404, message); }
  static Conflict(message = "Conflict") { return new ZerraError(409, message); }
  static Internal(message = "Internal Server Error") { return new ZerraError(500, message); }
}

function defineConfig(config) {
  return config;
}

function definePlugin(plugin) {
  return plugin;
}

function json(data, init = {}) {
  return { __zerra: true, type: 'json', data, status: init.status || 200, headers: init.headers };
}

function text(data, init = {}) {
  return { __zerra: true, type: 'text', data, status: init.status || 200, headers: init.headers };
}

function html(data, init = {}) {
  return { __zerra: true, type: 'html', data, status: init.status || 200, headers: init.headers };
}

function redirect(url, status = 302) {
  return { __zerra: true, type: 'redirect', url, status };
}

module.exports = { startServer, ZerraError, defineConfig, definePlugin, json, text, html, redirect };
