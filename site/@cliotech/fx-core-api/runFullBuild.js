/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const {
  version: localPackageVersion,
  name: myLocakPkgName,
} = require("./package.json");

const promiseExecSpawn = require("./build/promiseExecSpawn");

const DEFAULT_REGISTRY = "http://nuget.efix.local/npm/DevNpm";

const FX_NPM_REGISTRY = process.env.FX_NPM_REGISTRY || DEFAULT_REGISTRY;

const EXTENDED_ENV_VARS = {
  ...process.env,
  FX_NPM_REGISTRY,
};
// if we have a package-lock use npm ci (it's faster), otherwise use npm install
const installCmd = fs.existsSync("./package-lock.json") ? "ci" : "install";

const FULL_CMDS = {
  install: {
    cmd: "npm",
    cmdArgs: [installCmd],
    options: {
      env: EXTENDED_ENV_VARS,
    },
  },
  view: {
    cmd: "npm",
    cmdArgs: ["view", myLocakPkgName, "-json"],
    options: { getStdout: true, env: EXTENDED_ENV_VARS },
  },
  lint: {
    cmd: "npm",
    cmdArgs: ["run", "lint"],
    options: {
      env: EXTENDED_ENV_VARS,
    },
  },
  test: {
    cmd: "npm",
    cmdArgs: ["run", "test"],
    options: {
      env: EXTENDED_ENV_VARS,
    },
  },
  build: {
    cmd: "npm",
    cmdArgs: ["run", "build"],
    options: {
      env: EXTENDED_ENV_VARS,
    },
  },
  publish: {
    cmd: "npm",
    cmdArgs: ["publish"],
    options: {
      env: EXTENDED_ENV_VARS,
    },
  },
  docs: {
    cmd: "npm",
    cmdArgs: ["run", "docs"],
    options: {
      env: EXTENDED_ENV_VARS,
    },
  },
};

const installPackages = () => promiseExecSpawn(FULL_CMDS.install);

const runLinter = () => promiseExecSpawn(FULL_CMDS.lint);
const runTests = () => promiseExecSpawn(FULL_CMDS.test);
const build = () => promiseExecSpawn(FULL_CMDS.build);

const viewPkgInfo = () => promiseExecSpawn(FULL_CMDS.view);

const publish = () => {
  const semver = require("semver");
  return viewPkgInfo()
    .then((result) => {
      let parse;
      if (result === "") {
        return {
          version: "0.0.0",
        };
      }
      try {
        parse = JSON.parse(result);
        return parse;
      } catch (e) {
        throw new Error("Could not get pkg info from repository");
      }
    })
    .then((pkgInfo) => {
      const remotePackageVersion = pkgInfo.version;

      const canPublish = semver.gt(localPackageVersion, remotePackageVersion);

      const invalidVersion = semver.lt(
        localPackageVersion,
        remotePackageVersion
      );

      const sameVersions = semver.eq(localPackageVersion, remotePackageVersion);

      if (canPublish) {
        return promiseExecSpawn(FULL_CMDS.publish);
      } else if (sameVersions) {
        console.log("REMOTE VERSION IS SAME AS LOCAL - NOT PUBLISHING");
        return true;
      }
      if (invalidVersion) {
        console.log(
          "Submitted package version is older than published version. Not Publishing"
        );
        return true;
      } else {
        console.log(
          `CHECKED IN PACKAGE IS OLDER THAN PUBLISHED VERSION. Please get latest on repository.`
        );
        return true;
      }
    });
};

const failBuild = (err) => {
  console.log(err);
  console.log("BUILD FAILED!");
  process.exit(1);
};

installPackages()
  .then(runLinter)
  .then(runTests)
  .then(build)
  .then(publish)
  .catch(failBuild);
