/**
 * Zerra Lambda Adapter
 * 
 * Converts AWS API Gateway (v2 HTTP API) events into Zerra-compatible
 * req/res objects, runs them through the same handler pipeline, and
 * returns a proper API Gateway response.
 * 
 * Usage in a Lambda handler:
 *   const { createLambdaHandler } = require('zerra-core/lambda');
 *   exports.handler = createLambdaHandler();
 * 
 * Or for a single-route Lambda:
 *   const { routeHandler } = require('zerra-core/lambda');
 *   const myRoute = require('./api/users');
 *   exports.handler = routeHandler(myRoute);
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Readable } = require('stream');

// ─── Simulated Request (IncomingMessage-like) ────────────────────

class LambdaRequest {
  constructor(event, context) {
    const rc = event.requestContext || {};
    const httpMethod = event.httpMethod || (rc.http && rc.http.method) || 'GET';
    const rawPath = event.rawPath || event.path || '/';
    const rawQuery = event.rawQueryString || '';

    this.method = httpMethod.toUpperCase();
    this.url = rawQuery ? `${rawPath}?${rawQuery}` : rawPath;
    this.headers = this._normalizeHeaders(event.headers || {});
    this.socket = {
      remoteAddress: (rc.http && rc.http.sourceIp) || (rc.identity && rc.identity.sourceIp) || '127.0.0.1',
    };
    this.connection = this.socket;

    // Pre-parsed fields (Zerra expects these)
    this.path = rawPath;
    this.query = event.queryStringParameters || {};
    this.params = event.pathParameters || {};

    // Parse cookies
    this.cookies = {};
    if (event.cookies && Array.isArray(event.cookies)) {
      event.cookies.forEach(c => {
        const [key, ...rest] = c.split('=');
        if (key) this.cookies[key.trim()] = rest.join('=');
      });
    } else if (this.headers.cookie) {
      this.headers.cookie.split(';').forEach(c => {
        const parts = c.split('=');
        const key = (parts.shift() || '').trim();
        if (key) {
          try { this.cookies[key] = decodeURIComponent(parts.join('=')); }
          catch (e) { this.cookies[key] = parts.join('='); }
        }
      });
    }

    // Parse body
    if (event.body) {
      const contentType = this.headers['content-type'] || '';
      if (event.isBase64Encoded) {
        this._rawBody = Buffer.from(event.body, 'base64');
      } else {
        this._rawBody = Buffer.from(event.body);
      }

      if (contentType.includes('application/json')) {
        try { this.body = JSON.parse(this._rawBody.toString()); }
        catch (e) { this.body = this._rawBody.toString(); }
      } else {
        this.body = this._rawBody.toString();
      }
    } else {
      this.body = null;
      this._rawBody = null;
    }

    this.files = [];

    // Request tracing
    this.id = this.headers['x-request-id'] || (rc.requestId) || crypto.randomUUID();

    // User (to be populated by middleware/guards)
    this.user = undefined;

    // Lambda context reference
    this._lambdaContext = context;
    this._lambdaEvent = event;
  }

  _normalizeHeaders(headers) {
    const normalized = {};
    for (const [key, value] of Object.entries(headers)) {
      normalized[key.toLowerCase()] = value;
    }
    return normalized;
  }

  // Stream interface stubs (for compatibility)
  on(event, cb) {
    if (event === 'data' && this._rawBody) {
      cb(this._rawBody);
    }
    if (event === 'end') {
      process.nextTick(cb);
    }
    return this;
  }
}

// ─── Simulated Response (ServerResponse-like) ────────────────────

class LambdaResponse {
  constructor() {
    this.statusCode = 200;
    this._headers = {};
    this._body = '';
    this._ended = false;
    this._isBase64 = false;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  setHeader(name, value) {
    this._headers[name.toLowerCase()] = String(value);
    return this;
  }

  getHeader(name) {
    return this._headers[name.toLowerCase()];
  }

  removeHeader(name) {
    delete this._headers[name.toLowerCase()];
  }

  writeHead(statusCode, headers) {
    this.statusCode = statusCode;
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        this.setHeader(key, value);
      }
    }
    return this;
  }

  write(chunk) {
    if (Buffer.isBuffer(chunk)) {
      this._body += chunk.toString();
    } else {
      this._body += chunk;
    }
    return true;
  }

  end(data) {
    if (data !== undefined && data !== null) {
      if (Buffer.isBuffer(data)) {
        this._body += data.toString();
      } else {
        this._body += data;
      }
    }
    this._ended = true;
    return this;
  }

  json(data) {
    this.setHeader('content-type', 'application/json');
    this.end(JSON.stringify(data));
  }

  cors(options = { origin: '*', methods: 'GET,POST,PUT,DELETE,OPTIONS' }) {
    this.setHeader('access-control-allow-origin', options.origin);
    this.setHeader('access-control-allow-methods', options.methods);
    this.setHeader('access-control-allow-headers', 'Content-Type, Authorization');
    return this;
  }

  sendFile(filePath) {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (fs.existsSync(absolutePath)) {
      const data = fs.readFileSync(absolutePath);
      this.end(data);
    } else {
      this.status(404).json({ error: 'File not found' });
    }
  }

  redirect(url, status = 302) {
    this.writeHead(status, { location: url });
    this.end();
  }

  cache(ttlSeconds) {
    this.setHeader('cache-control', `public, max-age=${ttlSeconds}`);
    return this;
  }

  // Pipe support (for static file serving)
  pipe() { return this; }

  /**
   * Convert to API Gateway v2 response format.
   */
  toLambdaResponse() {
    return {
      statusCode: this.statusCode,
      headers: this._headers,
      body: this._body || '',
      isBase64Encoded: this._isBase64,
    };
  }
}

