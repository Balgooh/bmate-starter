#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = process.argv.slice(2);
const targetName = argv[0] || "my-app";
const targetDir = path.resolve(process.cwd(), targetName);

const templateDir = path.join(__dirname, "template");

if (!fs.existsSync(templateDir)) {
  console.error("Template mappa nem található:", templateDir);
  process.exit(1);
}

if (fs.existsSync(targetDir)) {
  console.error("Már létezik ilyen mappa:", targetDir);
  process.exit(1);
}

try {
  fs.cpSync(templateDir, targetDir, { recursive: true });
  console.log(`Projekt létrehozva: ${targetDir}`);
  console.log("Telepítsd a függőségeket:");
  console.log(`  cd ${targetName} && npm install`);
} catch (err) {
  console.error("Hiba másolás közben:", err);
  process.exit(1);
}
