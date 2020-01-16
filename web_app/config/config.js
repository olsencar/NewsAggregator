const fs = require("fs");
const configPath = __dirname + "/config.json";
const parsed = JSON.parse(fs.readFileSync(configPath, "UTF-8"));
module.exports = parsed;