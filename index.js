// packages
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { Octokit } = require("@octokit/rest");
const chalk = require("chalk");
const git = require("nodegit");

// don't archive repo if last archived less than this many minutes ago
const archiveLimit = 60;

// organization name, e.g. "greenelab"
const organization =
  (process.env.GITHUB_REPOSITORY || "").split("/")[0] ||
  process.env.GITHUB_ORGANIZATION ||
  "";

// auth tokens
// read from GitHub Actions automatically, or from .env if running locally
const githubToken = process.env.GITHUB_TOKEN || "";
const softwareHeritageToken = process.env.SOFTWARE_HERITAGE_TOKEN || "";

// don't show stack trace for errors
process.env.NODE_ENV = "production";

// GitHub API helper
const octokit = new Octokit({ auth: githubToken });

// loggers
const log = (message = "") => console.log(message);
const success = (message = "") => console.log(chalk.green(message));
const info = (message = "") => console.log(chalk.blue(message));
const warning = (message = "") => console.log(chalk.yellow(message));
const error = (message = "") => console.log(chalk.red(message));

// return list of repos for org
const getRepos = async (organization) => {
  log();
  info(`Fetching repos for ${organization}`);

  // collect org's repos
  let repos = [];

  // go through pages of repos with hard limit
  for (let page = 1; page < 100; page++) {
    // query current page of repos
    const url = `GET /orgs/${organization}/repos`;
    const options = { org: "org", per_page: "100", page };
    const results = (await octokit.request(url, options)).data;

    // get wiki url for repo if it has one
    results.forEach((repo) => {
      if (repo.has_wiki) repo.wiki_url = repo.html_url + ".wiki.git";
    });

    // stop if reached end page,
    if (!results.length) break;
    else repos = repos.concat(results);
  }

  // count public and private
  const public = repos.filter((repo) => !repo.private).length;
  const private = repos.filter((repo) => repo.private).length;

  success(`Found ${repos.length} repos, ${public} public, ${private} private`);

  return repos;
};

// archive repos
const archiveRepos = async (repos) => {
  log();
  info(`Archiving repos at SoftwareHeritage.org`);

  for (const { html_url, wiki_url } of repos) {
    await archiveRepo(html_url);
    await archiveRepo(wiki_url);
  }
};

// util sleep func
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// submit a repo url to be archived at SoftwareHeritage.org
const headers = softwareHeritageToken
  ? { Authorization: `Bearer ${softwareHeritageToken}` }
  : {};
const archiveRepo = async (repo) => {
  const name = path.basename(repo);
  log();
  info(`Archiving repo ${name}`);

  // check if repo already saved
  log(`Checking existing saves`);
  try {
    // check for existing save
    const url = `https://archive.softwareheritage.org/api/1/origin/save/git/url/${repo}/`;
    const options = { method: "GET", headers };
    const response = await (await fetch(url, options)).json();

    // if repo recently archived, finish without archiving
    if (Array.isArray(response)) {
      const mostRecent = response[0].save_request_date || Date.now();
      const elapsed = new Date() - new Date(mostRecent);
      let ago = Math.round(elapsed / 1000 / 60);
      if (ago < archiveLimit) {
        warning(`Repo just archived ${ago} minutes ago. Skipping.`);
        return;
      }
    }

    // note if this is first time repo being archived
    if (response.exception === "NotFoundExc") log("Repo never archived before");
  } catch (message) {
    // catch any error and exit
    error(message);
    return;
  }

  // save repo
  log("Saving");
  // retry delays, in minutes
  const delays = [0.25, 0.5, 1, 5, 10, 20, 30, 40, 50, 60, 120];

  // retries
  for (let attempt = 0; attempt < delays.length; attempt++) {
    log(`Attempt ${attempt + 1}`);

    try {
      {
        // submit to API to be archived
        const url = `https://archive.softwareheritage.org/api/1/origin/save/git/url/${repo}/`;
        const options = { method: "POST", headers };
        const response = await (await fetch(url, options)).json();

        // catch rate-limit error
        if (response.exception === "Throttled") {
          error(response.reason);
          const minutes = delays[attempt];
          if (minutes <= 1) log(`Trying again in ${minutes * 60} seconds`);
          else log(`Trying again in ${minutes} minutes`);
          await sleep(minutes * 60 * 1000);
          continue;
        }

        // if accepted, finish
        if (response.save_request_status === "accepted") {
          success("Successfully archived");
          return;
        }

        // catch all other errors
        throw new Error(JSON.stringify(response));
      }
    } catch (message) {
      // catch any error and exit
      error(message);
      break;
    }
  }
};

// archive org's repos with SoftwareHeritage.org
const archive = async (organization) => {
  const repos = await getRepos(organization);
  await archiveRepos(repos);
};

// clone single repo
const cloneRepo = async (repo, dir) => {
  log();
  info(`Cloning repo ${repo}`);

  try {
    await git.Clone(repo, path.join(dir, path.basename(repo)));
  } catch (message) {
    log(message);
    error("Error cloning. Skipping.");
  }
};

// clone repos
const cloneRepos = async (repos) => {
  const dir = path.join(process.cwd(), "clone");
  log();
  info(`Cloning repos to ${dir}`);

  try {
    fs.mkdirSync(dir);
  } catch (error) {}

  for (const { html_url, wiki_url } of repos) {
    await cloneRepo(html_url, dir);
    await cloneRepo(wiki_url, dir);
  }
};

// backup org's repos by cloning them all locally
const clone = async (organization) => {
  const repos = await getRepos(organization);
  await cloneRepos(repos);
};

// archive(organization);
clone(organization);
