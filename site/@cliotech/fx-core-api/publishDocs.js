const path = require("path");
const {
  cloneRepoToPath,
  createFolder,
  copyFolderContents,
  gitRemoveFolder,
  deleteFolder,
  addAndCommit,
} = require("./buildTools/helpers");

const DOCS_FOLDER_NAME = "others";
const TMP_GIT_FOLDER = path.resolve(process.cwd(), "tmp");
const GIT_REPO_URL = "http://tfserver:8080/tfs/iForex/FXNET/_git/FXNET.wiki";
const GIT_DOCS_FOLDER = path.resolve(TMP_GIT_FOLDER, DOCS_FOLDER_NAME);
const DIST_DOCS_FOLDER = path.resolve(process.cwd(), "docs");

createFolder(TMP_GIT_FOLDER)
  .then(() => cloneRepoToPath(GIT_REPO_URL, TMP_GIT_FOLDER))
  .then(() => gitRemoveFolder(TMP_GIT_FOLDER, DOCS_FOLDER_NAME))
  .then(() => createFolder(GIT_DOCS_FOLDER))
  .then(() => copyFolderContents(DIST_DOCS_FOLDER, GIT_DOCS_FOLDER))
  .then(() => addAndCommit(TMP_GIT_FOLDER, "testing docs commit"))
  .then(() => deleteFolder(TMP_GIT_FOLDER))
  .catch((err) => {
    console.error("There was an error trying to publish docs");
    deleteFolder(TMP_GIT_FOLDER).then(() => exit(1));
  });