// ─── Route Resolution ────────────────────────────────────────────

function resolveRoute(apiDir, cleanPath, configFeatures) {
  const jiti = require('jiti')(__filename);

  let filePath = path.join(apiDir, `${cleanPath}.js`);
  if (!fs.existsSync(filePath)) filePath = path.join(apiDir, `${cleanPath}.ts`);

  // Fallback: index file
  if (!fs.existsSync(filePath)) {
    const indexJs = path.join(apiDir, cleanPath, 'index.js');
    const indexTs = path.join(apiDir, cleanPath, 'index.ts');
    if (fs.existsSync(indexJs)) filePath = indexJs;
    else if (fs.existsSync(indexTs)) filePath = indexTs;
  }

  // Dynamic routing
  if (configFeatures.dynamicRouting && !fs.existsSync(filePath)) {
    const parts = cleanPath.split('/').filter(Boolean);
    let currentDir = apiDir;
    let matchedFile = null;
    const params = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (fs.existsSync(currentDir)) {
        const files = fs.readdirSync(currentDir);
        let match = files.find(f =>
          isLast
            ? f === `${part}.js` || f === `${part}.ts`
            : f === part && fs.statSync(path.join(currentDir, f)).isDirectory()
        );

        if (!match) {
          match = files.find(f =>
            isLast
              ? f.startsWith('[') && (f.endsWith('].js') || f.endsWith('].ts'))
              : f.startsWith('[') && f.endsWith(']') && fs.statSync(path.join(currentDir, f)).isDirectory()
          );
          if (match) {
            const paramName = isLast ? match.slice(1, match.lastIndexOf('].')) : match.slice(1, -1);
            params[paramName] = part;
          }
        }

        if (match) {
          if (isLast) matchedFile = path.join(currentDir, match);
          else currentDir = path.join(currentDir, match);
        } else {
          break;
        }
      }
    }

    if (matchedFile) {
      return { filePath: matchedFile, params };
    }
  }

  return { filePath: fs.existsSync(filePath) ? filePath : null, params: {} };
}

// ─── Middleware Chain Builder ─────────────────────────────────────

function resolveMiddleware(filePath, apiDir) {
  const middlewarePaths = [];
  let currentPath = path.dirname(filePath);

  while (currentPath.length >= apiDir.length && currentPath.startsWith(apiDir)) {
    let mwPath = path.join(currentPath, '_middleware.js');
    if (!fs.existsSync(mwPath)) mwPath = path.join(currentPath, '_middleware.ts');
    if (fs.existsSync(mwPath)) middlewarePaths.unshift(mwPath);
    if (currentPath === apiDir) break;
    currentPath = path.dirname(currentPath);
  }

  return middlewarePaths;
}

// ─── Guard Evaluation ────────────────────────────────────────────

async function evaluateGuard(filePath, apiDir, req, res, jiti) {
  const guardDir = path.dirname(filePath);
  let guardPath = path.join(guardDir, '_guard.js');
  if (!fs.existsSync(guardPath)) guardPath = path.join(guardDir, '_guard.ts');

  if (!fs.existsSync(guardPath)) return true;

  try {
    const guardModule = jiti(guardPath);
    const guard = guardModule.default || guardModule;

    if (typeof guard !== 'object' || guard === null) return true;

    if (typeof guard.init === 'function') {
      await guard.init(req, res);
      if (res._ended) return false;
    }

    if (guard.require === 'auth' && !req.user) {
      res.status(401).json({ error: 'Unauthorized', message: guard.message || 'Authentication required.' });
      return false;
    }

    if (guard.roles && Array.isArray(guard.roles)) {
      const userRole = req.user && (req.user.role || req.user.type);
      if (!userRole || !guard.roles.includes(userRole)) {
        res.status(403).json({ error: 'Forbidden', message: guard.message || `Roles required: ${guard.roles.join(', ')}` });
        return false;
      }
    }

    if (typeof guard.check === 'function') {
      if (!(await guard.check(req))) {
        res.status(403).json({ error: 'Forbidden', message: guard.message || 'Access denied.' });
        return false;
      }
    }

    if (guard.methods && !guard.methods.includes(req.method)) {
      res.status(405).json({ error: 'Method Not Allowed', message: `Only ${guard.methods.join(', ')} allowed.` });
      return false;
    }

    return true;
  } catch (e) {
    console.error('Guard error:', e.message);
    return true;
  }
}

