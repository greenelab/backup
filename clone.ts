import { execSync } from "child_process";
import { githubUser } from "./env";
import { getRepos } from "./github";
import { info } from "./util";

/** clone directory */
const dir = `../${githubUser}-clone`;

/** clone repos locally */
const cloneRepos = async (urls: string[]) => {
  info(`Cloning repos to ${dir}`);

  /** run commands to clone */
  execSync(`mkdir -p ${dir}`);
  for (const url of urls) execSync(`git clone ${url}`, { cwd: dir });
};

/** clone script */
const clone = async () => {
  const repos = await getRepos();
  await cloneRepos(repos);
};

clone();
