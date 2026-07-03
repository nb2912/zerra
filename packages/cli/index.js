#!/usr/bin/env node

const { Command } = require("commander");
const fs = require("fs-extra");
const path = require("path");
const http = require("http");

const program = new Command();

function findUp(filename, dir = process.cwd()) {
  const filePath = path.join(dir, filename);
  if (fs.existsSync(filePath)) return filePath;
  const parentDir = path.dirname(dir);
  if (parentDir === dir) return null;
  return findUp(filename, parentDir);
}

// ─── Generate command (unchanged) ───
program
  .command("generate <type> <name>")
  .description("Scaffold a new route, middleware, job, guard, or transform")
  .action((type, name) => {
    const projectRoot = findUp("zerra.config.json") ? path.dirname(findUp("zerra.config.json")) : (findUp("package.json") ? path.dirname(findUp("package.json")) : process.cwd());
    const isTs = !!findUp("tsconfig.json");
    const ext = isTs ? "ts" : "js";
    let targetPath = "";
    let template = "";

    if (type === "route") {
      targetPath = path.join(projectRoot, "api", `${name}.${ext}`);
      template = isTs 
        ? `import { json } from "zerra";\n\nexport const GET = async (ctx: any) => {\n  return json({ message: "Hello from ${name}" });\n};\n`
        : `import { json } from "zerra";\n\nexport const GET = async (ctx) => {\n  return json({ message: "Hello from ${name}" });\n};\n`;
    } else if (type === "middleware") {
      targetPath = path.join(projectRoot, "api", name, `_middleware.${ext}`);
      template = isTs
        ? `export default async (req: any, res: any, next: Function) => {\n  // Middleware logic\n  await next();\n};\n`
        : `export default async (req, res, next) => {\n  // Middleware logic\n  await next();\n};\n`;
    } else if (type === "job") {
      targetPath = path.join(projectRoot, "jobs", `${name}.${ext}`);
      template = `export const schedule = "0 0 * * *"; // Midnight every day\nexport const task = async () => {\n  console.log("Job ${name} running...");\n};\n`;
    } else if (type === "guard") {
      targetPath = path.join(projectRoot, "api", name, `_guard.${ext}`);
      template = `// Declarative Route Guard\nexport default {\n  require: "auth",\n  // roles: ["admin"],\n  // methods: ["GET"],\n  // check: (req) => req.user.plan === "pro",\n  // message: "Custom denial message"\n};\n`;
    } else if (type === "transform") {
      targetPath = path.join(projectRoot, "api", name, `_transform.${ext}`);
      template = isTs
        ? `// Response Transformer\nexport default (data: any, req: any, res: any) => {\n  return { success: res.statusCode < 400, data, timestamp: Date.now() };\n};\n`
        : `// Response Transformer\nexport default (data, req, res) => {\n  return { success: res.statusCode < 400, data, timestamp: Date.now() };\n};\n`;
    } else {
      console.error(`❌ Unknown type '${type}'. Use 'route', 'middleware', 'job', 'guard', or 'transform'.`);
      return;
    }

    fs.ensureDirSync(path.dirname(targetPath));
    if (fs.existsSync(targetPath)) {
      console.error(`❌ File already exists at ${targetPath}`);
      return;
    }
    fs.writeFileSync(targetPath, template);
    console.log(`✅ Generated ${type} at ${targetPath}`);
  });

