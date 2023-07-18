import { getRepos } from "./github";
import { archiveRepos } from "./software-heritage";

/** archive script */
const archive = async () => {
  const repos = await getRepos();
  await archiveRepos(repos);
};

archive();
