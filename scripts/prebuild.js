import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// --- Configuration ---
const serverDir = path.resolve("server");

// --- Ignore built-in Node modules ---
const BUILT_INS = new Set([
  "fs", "path", "url", "http", "https", "crypto", "util", "os", "zlib", "stream", "events"
]);

// --- Utility functions ---
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

function extractImports(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const matches = [
    ...code.matchAll(/from\s+["']([^"']+)["']/g),
    ...code.matchAll(/require\(["']([^"']+)["']\)/g),
  ].map(m => m[1]);
  return matches.filter(p => !p.startsWith(".") && !p.startsWith("@/"));
}

// --- Main Logic ---
console.log("🔍 Scanning server directory for dependencies...");

const files = getAllFiles(serverDir);
const imports = new Set(files.flatMap(extractImports));
const pkgPath = path.resolve("package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const declaredDeps = Object.keys(pkg.dependencies || {});
const missing = [...imports].filter(p =>
  !declaredDeps.includes(p) &&
  !BUILT_INS.has(p) &&
  !p.startsWith("@shared/")
);

// --- Fix alias mappings ---
const aliasMap = {
  "openid-client/passport": "openid-client",
};

let allToInstall = missing.map(m => aliasMap[m] || m);

if (allToInstall.length > 0) {
  allToInstall = [...new Set(allToInstall)];
  console.log(`📦 Installing missing dependencies: ${allToInstall.join(", ")}`);
  try {
    execSync(`npm install ${allToInstall.join(" ")}`, { stdio: "inherit" });
    console.log("✅ All missing dependencies installed successfully.");
  } catch (err) {
    console.error("❌ Failed to install some dependencies:", err.message);
  }
} else {
  console.log("✅ All dependencies are already installed.");
}
