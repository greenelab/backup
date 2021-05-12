const fs = require("fs");
const { getRepos } = require("./github");
const { log, info } = require("./util");

// clone directory
const dir = "clone";

// clone org's repos locally
const cloneRepos = async (repos) => {
  log();
  info(`Cloning repos`);

  // get repo urls to clone
  let lines = [];
  for (const { html_url, wiki_url } of repos) {
    lines.push(html_url);
    lines.push(wiki_url);
  }

  // remove empty lines, and prepend the "git clone" command
  lines = lines.filter((line) => line).map((line) => `git clone ${line}`);

  // make folder to contain clones and nav to it
  lines = [`mkdir -p ${dir}`, `cd ${dir}`].concat(lines);

  // write bash script out to file
  fs.writeFile("clone.sh", lines.join("\n"), () => null);

  // bash script is then run by "yarn clone" script
};

// clone script
const clone = async () => {
  const repos = await getRepos();
  await cloneRepos(repos);
};

clone();
