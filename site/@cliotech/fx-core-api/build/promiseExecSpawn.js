const { spawn } = require("child_process");
const { platform } = require("os");
const osType = platform();

const promiseExecSpawn = ({ cmd, cmdArgs, options = {} }) => {
  return new Promise((resolve, reject) => {
    let stdoutResult = "";
    let stdErr = "";

    const myProcess = spawn(cmd, cmdArgs, {
      stdio: options.getStdout ? "pipe" : "inherit",
      env: options.env,
      shell: osType === "win32",
    });

    if (options.getStdout) {
      myProcess.stdout.on("data", (data) => {
        stdoutResult += data.toString();
      });
    }

    if (options.getStdout) {
      myProcess.on("error", (err) => {
        stdErr += err;
      });
    }

    myProcess.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Proces`);
        reject(
          `Process exit with code ${code} and err: ${stdErr} on step "${cmd} ${cmdArgs}`
        );
      } else {
        resolve(options.getStdout ? stdoutResult : true);
      }
    });
  });
};

module.exports = promiseExecSpawn;
