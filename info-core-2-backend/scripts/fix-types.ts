// Fix script to replace all req.params.id with req.params.id! and err.errors with err.issues
// Run with: node --loader tsx scripts/fix-types.ts

import * as fs from "fs";
import * as path from "path";

const controllersDir = path.join(__dirname, "..", "src", "controllers");
const libDir = path.join(__dirname, "..", "lib");

const fixes = [
  // Fix req.params.id
  { from: /parseInt\(req\.params\.id\)/g, to: "parseInt(req.params.id!)" },
  // Fix err.errors to err.issues
  { from: /err\.errors/g, to: "err.issues" },
];

function fixFile(filePath: string) {
  let content = fs.readFileSync(filePath, "utf-8");
  let changed = false;

  fixes.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✓ Fixed: ${path.basename(filePath)}`);
  }
}

function fixDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (file.endsWith(".controller.ts")) {
      fixFile(path.join(dir, file));
    }
  });
}

console.log("Fixing TypeScript errors...");
fixDirectory(controllersDir);
console.log("Done!");
