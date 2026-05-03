# 🚀 Zerra

**The CLI-first backend generator and runtime engine.**

Zerra is designed to be the backend equivalent of Next.js—offering zero configuration, instant setup, and file-based routing.

[![npm version](https://img.shields.io/npm/v/create-zerra-app.svg)](https://www.npmjs.com/package/create-zerra-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **Zero Config**: Start building immediately without complex setups.
- **File-based Routing**: Folders and files in `/api` automatically become your API endpoints.
- **CLI-First**: Scaffolding your next backend project is just one command away.
- **Native & Lightweight**: Built on native Node.js for maximum speed and minimal overhead.

---

## 🚀 Quick Start

1. **Initialize a new project:**
   ```bash
   npx create-zerra-app my-zerra-app
   ```
2. **Follow the interactive prompts** to choose your database (SQL, MongoDB, Supabase, or Firebase).
3. **Run your server:**
   ```bash
   cd my-zerra-app
   npm install
   npm run dev
   ```

---

## 📁 Project Structure (Generated App)

```text
/api            → Your route handlers (hello.js -> /hello)
/services       → Your business logic (DB clients, loggers, etc.)
/config         → Database & system configuration
server.js       → The Zerra core runtime
```

## 🛠️ How Routing Works

Zerra automatically maps files in the `/api` directory to routes. 

**Example:**
Create a file at `api/greet.js`:

```javascript
module.exports = (req, res) => {
  res.end("Hello from Zerra! 🚀");
};
```

Access it at: `GET http://localhost:3000/greet`

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
   zerra-init my-test-app
   ```

### Project Roadmap
- [ ] TypeScript Support
- [ ] Dynamic Routing (e.g., `[id].js`)
- [ ] Middleware System
- [ ] Automatic API Documentation (Swagger)

---

## ⚖️ License

MIT © [NIHAL BASANIWAL](https://github.com/nb2912)
