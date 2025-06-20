#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../src/config/site.ts");

try {
  // Read the current config file
  let configContent = fs.readFileSync(configPath, "utf8");

  // Check current maintenance mode status
  const isCurrentlyEnabled = configContent.includes("maintenanceMode: true");

  // Toggle the maintenance mode
  if (isCurrentlyEnabled) {
    configContent = configContent.replace(
      "maintenanceMode: true",
      "maintenanceMode: false"
    );
    console.log("✅ Maintenance mode disabled - Site is now ONLINE");
  } else {
    configContent = configContent.replace(
      "maintenanceMode: false",
      "maintenanceMode: true"
    );
    console.log("🚧 Maintenance mode enabled - Site is now OFFLINE");
  }

  // Write the updated config
  fs.writeFileSync(configPath, configContent);

  console.log("\nNext steps:");
  console.log("1. Commit and push the changes to deploy");
  console.log('2. Or run "yarn build" to test locally');
} catch (error) {
  console.error("❌ Error toggling maintenance mode:", error.message);
  process.exit(1);
}
