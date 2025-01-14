import { execSync, ExecSyncOptions } from "child_process";
import * as rimraf from "rimraf";

const runCommands = true;

const projectName = "the-project";
const applicationName = "the-application";
const libraryName = "the-library";

const version = process.argv[2];
const majorVersion = version.split(".")[0];
const flags = new Set(process.argv.slice(3));
const branch = version + Array.from(flags).sort().join("");

run(`git checkout -b ${branch}`, {});
rimraf.sync(projectName);
runAndCommit(`yarn add -D @angular/cli@${version}`, {});
runAndCommit(
  `npx ng new ${projectName} --create-application=${!flags.has(
    "-noApp"
  )} --routing=${flags.has("-route")} --strict=${flags.has(
    "-strict"
  )} --skip-install --interactive=false --package-manager=yarn --style=scss`,
  {}
);
if (flags.has("-eslint")) {
  runAndCommit(
    `npx ng add @angular-eslint/schematics@${majorVersion} --interactive=false --skip-confirmation=true`
  );
  if (flags.has("-noApp")) {
    runAndCommit(`ng config cli.defaultCollection @angular-eslint/schematics`);
  }
}
if (flags.has("-subApp")) {
  runAndCommit(
    `npx ng generate application ${applicationName} --skip-install --interactive=false`
  );
}
if (flags.has("-lib")) {
  runAndCommit(
    `npx ng generate library ${libraryName} --skip-install --interactive=false`
  );
}
if (flags.has("-mat")) {
  const extraArgs = flags.has("-noApp") ? `--project=${applicationName}` : "";
  runAndCommit(
    `npx ng add @angular/material@${majorVersion} ${extraArgs} --interactive=false --skip-confirmation=true`
  );
}
if (flags.has("-pwa")) {
  runAndCommit(
    "npx ng add @angular/pwa --interactive=false --skip-confirmation=true"
  );
}
if (flags.has("-fire")) {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.error("@angular/fire must be added manually. Run this and commit:");
  console.log("cd the-project");
  console.log("npx ng add @angular/fire");
  console.log("npx rimraf node_modules");
  console.log("git add .");
  console.log("cd ..");
  console.log(`git commit -m "add angular fire"`);
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
} else {
  rimraf.sync(`${projectName}/node_modules`);
}

function runAndCommit(
  command: string,
  options: ExecSyncOptions = { cwd: projectName }
) {
  run(command, options);
  if (runCommands) {
    execSync("git add .");
    execSync(`git commit -m "${command}"`);
  }
}

function run(command: string, options: ExecSyncOptions = { cwd: projectName }) {
  console.log("\n--------------------------------------------");
  console.log(command);

  if (runCommands) {
    execSync(command, options);
  }
}