// ─── Transform Resolver ──────────────────────────────────────────

function resolveTransform(filePath, apiDir) {
  const transformDir = path.dirname(filePath);
  let transformPath = path.join(transformDir, '_transform.js');
  if (!fs.existsSync(transformPath)) transformPath = path.join(transformDir, '_transform.ts');

  if (!fs.existsSync(transformPath)) {
    let searchDir = path.dirname(transformDir);
    while (searchDir.length >= apiDir.length && searchDir.startsWith(apiDir)) {
      const pt = path.join(searchDir, '_transform.js');
      const pts = path.join(searchDir, '_transform.ts');
      if (fs.existsSync(pt)) return pt;
      if (fs.existsSync(pts)) return pts;
      if (searchDir === apiDir) break;
      searchDir = path.dirname(searchDir);
    }
    return null;
  }

  return transformPath;
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Create a universal Lambda handler that maps ANY route through Zerra's
 * file-based routing system. Deploy as a single Lambda behind API Gateway
 * with a catch-all route ({proxy+}).
 */
function createLambdaHandler(options = {}) {
  const jiti = require('jiti')(__filename);
  const apiDir = options.apiDir || path.join(process.cwd(), 'api');

  // Load config
  let userConfig = {};
  const configJsonPath = path.join(process.cwd(), 'zerra.config.json');
  const configJsPath = path.join(process.cwd(), 'zerra.config.js');

  if (fs.existsSync(configJsPath)) {
    try { userConfig = jiti(configJsPath); userConfig = userConfig.default || userConfig; } catch (e) {}
  } else if (fs.existsSync(configJsonPath)) {
    try { userConfig = JSON.parse(fs.readFileSync(configJsonPath, 'utf8')); } catch (e) {}
  }

  const config = {
    features: { ...userConfig.features },
    cors: { origin: '*', methods: 'GET,POST,PUT,DELETE,OPTIONS', ...userConfig.cors },
    routePrefix: userConfig.routePrefix || '',
  };

  // Load .env if dotenv feature enabled
  if (config.features.dotenv) {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
        if (match) {
          let value = match[2] || '';
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
            value = value.slice(1, -1);
          if (!process.env.hasOwnProperty(match[1])) process.env[match[1]] = value;
        }
      });
    }
  }

  return async function handler(event, context) {
    // Keep the Lambda warm for connection reuse
    context.callbackWaitsForEmptyEventLoop = false;

    const req = new LambdaRequest(event, context);
    const res = new LambdaResponse();

    // Security headers
    if (config.features.securityHeaders) {
      res.setHeader('x-content-type-options', 'nosniff');
      res.setHeader('x-frame-options', 'DENY');
      res.setHeader('x-xss-protection', '1; mode=block');
      res.setHeader('strict-transport-security', 'max-age=31536000; includeSubDomains');
    }

    // CORS
    if (config.features.cors) {
      res.setHeader('access-control-allow-origin', config.cors.origin);
      res.setHeader('access-control-allow-methods', config.cors.methods);
      res.setHeader('access-control-allow-headers', 'Content-Type, Authorization, X-Request-Id');
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return res.toLambdaResponse();
      }
    }

    // Request tracing
    if (config.features.requestTracing) {
      res.setHeader('x-request-id', req.id);
    }

    // Route resolution
    let rawPath = req.path;
    if (config.routePrefix && rawPath.startsWith(config.routePrefix)) {
      rawPath = rawPath.slice(config.routePrefix.length);
    }
    const cleanPath = (rawPath === '/' || rawPath === '') ? '/index' : rawPath;

    const route = resolveRoute(apiDir, cleanPath, config.features);

    if (!route.filePath) {
      res.status(404).json({ error: 'Not Found', route: req.url });
      return res.toLambdaResponse();
    }

    // Merge dynamic params
    Object.assign(req.params, route.params);

    try {
      // Run middleware chain
      const middlewarePaths = config.features.middleware ? resolveMiddleware(route.filePath, apiDir) : [];
      let middlewareIndex = 0;

      const runNext = async () => {
        if (res._ended) return;

        if (middlewareIndex < middlewarePaths.length) {
          const mw = jiti(middlewarePaths[middlewareIndex++]);
          const actualMw = mw.default || mw;
          if (typeof actualMw === 'function') await actualMw(req, res, runNext);
          else await runNext();
        } else {
          // Guards
          if (config.features.guards) {
            const allowed = await evaluateGuard(route.filePath, apiDir, req, res, jiti);
            if (!allowed) return;
          }

          // Load handler
          const handler = jiti(route.filePath);
          let actualHandler = null;

          if (handler && typeof handler[req.method] === 'function') {
            actualHandler = handler[req.method];
          } else if (typeof handler === 'function' || (handler && typeof handler.default === 'function')) {
            actualHandler = handler.default || handler;
          }

          if (!actualHandler) {
            if (handler && typeof handler === 'object' && !handler.default) {
              res.status(405).json({ error: `Method ${req.method} Not Allowed` });
            } else {
              res.status(500).json({ error: 'Handler must be a function or export HTTP methods.' });
            }
            return;
          }

          // Validation
          const schemaDef = handler.schema;
          if (config.features.validation && schemaDef) {
            if (schemaDef.safeParseAsync || schemaDef.safeParse) {
              const result = await (schemaDef.safeParseAsync || schemaDef.safeParse).call(schemaDef, req.body);
              if (!result.success) {
                res.status(400).json({ error: 'Validation Failed', details: result.error.errors });
                return;
              }
              req.body = result.data;
            }
          }

          // Transforms
          if (config.features.transforms) {
            const transformPath = resolveTransform(route.filePath, apiDir);
            if (transformPath) {
              const originalJson = res.json.bind(res);
              res.json = (data) => {
                try {
                  const transformer = jiti(transformPath);
                  const fn = transformer.default || transformer;
                  if (typeof fn === 'function') return originalJson(fn(data, req, res));
                } catch (e) {}
                return originalJson(data);
              };
            }
          }

          // Build ctx object
          const ctx = {
            req, res,
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers,
            files: req.files || [],
            user: req.user,
            requestId: req.id,
            services: global.services || {},
            db: global.db || null,
          };

          const result = await actualHandler(ctx, res);

          // Handle Zerra return values (json(), text(), html(), redirect())
          if (result && result.__zerra) {
            if (result.headers) {
              for (const [k, v] of Object.entries(result.headers)) res.setHeader(k, v);
            }
            if (result.type === 'json') res.status(result.status).json(result.data);
            else if (result.type === 'text') { res.status(result.status); res.end(result.data); }
            else if (result.type === 'html') {
              res.setHeader('content-type', 'text/html');
              res.status(result.status);
              res.end(result.data);
            }
            else if (result.type === 'redirect') {
              res.writeHead(result.status, { location: result.url });
              res.end();
            }
          }
        }
      };

      await runNext();
    } catch (err) {
      const statusCode = err.status || 500;
      res.status(statusCode).json({
        error: statusCode >= 500 ? 'Runtime Error' : 'Request Error',
        message: err.message,
      });
    }

    return res.toLambdaResponse();
  };
}

