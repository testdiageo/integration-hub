import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const serverDir = path.resolve("server");

// Get all .ts and .js files recursively from /server
function getAllFiles(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) results = results.concat(getAllFiles(fullPath));
    else if (file.endsWith(".ts") || file.endsWith(".js")) results.push(fullPath);
  }
  return results;
}

// Extract import/require paths
function extractImports(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const matches = [
    ...code.matchAll(/from\s+["']([^"']+)["']/g),
    ...code.matchAll(/require\(["']([^"']+)["']\)/g),
  ].map(m => m[1]);
  return matches.filter(p => !p.startsWith(".") && !p.startsWith("@/"));
}

console.log("🔍 Scanning server directory for dependencies...");

const files = getAllFiles(serverDir);
const imports = new Set(files.flatMap(extractImports));
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const missing = [...imports].filter(p => !pkg.dependencies?.[p]);

if (missing.length > 0) {
  console.log(`📦 Installing missing dependencies: ${missing.join(", ")}`);
  execSync(`npm install ${missing.join(" ")}`, { stdio: "inherit" });
  console.log("✅ Dependencies installed successfully.");
} else {
  console.log("✅ All dependencies are present.");
}
