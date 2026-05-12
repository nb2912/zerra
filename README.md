<div align="center">

  # Zerra
  **Backend. Perfected.**
  
  [![npm version](https://img.shields.io/npm/v/create-zerra-app.svg?style=flat-square)](https://www.npmjs.com/package/create-zerra-app)
  [![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-emerald.svg?style=flat-square)](http://makeapullrequest.com)
  
  <p align="center">
    <b>The CLI-first backend framework built for speed and developer joy.</b><br />
    Zero-config, fully type-safe, and natively powered by a file-based routing engine.
  </p>

  [Documentation](https://zerra.dev/docs) • [Showcase](https://zerra.dev/showcase) • [Benchmarks](https://zerra.dev/benchmarks)
</div>

---

## ⚡ Why Zerra?

Zerra is designed to be the backend equivalent of Next.js—offering the same "it just works" experience for your APIs.

- **🚀 Performance**: Sub-50ms cold starts. The fastest in the Node.js ecosystem.
- **📁 File-based Routing**: No more `router.get()` spaghetti. Your folder structure *is* your API.
- **🛡️ Type-Safe**: Zero-config TypeScript support with automatic type generation.
- **💻 Dev Console**: A built-in terminal and playground at `/__zerra` to test and debug in real-time.
- **📦 Zero Config**: Start building immediately. Everything you need is built-in, not bolted on.

---

## 🚀 Quick Start

Get a production-ready API running in seconds:

```bash
npx create-zerra-app@latest my-api
```

Follow the interactive prompts to choose your database (SQL, MongoDB, Supabase, or Firebase) and advanced features.

```bash
cd my-api
npm run dev
```

---

## 🛠️ The Experience

### 1. File-based Routing
Folders become paths, files become endpoints.

```javascript
// api/users/[id].js
export default async (req, res) => {
  const { id } = req.params;
  res.json({ userId: id });
};
```

### 2. Automatic Validation
Export a `schema` and let Zerra handle the boring parts.

```javascript
export default async (req, res) => {
  res.json({ saved: req.body });
};

export const schema = {
  email: 'string',
  age: 'number'
};
```

### 3. Middleware Reinvented
Drop a `_middleware.js` anywhere to protect entire route trees.

```javascript
// api/admin/_middleware.js
export default async (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).end();
  await next(); 
};
```

---

## 📊 Benchmarks

Zerra is engineered for extreme throughput. In raw requests-per-second, Zerra consistently outperforms traditional frameworks by staying close to the metal.

| Framework | Requests/sec | Latency |
| :--- | :--- | :--- |
| **Zerra (Native)** | **84,500** | **1.2ms** |
| Fastify | 78,200 | 1.4ms |
| Express | 18,400 | 8.5ms |

---

## 📁 Project Structure

A Zerra app is lean and easy to understand:

```text
/api                → Route handlers & middlewares
/services           → Business logic & DB clients
zerra.config.json   → Feature toggles
.env                → Environment variables
```

---

## 🤝 Contributing

Zerra is a community-driven project. We love PRs!

1. Clone: `git clone https://github.com/nb2912/zerra.git`
2. Install: `npm install`
3. Link CLI: `cd packages/cli && npm link`

---

## ⚖️ License

MIT © [NIHAL BASANIWAL](https://github.com/nb2912)