/**
 * Create a Lambda handler for a single, pre-loaded route module.
 * Use this for per-route Lambda deployments.
 */
function routeHandler(handlerModule, options = {}) {
  return async function handler(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    const req = new LambdaRequest(event, context);
    const res = new LambdaResponse();

    // CORS
    res.setHeader('access-control-allow-origin', options.corsOrigin || '*');
    res.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('access-control-allow-headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return res.toLambdaResponse();
    }

    try {
      let actualHandler = null;
      if (handlerModule && typeof handlerModule[req.method] === 'function') {
        actualHandler = handlerModule[req.method];
      } else if (typeof handlerModule === 'function' || (handlerModule && typeof handlerModule.default === 'function')) {
        actualHandler = handlerModule.default || handlerModule;
      }

      if (!actualHandler) {
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        return res.toLambdaResponse();
      }

      const ctx = {
        req, res,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
        files: [],
        user: req.user,
        requestId: req.id,
        services: global.services || {},
        db: global.db || null,
      };

      const result = await actualHandler(ctx, res);

      if (result && result.__zerra) {
        if (result.headers) {
          for (const [k, v] of Object.entries(result.headers)) res.setHeader(k, v);
        }
        if (result.type === 'json') res.status(result.status).json(result.data);
        else if (result.type === 'text') { res.status(result.status); res.end(result.data); }
        else if (result.type === 'html') {
          res.setHeader('content-type', 'text/html');
          res.status(result.status);
          res.end(result.data);
        }
        else if (result.type === 'redirect') {
          res.writeHead(result.status, { location: result.url });
          res.end();
        }
      }
    } catch (err) {
      res.status(err.status || 500).json({
        error: 'Runtime Error',
        message: err.message,
      });
    }

    return res.toLambdaResponse();
  };
}

module.exports = { createLambdaHandler, routeHandler, LambdaRequest, LambdaResponse };
