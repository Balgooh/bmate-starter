#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const result = { template: null, targetName: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--template=")) {
      result.template = a.split("=")[1];
    } else if (a === "--template" || a === "-t") {
      result.template = argv[i + 1];
      i++;
    } else if (!a.startsWith("-") && !result.targetName) {
      result.targetName = a;
    }
  }
  return result;
}

async function askQuestion(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(prompt, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function copyRecursive(src, dest) {
  fs.cpSync(src, dest, { recursive: true });
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const args = parseArgs(rawArgs);

  const defaultTarget = args.targetName || "my-app";

  const templatesRoot = path.join(__dirname, "template");
  if (!fs.existsSync(templatesRoot)) {
    console.error("Template mappa nem található:", templatesRoot);
    process.exit(1);
  }

  const entries = fs.readdirSync(templatesRoot, { withFileTypes: true });
  const templates = entries.filter(e => e.isDirectory()).map(d => d.name);

  if (templates.length === 0) {
    console.error("Nincs egyetlen template mappa sem a template/ alatt.");
    process.exit(1);
  }

  let chosenTemplate = args.template;
  if (chosenTemplate) {
    if (!templates.includes(chosenTemplate)) {
      console.error(`Template '${chosenTemplate}' nem található. Elérhető: ${templates.join(", ")}`);
      process.exit(1);
    }
  } else {
    
    console.log("Választható template-ek:");
    templates.forEach((t, i) => {
      console.log(`  ${i + 1}) ${t}`);
    });

    const numStr = await askQuestion(`Válassz egy számot (1-${templates.length}) [1]: `);
    let idx = 0;
    if (numStr.length > 0) {
      const n = Number(numStr);
      if (!Number.isInteger(n) || n < 1 || n > templates.length) {
        console.error("Érvénytelen szám.");
        process.exit(1);
      }
      idx = n - 1;
    }
    chosenTemplate = templates[idx];
  }

  let targetName = args.targetName;
  if (!targetName) {
    const nameInput = await askQuestion(`Projekt neve [${defaultTarget}]: `);
    targetName = nameInput.length > 0 ? nameInput : defaultTarget;
  }

  const targetDir = path.resolve(process.cwd(), targetName);
  if (fs.existsSync(targetDir)) {
    console.error("Már létezik ilyen mappa:", targetDir);
    process.exit(1);
  }

  const sourceDir = path.join(templatesRoot, chosenTemplate);
  try {
    copyRecursive(sourceDir, targetDir);
    console.log(`Projekt létrehozva: ${targetDir}`);
    console.log("Telepítsd a függőségeket:");
    console.log(`  cd ${targetName} && npm install`);
  } catch (err) {
    console.error("Hiba másolás közben:", err);
    process.exit(1);
  }
}

main();
