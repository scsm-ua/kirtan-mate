const { execSync } = require("child_process");

const dependencies = require('./songbooks.json');

if (dependencies && dependencies.length) {
  try {
    console.log(`Installing songbooks...`);
    console.log(dependencies.join('\n'));
    execSync(`npm install --no-save ${dependencies.join(" ")}`, { stdio: "inherit" });
    console.log("Songbooks installed successfully.");
  } catch (error) {
    console.error("Failed to install songbooks:", error.message);
    process.exit(1); // Exit with an error code
  }
} else {
  console.log(`No songbooks to install.`);
}
