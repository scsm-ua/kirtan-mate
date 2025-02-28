const { execSync } = require("child_process");

const dependencies = require('./songbooks.json');

try {
  console.log(`Installing dependencies...`);
  console.log(dependencies.join('\n'));
  execSync(`npm install --no-save ${dependencies.join(" ")}`, { stdio: "inherit" });
  console.log("Dependencies installed successfully.");
} catch (error) {
  console.error("Failed to install dependencies:", error.message);
  process.exit(1); // Exit with an error code
}
