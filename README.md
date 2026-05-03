# 🚀 Zerra

**The CLI-first backend generator and runtime engine.**

Zerra is designed to be the backend equivalent of Next.js—offering zero configuration, instant setup, file-based routing, and a massive focus on Developer Experience (DX).

[![npm version](https://img.shields.io/npm/v/create-zerra-app.svg)](https://www.npmjs.com/package/create-zerra-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **Zero Config**: Start building immediately without complex setups.
- **File-based Routing**: Folders and files in `/api` automatically become your API endpoints.
- **Dynamic Routing**: Use `[id].js` for dynamic path parameters.
- **File-Based Middleware**: Drop `_middleware.js` in any folder to protect or intercept routes.
- **Auto Validation**: Export a `schema` and let Zerra validate `req.body` automatically.
- **Smart Parsing**: Built-in JSON body parsing, `req.query`, and multipart file uploads (`req.files`).
- **CLI-First**: Scaffold your project with interactive database choices and optional DX feature flags.

---

## 🚀 Quick Start

1. **Initialize a new project:**
   ```bash
   npx create-zerra-app my-zerra-app
   ```
2. **Follow the interactive prompts**:
   - Choose your database (SQL, MongoDB, Supabase, or Firebase).
   - Select the advanced DX features you want (Logging, Routing, Validation, etc.).
   - Let the CLI auto-install dependencies and initialize Git for you.

3. **Run your server:**
   ```bash
   cd my-zerra-app
   npm run dev
   ```

---

## 🛠️ The Developer Experience (DX)

Zerra comes packed with features to make building APIs joyful. (All of these are opt-in via your `zerra.config.json`!)

### 1. Modern Handlers
No more manual data streams or strings. Zerra gives you `res.json()`, `res.status()`, and auto-parsed bodies.
```javascript
// api/users.js
module.exports = async (req, res) => {
  res.cors(); // Easily allow cross-origin requests
  const name = req.query.name;
  const data = req.body; // Automatically parsed JSON!
  res.status(200).json({ success: true, name });
};
```

### 2. Dynamic Routing (`req.params`)
Create a file named `api/users/[id].js`.
```javascript
// api/users/[id].js
module.exports = async (req, res) => {
  const userId = req.params.id;
  res.json({ user: userId });
};
```

### 3. File-Based Middleware
Place `_middleware.js` in any folder to run code before the routes in that folder.
```javascript
// api/admin/_middleware.js
module.exports = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  await next(); 
};
```

### 4. Automatic Input Validation
Export a `schema` object from your route. Zerra will automatically validate `req.body` and return a clean `400 Bad Request` if it fails.
```javascript
module.exports = async (req, res) => {
  res.json({ success: true, saved: req.body });
};

module.exports.schema = {
  email: 'string',
  age: 'number'
};
```

### 5. File Uploads (Multipart)
Zerra automatically handles `multipart/form-data` requests.
```javascript
module.exports = async (req, res) => {
  const files = req.files; // Array of file buffers!
  res.json({ uploadedCount: files.length });
};
```

### 6. Zero-Config Environment Variables
Just place a `.env` file at the root of your project. Zerra automatically parses it into `process.env` when the server starts.

### 7. Smart Error Handling
Zerra catches all errors and formats them into clean JSON. You can also create a custom handler at `api/_error.js`.
```javascript
// api/_error.js
module.exports = async (err, req, res) => {
  const status = err.status || 500;
  res.status(status).json({
    custom: true,
    message: err.message
  });
};
```
You can also throw custom status codes from any route:
`throw { status: 403, message: "Forbidden Access" };`

### 8. Dev Dashboard
Access a simple, clean dashboard at `/__zerra` to see all your registered routes, enabled features, and environment status.

### 9. Plugin System (Minimal)
Extend Zerra by adding plugins to your `zerra.config.json`. A plugin can add global middleware or decorate `req`/`res`.
```javascript
// Example plugin
module.exports = (zerra) => {
  zerra.use((req, res, next) => {
    console.log("Global Plugin Middleware!");
    next();
  });
  zerra.decorate('res', 'success', function(data) {
    this.status(200).json({ status: 'ok', data });
  });
};
```

### 10. Authentication Starter (JWT)
Scaffold a complete authentication system with one click. Includes:
- `api/auth/register.js` & `api/auth/login.js`
- `api/auth/me.js` (Session check)
- `api/protected/_middleware.js` (Route guard)
- Pre-configured `bcryptjs` and `jsonwebtoken` support.

---

## 📁 Project Structure (Generated App)

```text
/api            → Your route handlers & middlewares
/services       → Your business logic (DB clients, loggers, etc.)
zerra.config.json → Toggle specific Zerra DX features
.env            → Environment variables
server.js       → The Zerra core runtime
```

---

## 🤝 Contributing

We love contributors! Zerra is a monorepo managed with npm workspaces.

### Local Development Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/nb2912/zerra.git
   cd zerra
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Link the CLI for testing:**
   ```bash
   cd packages/cli
   npm link
   ```
4. **Test the CLI:**
   ```bash
   create-zerra-app my-test-app
   ```

### Project Roadmap
- [x] Dynamic Routing (e.g., `[id].js`)
- [x] Middleware System
- [x] Built-in Authentication Starter
- [x] Dev Mode Dashboard
- [ ] TypeScript Support
- [ ] Automatic API Documentation (Swagger)

---

## ⚖️ License

MIT © [NIHAL BASANIWAL](https://github.com/nb2912)
