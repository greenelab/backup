const { getRepos } = require("./github");
const { archiveRepos } = require("./software-heritage");

// archive org's repos with SoftwareHeritage.org
const archive = async () => {
  const repos = await getRepos();
  await archiveRepos(repos);
};

archive();
