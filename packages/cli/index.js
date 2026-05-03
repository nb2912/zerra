#!/usr/bin/env node

const { Command } = require("commander");
const fs = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");

const program = new Command();

program
  .argument("<project-name>")
  .action(async (projectName) => {
    const targetPath = path.join(process.cwd(), projectName);

    // 1. Ask for Database Preference and CLI features
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "database",
        message: "Which database would you like to use?",
        choices: [
          { name: "None (Simple API)", value: "js-base" },
          { name: "SQL (PostgreSQL/MySQL)", value: "js-sql" },
          { name: "MongoDB", value: "js-mongo" },
          { name: "Supabase", value: "js-supabase" },
          { name: "Firebase", value: "js-firebase" },
        ],
      },
      {
        type: "confirm",
        name: "includeAuth",
        message: "Include Authentication Starter (JWT + Bcrypt)?",
        default: true,
      },
      {
        type: "checkbox",
        name: "features",
        message: "Select advanced features to enable:",
        choices: [
          { name: "Beautiful Request Logging", value: "logging", checked: true },
          { name: "Dynamic Routing ([id].js)", value: "dynamicRouting", checked: true },
          { name: "File-Based Middleware (_middleware.js)", value: "middleware", checked: true },
          { name: "Auto-load Environment Variables (.env)", value: "dotenv", checked: true },
          { name: "Automatic Input Validation (Schema)", value: "validation", checked: true },
          { name: "Multipart File Uploads (req.files)", value: "multipart", checked: true },
          { name: "Smart Error Handling (_error.js)", value: "errors", checked: true },
          { name: "Dev Dashboard (/__zerra)", value: "dashboard", checked: true }
        ]
      },
      {
        type: "confirm",
        name: "installDeps",
        message: "Install dependencies automatically?",
        default: true,
      },
      {
        type: "confirm",
        name: "initGit",
        message: "Initialize git repository?",
        default: true,
      }
    ]);

    // 2. Project Preview Summary
    console.log(`\n📋  Project Configuration:`);
    console.log(`   - Project Name: \x1b[36m${projectName}\x1b[0m`);
    console.log(`   - Database:     \x1b[33m${answers.database.replace('js-', '')}\x1b[0m`);
    console.log(`   - Auth Starter: \x1b[32m${answers.includeAuth ? 'Enabled' : 'Disabled'}\x1b[0m`);
    console.log(`   - Features:     \x1b[35m${answers.features.join(', ') || 'None'}\x1b[0m`);
    console.log(`   - Auto-Install: \x1b[32m${answers.installDeps ? 'Yes' : 'No'}\x1b[0m`);
    console.log(`   - Git Init:     \x1b[32m${answers.initGit ? 'Yes' : 'No'}\x1b[0m`);

    const { confirmProceed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmProceed",
        message: "Does this look correct?",
        default: true,
      }
    ]);

    if (!confirmProceed) {
      console.log("\n❌  Project creation cancelled.\n");
      return;
    }

    const baseTemplatePath = path.join(__dirname, "templates", "js-base");
    const dbTemplatePath = path.join(__dirname, "templates", answers.database);
    const authTemplatePath = path.join(__dirname, "templates", "js-auth");

    console.log(`\n🏗️  Building your Zerra application...`);

    try {
      // 1. Copy the Base Template (Foundation)
      if (fs.existsSync(baseTemplatePath)) {
        await fs.copy(baseTemplatePath, targetPath);
      }

      // 2. Overlay Database-Specific Template (if not base)
      if (answers.database !== "js-base" && fs.existsSync(dbTemplatePath)) {
        // We use a custom copy to handle package.json merging
        await fs.copy(dbTemplatePath, targetPath, {
          overwrite: true,
          filter: (src) => !src.endsWith("package.json"), // Handle package.json separately
        });

        const dbPkgPath = path.join(dbTemplatePath, "package.json");
        const targetPkgPath = path.join(targetPath, "package.json");

        if (fs.existsSync(dbPkgPath) && fs.existsSync(targetPkgPath)) {
          const basePkg = await fs.readJson(targetPkgPath);
          const dbPkg = await fs.readJson(dbPkgPath);

          // Merge dependencies and scripts
          basePkg.dependencies = { ...(basePkg.dependencies || {}), ...(dbPkg.dependencies || {}) };
          basePkg.scripts = { ...(basePkg.scripts || {}), ...(dbPkg.scripts || {}) };

          await fs.writeJson(targetPkgPath, basePkg, { spaces: 2 });
        }
      }

        }
      }

      // 2.5 Overlay Auth Starter (if selected)
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

      // 3. Customize project name in package.json
      const pkgPath = path.join(targetPath, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        pkg.name = projectName;
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      }

      // 4. Generate zerra.config.json based on feature selection
      const featureConfig = {
        logging: answers.features.includes('logging'),
        dynamicRouting: answers.features.includes('dynamicRouting'),
        middleware: answers.features.includes('middleware'),
        dotenv: answers.features.includes('dotenv'),
        validation: answers.features.includes('validation'),
        multipart: answers.features.includes('multipart'),
        errors: answers.features.includes('errors'),
        dashboard: answers.features.includes('dashboard')
      };
      
      const configJsonPath = path.join(targetPath, 'zerra.config.json');
      await fs.writeJson(configJsonPath, { features: featureConfig, plugins: [] }, { spaces: 2 });

      const { execSync } = require("child_process");
      
      if (answers.installDeps) {
        console.log(`\n📦 Installing dependencies...`);
        try {
          execSync("npm install", { cwd: targetPath, stdio: "inherit" });
        } catch (installErr) {
          console.warn(`⚠️  Failed to install dependencies automatically. You may need to run 'npm install' manually.`);
        }
      }

      if (answers.initGit) {
        try {
          execSync("git init", { cwd: targetPath, stdio: "ignore" });
          execSync("git add .", { cwd: targetPath, stdio: "ignore" });
          execSync('git commit -m "Initial commit from create-zerra-app"', { cwd: targetPath, stdio: "ignore" });
          console.log(`🌱 Initialized a git repository.`);
        } catch (gitErr) {
          // Ignore git errors
        }
      }

      console.log(`\n🚀 Zerra project created successfully at ${targetPath}`);
      console.log(`\nNext steps:`);
      console.log(`  cd ${projectName}`);
      if (!answers.installDeps) {
        console.log(`  npm install`);
      }
      console.log(`  npm run dev\n`);
    } catch (err) {
      console.error("❌ Error creating project:", err);
    }
  });

program.parse();
