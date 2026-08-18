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
      console.error(`✖ Unknown type '${type}'. Use 'route', 'middleware', 'job', 'guard', or 'transform'.`);
      return;
    }

    fs.ensureDirSync(path.dirname(targetPath));
    if (fs.existsSync(targetPath)) {
      console.error(`✖ File already exists at ${targetPath}`);
      return;
    }
    fs.writeFileSync(targetPath, template);
    console.log(`✔ Generated ${type} at ${targetPath}`);
  });

// ─── Add command (Database / Auth injection) ───
program
  .command("add <feature>")
  .description("Add or switch a module (database, auth, storage) in an existing project")
  .action(async (feature) => {
    const projectRoot = findUp("zerra.config.json") ? path.dirname(findUp("zerra.config.json")) : (findUp("package.json") ? path.dirname(findUp("package.json")) : process.cwd());
    const isTs = !!findUp("tsconfig.json", projectRoot);

    if (feature === "database") {
      const inquirer = require("inquirer");
      const { dbType } = await inquirer.prompt([
        { type: "list", name: "dbType", message: "Select the database to add/switch to:", choices: [
          { name: "SQL (Postgres/MySQL)", value: "js-sql" },
          { name: "MongoDB", value: "js-mongo" },
          { name: "DynamoDB (AWS)", value: "js-dynamodb" },
          { name: "Supabase", value: "js-supabase" },
          { name: "Firebase", value: "js-firebase" }
        ]}
      ]);

      const dbTemplatePath = path.join(__dirname, "templates", dbType);
      if (!fs.existsSync(dbTemplatePath)) {
        console.error("✖ Template not found.");
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

      console.log(`✔ Database successfully added/updated!`);
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

      console.log(`✔ Auth starter successfully added!`);
      console.log(`👉 Don't forget to run 'npm install' to install auth dependencies (jsonwebtoken, bcrypt).`);

    } else if (feature === "storage") {
      const s3TemplatePath = path.join(__dirname, "templates", "js-s3");
      console.log(`\n☁️  Injecting AWS S3 Storage integration...`);
      await fs.copy(s3TemplatePath, projectRoot, { overwrite: true, filter: (src) => !src.endsWith("package.json") });

      const s3PkgPath = path.join(s3TemplatePath, "package.json");
      const targetPkgPath = path.join(projectRoot, "package.json");
      if (fs.existsSync(s3PkgPath) && fs.existsSync(targetPkgPath)) {
        const basePkg = await fs.readJson(targetPkgPath);
        const s3Pkg = await fs.readJson(s3PkgPath);
        basePkg.dependencies = { ...(basePkg.dependencies || {}), ...(s3Pkg.dependencies || {}) };
        await fs.writeJson(targetPkgPath, basePkg, { spaces: 2 });
      }

      // Auto-enable multipart feature in zerra.config.json (required for file uploads)
      const configPath = path.join(projectRoot, "zerra.config.json");
      if (fs.existsSync(configPath)) {
        try {
          const config = await fs.readJson(configPath);
          if (config.features && !config.features.multipart) {
            config.features.multipart = true;
            await fs.writeJson(configPath, config, { spaces: 2 });
            console.log(`   ✔ Auto-enabled 'multipart' feature in zerra.config.json`);
          }
        } catch (e) {}
      }

      if (isTs) {
        const convertToTs = async (dir) => {
          if (fs.existsSync(dir)) {
            const files = await fs.readdir(dir);
            for (const file of files) {
              if (file.endsWith(".js")) await fs.move(path.join(dir, file), path.join(dir, file.replace(/\.js$/, ".ts")), { overwrite: true });
            }
          }
        };
        await convertToTs(path.join(projectRoot, "services"));
        await convertToTs(path.join(projectRoot, "api"));
      }

      // Inject .env hints
      const envPath = path.join(projectRoot, ".env");
      const envHints = [
        '', '# ─── AWS S3 Storage ───',
        'AWS_REGION=us-east-1',
        'AWS_ACCESS_KEY_ID=',
        'AWS_SECRET_ACCESS_KEY=',
        'S3_BUCKET=',
        'S3_PREFIX=uploads/',
      ].join('\n');
      if (fs.existsSync(envPath)) {
        const existing = fs.readFileSync(envPath, 'utf8');
        if (!existing.includes('S3_BUCKET')) {
          fs.appendFileSync(envPath, '\n' + envHints + '\n');
          console.log(`   ✔ Appended S3 env variables to .env`);
        }
      } else {
        fs.writeFileSync(envPath, envHints.trim() + '\n');
        console.log(`   ✔ Created .env with S3 configuration`);
      }

      console.log(`\n✔ AWS S3 Storage successfully added!`);
      console.log(`   📂 services/storage.js — S3 client with upload/presign/delete`);
      console.log(`   📂 api/upload.js       — File upload & download endpoints`);
      console.log(`   📂 api/presign.js      — Direct browser-to-S3 upload URLs`);
      console.log(`\n👉 Next steps:`);
      console.log(`   1. Run 'npm install' to install the AWS SDK`);
      console.log(`   2. Set your S3_BUCKET and AWS credentials in .env`);
      console.log(`   3. POST a file to /upload to test it!\n`);

    } else {
      console.error(`✖ Unknown feature '${feature}'. Use 'database', 'auth', or 'storage'.`);
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

  // 3b. Overlay S3 Storage
  if (answers.includeStorage) {
    const s3TemplatePath = path.join(__dirname, "templates", "js-s3");
    if (fs.existsSync(s3TemplatePath)) {
      console.log(`   ☁️  Adding AWS S3 Storage...`);
      await fs.copy(s3TemplatePath, targetPath, {
        overwrite: true,
        filter: (src) => !src.endsWith("package.json"),
      });

      const s3PkgPath = path.join(s3TemplatePath, "package.json");
      const targetPkgPath = path.join(targetPath, "package.json");

      if (fs.existsSync(s3PkgPath) && fs.existsSync(targetPkgPath)) {
        const basePkg = await fs.readJson(targetPkgPath);
        const s3Pkg = await fs.readJson(s3PkgPath);
        basePkg.dependencies = { ...(basePkg.dependencies || {}), ...(s3Pkg.dependencies || {}) };
        await fs.writeJson(targetPkgPath, basePkg, { spaces: 2 });
      }

      // Create .env with S3 hints
      const envPath = path.join(targetPath, ".env");
      const envHints = '# ─── AWS S3 Storage ───\nAWS_REGION=us-east-1\nAWS_ACCESS_KEY_ID=\nAWS_SECRET_ACCESS_KEY=\nS3_BUCKET=\nS3_PREFIX=uploads/\n';
      if (fs.existsSync(envPath)) {
        const existing = fs.readFileSync(envPath, 'utf8');
        if (!existing.includes('S3_BUCKET')) {
          fs.appendFileSync(envPath, '\n' + envHints);
        }
      } else {
        fs.writeFileSync(envPath, envHints);
      }
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
  // Auto-enable multipart if S3 storage is included
  if (answers.includeStorage && !featureConfig.multipart) {
    featureConfig.multipart = true;
  }
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
          { name: "MongoDB", value: "js-mongo" }, { name: "DynamoDB (AWS)", value: "js-dynamodb" },
          { name: "Supabase", value: "js-supabase" },
          { name: "Firebase", value: "js-firebase" }
        ]},
        { type: "list", name: "language", message: "Language?", choices: [
          { name: "JavaScript", value: "js" }, { name: "TypeScript", value: "ts" }
        ]},
        { type: "confirm", name: "includeAuth", message: "Include Auth?", default: true },
        { type: "confirm", name: "includeStorage", message: "Include AWS S3 Storage?", default: false },
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
      console.error("✖ Wizard UI not found. Falling back to terminal mode.");
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

            console.log(`  ✔ Configuration received from wizard!\n`);

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

// ─── Deploy command — AWS Lambda + API Gateway ───
program
  .command("deploy")
  .description("Deploy your Zerra app to AWS Lambda + API Gateway")
  .option("--init", "Generate deployment config files without deploying")
  .option("--stack-name <name>", "CloudFormation stack name")
  .option("--region <region>", "AWS region", "us-east-1")
  .option("--stage <stage>", "Deployment stage", "prod")
  .option("--single", "Deploy as a single catch-all Lambda (default)")
  .action(async (opts) => {
    const projectRoot = findUp("zerra.config.json") ? path.dirname(findUp("zerra.config.json")) : (findUp("package.json") ? path.dirname(findUp("package.json")) : process.cwd());
    const pkgPath = path.join(projectRoot, "package.json");
    const pkg = fs.existsSync(pkgPath) ? fs.readJsonSync(pkgPath) : { name: 'zerra-app' };
    const stackName = opts.stackName || pkg.name.replace(/[^a-zA-Z0-9-]/g, '-') || 'zerra-app';
    const region = opts.region;
    const stage = opts.stage;

    // Discover routes for logging
    const apiDir = path.join(projectRoot, 'api');
    const discoverRoutes = (dir, base = '') => {
      let routes = [];
      if (!fs.existsSync(dir)) return routes;
      fs.readdirSync(dir).forEach(file => {
        const fp = path.join(dir, file);
        const stat = fs.statSync(fp);
        if (stat.isDirectory()) {
          routes = routes.concat(discoverRoutes(fp, path.join(base, file)));
        } else if ((file.endsWith('.js') || file.endsWith('.ts')) && !file.startsWith('_')) {
          const route = path.join(base, file).replace(/\\\\/g, '/').replace(/\\.(js|ts)$/, '');
          routes.push('/' + (route === 'index' ? '' : route));
        }
      });
      return routes;
    };

    const routes = discoverRoutes(apiDir);

    // ─── Generate Lambda handler entry point ───
    const handlerContent = `// Auto-generated by 'zerra deploy' — DO NOT EDIT\nconst { createLambdaHandler } = require('zerra-core/lambda');\nexports.handler = createLambdaHandler();\n`;

    // ─── Generate SAM template ───
    const samTemplate = {
      AWSTemplateFormatVersion: '2010-09-09',
      Transform: 'AWS::Serverless-2016-10-31',
      Description: `Zerra App: ${stackName} (deployed via zerra deploy)`,
      Globals: {
        Function: {
          Timeout: 30,
          MemorySize: 256,
          Runtime: 'nodejs20.x',
          Environment: {
            Variables: {
              NODE_ENV: 'production',
              STAGE: stage,
            },
          },
        },
      },
      Resources: {
        ZerraFunction: {
          Type: 'AWS::Serverless::Function',
          Properties: {
            Handler: 'lambda_handler.handler',
            CodeUri: './',
            Description: 'Zerra catch-all Lambda handler',
            Events: {
              CatchAll: {
                Type: 'HttpApi',
                Properties: {
                  Path: '/{proxy+}',
                  Method: 'ANY',
                },
              },
              Root: {
                Type: 'HttpApi',
                Properties: {
                  Path: '/',
                  Method: 'ANY',
                },
              },
            },
            Policies: [
              'AmazonDynamoDBFullAccess',
              'AmazonS3FullAccess',
              'AmazonSSMReadOnlyAccess',
            ],
          },
        },
      },
      Outputs: {
        ApiUrl: {
          Description: 'API Gateway URL',
          Value: { 'Fn::Sub': 'https://${ServerlessHttpApi}.execute-api.${AWS::Region}.amazonaws.com' },
        },
      },
    };

    // ─── Generate samconfig.toml ───
    const samConfig = `# Auto-generated by 'zerra deploy'\nversion = 0.1\n\n[default.deploy.parameters]\nstack_name = "${stackName}"\nregion = "${region}"\ns3_prefix = "${stackName}"\nconfirm_changeset = false\ncapabilities = "CAPABILITY_IAM CAPABILITY_AUTO_EXPAND"\nresolve_s3 = true\n`;

    // ─── Generate .aws-sam ignore ───
    const samIgnore = `# Ignore dev-only files during packaging\nnode_modules/@types\n.git\n.gitignore\npackages/docs\npackages/cli\n*.md\n.env.local\n.env.*.local\ndev.js\n`;

    if (opts.init) {
      // --init mode: just generate files
      console.log(`\n  ⚡ \x1b[1m\x1b[35mZerra Deploy Init\x1b[0m\n`);

      fs.writeFileSync(path.join(projectRoot, 'lambda_handler.js'), handlerContent);
      console.log(`  ✔ Created lambda_handler.js`);

      // Write SAM template as YAML-ish (using JSON for simplicity — SAM accepts JSON)
      fs.writeFileSync(path.join(projectRoot, 'template.json'), JSON.stringify(samTemplate, null, 2));
      console.log(`  ✔ Created template.json (SAM/CloudFormation)`);

      fs.writeFileSync(path.join(projectRoot, 'samconfig.toml'), samConfig);
      console.log(`  ✔ Created samconfig.toml`);

      fs.writeFileSync(path.join(projectRoot, '.samignore'), samIgnore);
      console.log(`  ✔ Created .samignore`);

      console.log(`\n  📋 Discovered ${routes.length} route(s):`);
      routes.forEach(r => console.log(`     ${r}`));

      console.log(`\n  👉 Next steps:`);
      console.log(`     1. Install AWS SAM CLI: https://docs.aws.amazon.com/sam/latest/userguide/install-sam-cli.html`);
      console.log(`     2. Configure AWS credentials: aws configure`);
      console.log(`     3. Run: sam build && sam deploy`);
      console.log(`     Or just run: npx zerra deploy\n`);
      return;
    }

    // ─── Full deploy mode ───
    const { execSync } = require('child_process');

    // Check for SAM CLI
    try {
      execSync('sam --version', { stdio: 'pipe' });
    } catch (e) {
      console.error(`\n  ✖ AWS SAM CLI is not installed.`);
      console.error(`  Install it: https://docs.aws.amazon.com/sam/latest/userguide/install-sam-cli.html`);
      console.error(`  Or run 'npx zerra deploy --init' to generate files for manual deployment.\n`);
      return;
    }

    console.log(`\n  🚀 \x1b[1m\x1b[35mZerra Deploy\x1b[0m`);
    console.log(`  \x1b[2mTarget: AWS Lambda + API Gateway (${region})\x1b[0m\n`);

    // Write deployment files
    fs.writeFileSync(path.join(projectRoot, 'lambda_handler.js'), handlerContent);
    fs.writeFileSync(path.join(projectRoot, 'template.json'), JSON.stringify(samTemplate, null, 2));
    fs.writeFileSync(path.join(projectRoot, 'samconfig.toml'), samConfig);
    fs.writeFileSync(path.join(projectRoot, '.samignore'), samIgnore);

    console.log(`  📋 Deploying ${routes.length} route(s):`);
    routes.forEach(r => console.log(`     ⚡ ${r}`));
    console.log();

    // Build
    console.log(`  📦 Building...`);
    try {
      execSync('sam build --template-file template.json', { cwd: projectRoot, stdio: 'inherit' });
    } catch (e) {
      console.error(`\n  ✖ Build failed. Check the errors above.`);
      return;
    }

    // Deploy
    console.log(`\n  🌍 Deploying to AWS...`);
    try {
      execSync('sam deploy --no-confirm-changeset --no-fail-on-empty-changeset', { cwd: projectRoot, stdio: 'inherit' });
    } catch (e) {
      console.error(`\n  ✖ Deploy failed. Check the errors above.`);
      return;
    }

    // Get the output URL
    try {
      const output = execSync(
        `aws cloudformation describe-stacks --stack-name ${stackName} --region ${region} --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text`,
        { cwd: projectRoot, encoding: 'utf8' }
      ).trim();

      if (output) {
        console.log(`\n  ✅ \x1b[1m\x1b[32mDeployed successfully!\x1b[0m`);
        console.log(`  🌐 API URL: \x1b[4m${output}\x1b[0m\n`);
        routes.forEach(r => console.log(`     ${output}${r}`));
        console.log();
      }
    } catch (e) {
      console.log(`\n  ✅ Deploy completed! Check your AWS Console for the API URL.\n`);
    }
  });

program.parse();
