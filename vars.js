require("dotenv").config();

// organization name, e.g. "greenelab"
const githubOrganization =
  (process.env.GITHUB_REPOSITORY || "").split("/")[0].trim() ||
  process.env.GITHUB_ORGANIZATION.trim() ||
  "";

// auth tokens
const githubToken = process.env.GITHUB_TOKEN.trim() || "";
const softwareHeritageToken = process.env.SOFTWARE_HERITAGE_TOKEN.trim() || "";

// collect keys
const keys = { githubOrganization, githubToken, softwareHeritageToken };

// log keys
for (const [key, value] of Object.entries(keys))
  console.log(`${key}: ${value.trim() ? `"...${value.slice(-4)}"` : `""`}`);

module.exports = keys;
