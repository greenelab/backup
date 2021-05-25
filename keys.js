require("dotenv").config();

// organization name, e.g. "greenelab"
const githubOrganization =
  (process.env.GITHUB_REPOSITORY || "").split("/")[0] ||
  process.env.GITHUB_ORGANIZATION ||
  "";

// auth tokens
const githubToken = process.env.GITHUB_TOKEN || "";
const softwareHeritageToken = process.env.SOFTWARE_HERITAGE_TOKEN || "";

// collect keys
const keys = { githubOrganization, githubToken, softwareHeritageToken };

// log keys
for (const [key, value] of Object.entries(keys)) {
  keys[key] = value.trim();
  console.log(`${key}: ${value.trim() ? `"...${value.slice(-4)}"` : `""`}`);
}
module.exports = keys;
