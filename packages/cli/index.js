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

    // 1. Ask for Database Preference
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
    ]);

    const templatePath = path.join(__dirname, "templates", answers.database);

    console.log(`\n🏗️  Generating Zerra project: ${projectName}...`);

    try {
      if (!fs.existsSync(templatePath)) {
        // Fallback to base if specific template isn't ready yet
        console.warn(`⚠️  Template ${answers.database} not found, falling back to base.`);
        await fs.copy(path.join(__dirname, "templates", "js-base"), targetPath);
      } else {
        await fs.copy(templatePath, targetPath);
      }

      console.log(`🚀 Zerra project created at ${targetPath}`);
      console.log(`\nNext steps:`);
      console.log(`  cd ${projectName}`);
      console.log(`  npm install`);
      console.log(`  npm run dev\n`);
    } catch (err) {
      console.error("❌ Error creating project:", err);
    }
  });

program.parse();
