#!/usr/bin/env node

const { program } = require("commander");
const { version } = require("../../package.json");
const childProcess = require("child_process");
const path = require("path");
const fs = require("fs");
const objectHash = require("object-hash");

const PATH_ROOT = path.resolve(__dirname, "../../");
const PATH_CACHE = path.resolve(PATH_ROOT, "./cache.json");
const PATH_GIT_EDITOR = path.resolve(PATH_ROOT, "./src/editor/index.js");

program.version(version);

program.command("attach").action(() => {
  const currentGitEditor = childProcess
    .execSync("git config --get core.editor", { cwd: process.cwd() })
    .toString()
    .trim();

  const cache = getCache();
  const keyCache = objectHash(process.cwd());

  if (cache[keyCache] === undefined) {
    cache[keyCache] = currentGitEditor;
    fs.writeFileSync(PATH_CACHE, JSON.stringify(cache, null, 2));

    childProcess.execSync(`git config --add core.editor ${PATH_GIT_EDITOR}`);

    console.log("key:", keyCache);
    console.log("editor:", currentGitEditor);
    console.log("✨ attach done");
  } else {
    console.log("❗️ current directory exist in cache");
  }
});

program.command("detach").action(() => {
  const cache = getCache();
  const keyCache = objectHash(process.cwd());
  const gitEditor = cache[keyCache];

  if (gitEditor) {
    childProcess.execSync(`git config --add core.editor ${gitEditor}`);

    delete cache[keyCache];
    fs.writeFileSync(PATH_CACHE, JSON.stringify(cache, null, 2));
    console.log("✨ detach done");
  } else {
    console.log("❗️ current directory doesn't exist in cache");
  }
});

program.parse(process.argv);

// Added
function getCache() {
  let cache = {};

  // Check file 'store.json'
  try {
    fs.accessSync(PATH_CACHE);
    cache = JSON.parse(fs.readFileSync(PATH_CACHE));
  } catch (error) {
    // pass
  }

  return cache;
}
