const path = require("path");
const fetch = require("node-fetch");
const { softwareHeritageToken } = require("./vars");
const { log, success, info, warning, error, sleep } = require("./util");

// don't archive repo if last archived less than this many minutes ago
const archiveLimit = 60;

// archive repos
const archiveRepos = async (repos) => {
  log();
  info(`Archiving repos at SoftwareHeritage.org`);

  const urls = repos
    .reduce((urls, { html_url, wiki_url }) => [...urls, html_url, wiki_url], [])
    .filter((url) => url);

  for (const [index, url] of Object.entries(urls))
    await archiveRepo(url, Number(index), urls.length);
};

// submit a repo url to be archived at SoftwareHeritage.org
const headers = softwareHeritageToken
  ? { Authorization: `Bearer ${softwareHeritageToken}` }
  : {};
const archiveRepo = async (repo, index, length) => {
  const name = path.basename(repo);
  log();
  info(`Archiving repo ${name}, ${index + 1} of ${length}`);

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
  const delays = [10, 30, 60, 90, 120];

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
          log(`Trying again in ${minutes} minutes`);
          await sleep(minutes * 60 * 1000);
          continue;
        }

        // if accepted, finish
        if (response.save_request_status === "accepted") {
          success("Successfully submitted for archiving");
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

module.exports = { archiveRepos };
