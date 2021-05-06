const fs = require("fs");
const { getRepos } = require("./github");
const { log, info } = require("./util");

// clone directory
const dir = "clone";

// clone org's repos locally
const cloneRepos = async (repos) => {
  log();
  info(`Cloning repos`);

  let lines = [`mkdir -p ${dir}`, `cd ${dir}`];
  for (const { html_url, wiki_url } of repos) {
    lines.push(html_url);
    lines.push(wiki_url);
  }
  lines = lines.filter((line) => line).map((line) => `git clone ${line}`);
  fs.writeFile("clone.sh", lines.join("\n"), () => null);
};
const clone = async () => {
  const repos = await getRepos();
  await cloneRepos(repos);
};

clone();
