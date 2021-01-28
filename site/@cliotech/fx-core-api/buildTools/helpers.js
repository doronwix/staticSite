const fs = require("fs");
const gitP = require("simple-git/promise");
const git = require("simple-git");
const ncp = require("ncp");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");

ncp.limit = 16;

const createFolder = (fullPath) =>
  new Promise((resolve, reject) => {
    if (fs.existsSync(fullPath)) {
      // check and clean folder
      resolve();
    } else {
      mkdirp(fullPath, (err) => {
        if (err) reject(err);

        resolve();
      });
    }
  });

const cloneRepoToPath = (repoUrl, localPath) =>
  gitP().clone(repoUrl, localPath);

const copyFolderContents = (fromFolder, toFolder) =>
  new Promise((resolve, reject) => {
    ncp(fromFolder, toFolder, { clobber: true, stopOnErr: true }, (err) => {
      if (err) reject(err);
      resolve();
    });
  });

const addAndCommit = (gitLocalPath, commitMsg) =>
  git(gitLocalPath)
    .add("./*")
    .commit(commitMsg)
    .push("origin", "wikiMaster");

const gitRemoveFolder = (repoPath, folder) =>
  gitP(repoPath).raw(["rm", "-r", folder]);

const deleteFolder = (fullPath) =>
  new Promise((resolve, reject) =>
    rimraf(fullPath, (err) => {
      if (err) reject(err);
      resolve();
    })
  );

module.exports = {
  createFolder,
  copyFolderContents,
  gitRemoveFolder,
  cloneRepoToPath,
  deleteFolder,
  addAndCommit,
};
