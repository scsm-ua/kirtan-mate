const { execSync } = require("child_process");

const dependencies = [
  "git+https://github.com/scsm-ua/gaudiya-gitanjali-lv.git",
  "git+https://github.com/scsm-ua/gaudiya-gitanjali-ru.git",
  "git+https://github.com/scsm-ua/gaudiya-gitanjali-ua.git",
  "git+https://github.com/scsm-ua/kirtan-guide-en.git",
  "git+https://github.com/scsm-ua/kirtan-guide-es.git#review",
  "git+https://github.com/scsm-ua/kirtan-guide-pocket-edition.git"
];

try {
  console.log(`Installing dependencies...`);
  console.log(dependencies.join('\n'));
  execSync(`npm install --no-save ${dependencies.join(" ")}`, { stdio: "inherit" });
  console.log("Dependencies installed successfully.");
} catch (error) {
  console.error("Failed to install dependencies:", error.message);
  process.exit(1); // Exit with an error code
}