// ─── Add command (Database / Auth injection) ───
program
  .command("add <feature>")
  .description("Add or switch a module (database, auth) in an existing project")
  .action(async (feature) => {
    const projectRoot = findUp("zerra.config.json") ? path.dirname(findUp("zerra.config.json")) : (findUp("package.json") ? path.dirname(findUp("package.json")) : process.cwd());
    const isTs = !!findUp("tsconfig.json", projectRoot);

    if (feature === "database") {
      const inquirer = require("inquirer");
      const { dbType } = await inquirer.prompt([
        { type: "list", name: "dbType", message: "Select the database to add/switch to:", choices: [
          { name: "SQL (Postgres/MySQL)", value: "js-sql" },
          { name: "MongoDB", value: "js-mongo" },
          { name: "Supabase", value: "js-supabase" },
          { name: "Firebase", value: "js-firebase" }
        ]}
      ]);

      const dbTemplatePath = path.join(__dirname, "templates", dbType);
      if (!fs.existsSync(dbTemplatePath)) {
        console.error("❌ Template not found.");
        return;
      }

      console.log(`\n📦 Injecting ${dbType} integration...`);
      await fs.copy(dbTemplatePath, projectRoot, {
        overwrite: true,
        filter: (src) => !src.endsWith("package.json"),
      });

      const dbPkgPath = path.join(dbTemplatePath, "package.json");
      const targetPkgPath = path.join(projectRoot, "package.json");
      if (fs.existsSync(dbPkgPath) && fs.existsSync(targetPkgPath)) {
        const basePkg = await fs.readJson(targetPkgPath);
        const dbPkg = await fs.readJson(dbPkgPath);
        basePkg.dependencies = { ...(basePkg.dependencies || {}), ...(dbPkg.dependencies || {}) };
        await fs.writeJson(targetPkgPath, basePkg, { spaces: 2 });
      }

      // Convert newly added files to TS if project is TS
      if (isTs) {
        const servicesDir = path.join(projectRoot, "services");
        if (fs.existsSync(servicesDir)) {
          const files = await fs.readdir(servicesDir);
          for (const file of files) {
            if (file.endsWith(".js")) {
              await fs.move(path.join(servicesDir, file), path.join(servicesDir, file.replace(/\.js$/, ".ts")), { overwrite: true });
            }
          }
        }
      }

      console.log(`✅ Database successfully added/updated!`);
      console.log(`👉 Don't forget to run 'npm install' to install the new database drivers.`);
      
    } else if (feature === "auth") {
      const authTemplatePath = path.join(__dirname, "templates", "js-auth");
      console.log(`\n🔐 Injecting Auth Starter...`);
      await fs.copy(authTemplatePath, projectRoot, { overwrite: true, filter: (src) => !src.endsWith("package.json") });
      
      const authPkgPath = path.join(authTemplatePath, "package.json");
      const targetPkgPath = path.join(projectRoot, "package.json");
      if (fs.existsSync(authPkgPath) && fs.existsSync(targetPkgPath)) {
        const basePkg = await fs.readJson(targetPkgPath);
        const authPkg = await fs.readJson(authPkgPath);
        basePkg.dependencies = { ...(basePkg.dependencies || {}), ...(authPkg.dependencies || {}) };
        await fs.writeJson(targetPkgPath, basePkg, { spaces: 2 });
      }

      if (isTs) {
        const authApiDir = path.join(projectRoot, "api", "auth");
        const configDir = path.join(projectRoot, "config");
        const convertToTs = async (dir) => {
          if (fs.existsSync(dir)) {
            const files = await fs.readdir(dir);
            for (const file of files) {
              if (file.endsWith(".js")) await fs.move(path.join(dir, file), path.join(dir, file.replace(/\.js$/, ".ts")), { overwrite: true });
            }
          }
        };
        await convertToTs(authApiDir);
        await convertToTs(configDir);
      }

      console.log(`✅ Auth starter successfully added!`);
      console.log(`👉 Don't forget to run 'npm install' to install auth dependencies (jsonwebtoken, bcrypt).`);
    } else {
      console.error(`❌ Unknown feature '${feature}'. Use 'database' or 'auth'.`);
    }
  });

// ─── Open browser helper ───
async function openBrowser(url) {
  const { platform } = process;
  const cmd = platform === 'win32' ? 'start' : platform === 'darwin' ? 'open' : 'xdg-open';
  const { exec } = require("child_process");
  exec(`${cmd} ${url}`);
}

