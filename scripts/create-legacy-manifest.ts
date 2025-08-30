// scripts/create-legacy-manifest.js
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const newPath = path.join(root, ".next", "build-manifest.json");
const legacyDir = path.join(root, ".next", "server", "pages", "_app");
const legacyPath = path.join(legacyDir, "build-manifest.json");

try {
  if (!fs.existsSync(newPath)) {
    console.warn("[postbuild] modern build-manifest not found:", newPath);
    process.exit(0);
  }
  fs.mkdirSync(legacyDir, { recursive: true });
  const data = fs.readFileSync(newPath, "utf8");
  fs.writeFileSync(legacyPath, data);
  console.log("[postbuild] wrote legacy manifest:", legacyPath);
} catch (e) {
  console.warn("[postbuild] could not mirror build-manifest:", e?.message || e);
  // don't fail the build
}
