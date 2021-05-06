require("dotenv").config();

// organization name, e.g. "greenelab"
const githubOrganization =
  (process.env.GITHUB_REPOSITORY || "").split("/")[0] ||
  process.env.GITHUB_ORGANIZATION ||
  "";

// auth tokens
const githubToken = process.env.GITHUB_TOKEN || "";
const softwareHeritageToken = process.env.SOFTWARE_HERITAGE_TOKEN || "";

module.exports = { githubOrganization, githubToken, softwareHeritageToken };
