# 🚀 Zerra

**The CLI-first backend generator and runtime engine.**

Zerra is designed to be the backend equivalent of Next.js—offering zero configuration, instant setup, and file-based routing.

## ✨ Features

- **Zero Config**: Start building immediately without complex setups.
- **File-based Routing**: Folders and files in `/api` automatically become your API endpoints.
- **CLI-First**: Scaffolding your next backend project is just one command away.
- **Native & Lightweight**: Built on native Node.js for maximum speed and minimal overhead.

## 📦 Installation

```bash
npm install -g create-zerra-app
```

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

## 📁 Project Structure

```text
/api            → Your route handlers (hello.js -> /hello)
/services       → Your business logic
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

## ⚖️ License

MIT © [NIHAL DASANIWAL](https://github.com/nb2912)
