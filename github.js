const { Octokit } = require("@octokit/rest");
const { githubToken, githubOrganization } = require("./keys");
const { log, success, info, error } = require("./util");
const simpleGit = require("simple-git");
const git = simpleGit();

// GitHub API helper
const octokit = new Octokit({ auth: githubToken });

// return list of repos for org
const getRepos = async () => {
  log();
  info(`Fetching repos for ${githubOrganization}`);

  // collect org's repos
  let repos = [];

  // go through pages of repos with hard limit
  for (let page = 1; page < 100; page++) {
    // query current page of repos
    const url = `GET /orgs/${githubOrganization}/repos`;
    const options = { org: "org", per_page: "100", page };
    const results = (await octokit.request(url, options)).data;

    // stop if reached end page,
    if (!results.length) break;
    else repos = repos.concat(results);
  }

  // count public and private
  const public = repos.filter((repo) => !repo.private).length;
  const private = repos.filter((repo) => repo.private).length;
  success(`Found ${repos.length} repos, ${public} public, ${private} private`);

  log();
  info("Looking for wikis");

  // check each repo for a wiki
  for (const repo of repos) {
    const wiki_url = repo.html_url + ".wiki.git";
    if (repo.has_wiki && (await checkRepo(wiki_url))) repo.wiki_url = wiki_url;
  }

  // count wikis
  const wikis = repos.filter((repo) => repo.wiki_url).length;
  success(`Found ${wikis} wikis`);

  // count total
  success(`${repos.length + wikis} total repos to archive`);

  return repos;
};

// check if (wiki) repo exists
// https://stackoverflow.com/questions/23914896/check-that-git-repository-exists
const checkRepo = async (repo) => {
  try {
    await git.listRemote([repo]);
    // success(repo);
    return true;
  } catch (message) {
    // error(repo);
    return false;
  }
};

module.exports = { getRepos };
