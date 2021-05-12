const { getRepos } = require("./github");
const { archiveRepos } = require("./software-heritage");

// archive script
const archive = async () => {
  const repos = await getRepos();
  await archiveRepos(repos);
};

archive();
