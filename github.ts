import { exec } from "child_process";
import { promisify } from "util";
import { Octokit } from "@octokit/rest";
import { githubToken, githubUser } from "./env";
import { info, success } from "./util";

/** github api helper */
const octokit = new Octokit({ auth: githubToken });

/** standard headers */
const headers = { accept: "application/vnd.github+json" };

/** return list of repo urls */
const getRepos = async () => {
  info(`Fetching repos for ${githubUser}`);

  /** repo details returned from octokit */
  type Repo = Awaited<
    ReturnType<typeof octokit.rest.repos.listForAuthenticatedUser>
  >["data"][number] & { wiki_url?: string };

  /** collect repos */
  let repos: Repo[] = [];

  /** go through pages of repos with hard limit */
  for (let page = 1; page < 100; page++) {
    /** list current page of repos for user or org */
    const results: Repo[] = (
      await octokit.rest.repos.listForAuthenticatedUser({
        headers,
        per_page: 100,
        page,
      })
    ).data;

    /** stop if reached end page, else add to list of repos */
    if (!results.length) break;
    else repos = repos.concat(results);
  }

  /** count types of repos */
  const _public = repos.filter((repo) => !repo.private).length;
  const _private = repos.filter((repo) => repo.private).length;

  success(`${_public} public repo(s)`);
  success(`${_private} private repo(s)`);

  info(`Getting associated wiki(s)`);

  /** get wiki urls for each repo */
  await Promise.all(
    repos.map(async (repo) => {
      /** check if wiki feature enabled for repo */
      if (!repo.has_wiki) return;

      /** public url of wiki */
      const wiki = repo.html_url + ".wiki.git";

      /** check "manually" if wiki really exists and isn't empty */
      try {
        await promisify(exec)(`git ls-remote ${wiki}`);
        repo.wiki_url = wiki;
      } catch (error) {
        /** if exec error, wiki doesn't exist */
      }
    }),
  );

  /** count number of wikis */
  const wikis = repos.filter((repo) => repo.wiki_url).length;

  success(`${wikis} wiki(s)`);
  success(`${repos.length + wikis} total repo(s)`);

  /** get repo urls to clone */
  let urls: string[] = [];
  for (const { html_url, wiki_url } of repos) {
    urls.push(html_url);
    if (wiki_url) urls.push(wiki_url);
  }

  return urls;
};

export { getRepos };
