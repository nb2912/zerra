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
        name: "installDeps",
        message: "Would you like to install dependencies automatically?",
        default: true,
      },
      {
        type: "confirm",
        name: "initGit",
        message: "Would you like to initialize a new git repository?",
        default: true,
      }
    ]);

    const baseTemplatePath = path.join(__dirname, "templates", "js-base");
    const dbTemplatePath = path.join(__dirname, "templates", answers.database);

    console.log(`\n🏗️  Generating Zerra project: ${projectName}...`);

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

      // 3. Customize project name in package.json
      const pkgPath = path.join(targetPath, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        pkg.name = projectName;
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      }

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
