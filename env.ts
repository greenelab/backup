import { info } from "./util";

/** load env vars from local .env file */
require("dotenv").config();

/** github user or organization name, e.g. "greenelab" */
const githubUser =
  /** read from explicitly set env var */
  process.env.GITHUB_USER ||
  /** or, read from env var set by github actions */
  (process.env.GITHUB_REPOSITORY || "").split("/")[0] ||
  "";

/** github auth token */
const githubToken = process.env.GITHUB_TOKEN || "";
/** software heritage auth/api token */
const softwareHeritageToken = process.env.SOFTWARE_HERITAGE_TOKEN || "";

/** log key */
const logKey = (name = "", value = "", truncate = true) =>
  info(
    `${name}: ${truncate && value ? `"...${value.slice(-4)}"` : `"${value}"`}`,
  );

/** log keys */
logKey("GITHUB_USER", githubUser, false);
logKey("GITHUB_TOKEN", githubToken);
logKey("SOFTWARE_HERITAGE_TOKEN", softwareHeritageToken);

export { githubUser, githubToken, softwareHeritageToken };
