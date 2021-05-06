const { Octokit } = require("@octokit/rest");
const { githubToken, githubOrganization } = require("./vars");
const { log, success, info } = require("./util");

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

module.exports = { getRepos };