// ─── Project scaffolding logic (extracted from old inquirer flow) ───
async function scaffoldProject(projectName, answers) {
  const targetPath = path.join(process.cwd(), projectName);
  const baseTemplatePath = path.join(__dirname, "templates", "js-base");
  const dbTemplatePath = path.join(__dirname, "templates", answers.database);
  const authTemplatePath = path.join(__dirname, "templates", "js-auth");

  console.log(`\n🏗️  Building your Zerra application...`);

  // 1. Copy the Base Template
  if (fs.existsSync(baseTemplatePath)) {
    await fs.copy(baseTemplatePath, targetPath);
  }

  // 2. Overlay Database-Specific Template
  if (answers.database !== "js-base" && fs.existsSync(dbTemplatePath)) {
    await fs.copy(dbTemplatePath, targetPath, {
      overwrite: true,
      filter: (src) => !src.endsWith("package.json"),
    });

    const dbPkgPath = path.join(dbTemplatePath, "package.json");
    const targetPkgPath = path.join(targetPath, "package.json");

    if (fs.existsSync(dbPkgPath) && fs.existsSync(targetPkgPath)) {
      const basePkg = await fs.readJson(targetPkgPath);
      const dbPkg = await fs.readJson(dbPkgPath);
      basePkg.dependencies = { ...(basePkg.dependencies || {}), ...(dbPkg.dependencies || {}) };
      basePkg.scripts = { ...(basePkg.scripts || {}), ...(dbPkg.scripts || {}) };
      await fs.writeJson(targetPkgPath, basePkg, { spaces: 2 });
    }
  }

  // 3. Overlay Auth Starter
  if (answers.includeAuth && fs.existsSync(authTemplatePath)) {
    console.log(`   🔐 Adding Auth Starter...`);
    await fs.copy(authTemplatePath, targetPath, {
      overwrite: true,
      filter: (src) => !src.endsWith("package.json"),
    });

    const authPkgPath = path.join(authTemplatePath, "package.json");
    const targetPkgPath = path.join(targetPath, "package.json");

    if (fs.existsSync(authPkgPath) && fs.existsSync(targetPkgPath)) {
      const basePkg = await fs.readJson(targetPkgPath);
      const authPkg = await fs.readJson(authPkgPath);
      basePkg.dependencies = { ...(basePkg.dependencies || {}), ...(authPkg.dependencies || {}) };
      await fs.writeJson(targetPkgPath, basePkg, { spaces: 2 });
    }
  }

  // 4. Customize project name in package.json
  const pkgPath = path.join(targetPath, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    pkg.name = projectName;

    if (answers.language === 'ts') {
      pkg.devDependencies = {
        ...(pkg.devDependencies || {}),
        "typescript": "^5.0.0",
        "@types/node": "^20.0.0",
        "tsx": "^4.0.0"
      };
      pkg.scripts = {
        ...(pkg.scripts || {}),
        "dev": "tsx watch server.js",
        "build": "tsc",
        "start": "node server.js"
      };
    }
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  }

  // 5. Handle TypeScript
  if (answers.language === 'ts') {
    console.log(`   🔷 TypeScript-ifying your project...`);
    const tsconfig = {
      compilerOptions: {
        target: "ESNext", module: "CommonJS", moduleResolution: "node",
        esModuleInterop: true, forceConsistentCasingInFileNames: true,
        strict: true, skipLibCheck: true, outDir: "./dist"
      },
      include: ["api/**/*", "services/**/*", "server.js", "zerra.config.json"]
    };
    await fs.writeJson(path.join(targetPath, "tsconfig.json"), tsconfig, { spaces: 2 });

    const renameJsToTs = async (dir) => {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) { await renameJsToTs(fullPath); }
        else if (file.endsWith(".js") && !file.startsWith("server.js")) {
          await fs.move(fullPath, fullPath.replace(/\.js$/, ".ts"));
        }
      }
    };
    if (fs.existsSync(path.join(targetPath, "api"))) await renameJsToTs(path.join(targetPath, "api"));
    if (fs.existsSync(path.join(targetPath, "services"))) await renameJsToTs(path.join(targetPath, "services"));
  }

  // 6. Generate zerra.config.json
  const allFeatureKeys = ['logging','dynamicRouting','middleware','dotenv','validation','multipart','errors','dashboard','static','rateLimiting','cron','guards','transforms'];
  const featureConfig = {};
  allFeatureKeys.forEach(k => { featureConfig[k] = answers.features.includes(k); });
  await fs.writeJson(path.join(targetPath, 'zerra.config.json'), { features: featureConfig, plugins: [] }, { spaces: 2 });

  // 7. Generate .gitignore
  const gitignoreContent = `node_modules/\ndist/\nbuild/\n.env\n.env.local\n.env.*.local\n*.log\n.DS_Store\n${answers.language === 'ts' ? '*.tsbuildinfo' : ''}\n`;
  await fs.writeFile(path.join(targetPath, '.gitignore'), gitignoreContent);

  const { execSync } = require("child_process");

  if (answers.installDeps) {
    console.log(`\n📦 Installing dependencies...`);
    try { execSync("npm install", { cwd: targetPath, stdio: "inherit" }); }
    catch (e) { console.warn(`⚠️  Failed to install deps. Run 'npm install' manually.`); }
  }

  if (answers.initGit) {
    try {
      execSync("git init", { cwd: targetPath, stdio: "ignore" });
      execSync("git add .", { cwd: targetPath, stdio: "ignore" });
      execSync('git commit -m "Initial commit from create-zerra-app"', { cwd: targetPath, stdio: "ignore" });
      console.log(`🌱 Initialized a git repository.`);
    } catch (e) { /* ignore git errors */ }
  }

  console.log(`\n🚀 Zerra project created successfully at ${targetPath}`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${projectName}`);
  if (!answers.installDeps) console.log(`  npm install`);
  console.log(`  npm run dev\n`);
}

// ─── Create command — Visual Wizard ───
program
  .command("create <project-name>", { isDefault: true })
  .description("Create a new Zerra project")
  .option("--no-browser", "Use terminal prompts instead of the visual wizard")
  .action(async (projectName, opts) => {

    // ─── Fallback: terminal mode ───
    if (opts.browser === false) {
      const inquirer = require("inquirer");
      const answers = await inquirer.prompt([
        { type: "list", name: "database", message: "Database?", choices: [
          { name: "None", value: "js-base" }, { name: "SQL", value: "js-sql" },
          { name: "MongoDB", value: "js-mongo" }, { name: "Supabase", value: "js-supabase" },
          { name: "Firebase", value: "js-firebase" }
        ]},
        { type: "list", name: "language", message: "Language?", choices: [
          { name: "JavaScript", value: "js" }, { name: "TypeScript", value: "ts" }
        ]},
        { type: "confirm", name: "includeAuth", message: "Include Auth?", default: true },
        { type: "checkbox", name: "features", message: "Features:", choices: [
          { name: "Logging", value: "logging", checked: true },
          { name: "Dynamic Routing", value: "dynamicRouting", checked: true },
          { name: "Middleware", value: "middleware", checked: true },
          { name: "Dotenv", value: "dotenv", checked: true },
          { name: "Validation", value: "validation", checked: true },
          { name: "File Uploads", value: "multipart", checked: true },
          { name: "Error Handling", value: "errors", checked: true },
          { name: "Dev Dashboard", value: "dashboard", checked: true },
          { name: "Static Files", value: "static", checked: true },
          { name: "Rate Limiting", value: "rateLimiting", checked: false },
          { name: "Cron Jobs", value: "cron", checked: true },
          { name: "Guards", value: "guards", checked: true },
          { name: "Transforms", value: "transforms", checked: true },
        ]},
        { type: "confirm", name: "installDeps", message: "Install dependencies?", default: true },
        { type: "confirm", name: "initGit", message: "Initialize git?", default: true },
      ]);
      await scaffoldProject(projectName, answers);
      return;
    }

    // ─── Visual Wizard mode ───
    const WIZARD_PORT = 9898;
    const wizardHtmlPath = path.join(__dirname, "wizard", "index.html");

    if (!fs.existsSync(wizardHtmlPath)) {
      console.error("❌ Wizard UI not found. Falling back to terminal mode.");
      opts.browser = false;
      program.parse();
      return;
    }

    console.log(`\n  ⚡ \x1b[1m\x1b[35mZerra Setup Wizard\x1b[0m\n`);
    console.log(`  Opening visual configurator in your browser...`);
    console.log(`  \x1b[2mIf it doesn't open, visit: \x1b[4mhttp://localhost:${WIZARD_PORT}\x1b[0m\n`);
    console.log(`  \x1b[2mWaiting for configuration...\x1b[0m\n`);

    const wizardHtml = fs.readFileSync(wizardHtmlPath, "utf-8");

    const server = http.createServer((req, res) => {
      // Serve the wizard UI
      if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/?") || req.url.startsWith("/?name="))) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(wizardHtml);
        return;
      }

      // Handle the config submission from the wizard
      if (req.method === "POST" && req.url === "/api/create") {
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", async () => {
          try {
            const config = JSON.parse(body);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true }));

            // Close the server immediately
            server.close();

            console.log(`  ✅ Configuration received from wizard!\n`);

            // Scaffold the project
            await scaffoldProject(projectName, config);

            process.exit(0);
          } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end("Not found");
    });

    server.listen(WIZARD_PORT, () => {
      openBrowser(`http://localhost:${WIZARD_PORT}/?name=${encodeURIComponent(projectName)}`);
    });

    // Graceful shutdown on Ctrl+C
    process.on("SIGINT", () => { server.close(); process.exit(0); });
  });

program.parse();
