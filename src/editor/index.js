#!/usr/bin/env node

const express = require("express");
const open = require("open");
const fs = require("fs");
const path = require("path");

const PORT = 7001;
const ARGS = process.argv;
const PATH_CONTENT = ARGS[2];

async function main() {
  const result = await new Promise(async (resolve) => {
    runServer({
      onContent: getContent,
      onComplete: resolve,
    });

    await open(`http://localhost:${PORT}`, {
      app: ["google chrome"],
    });
  });

  writeResult(result);

  process.exit(0);
}

function runServer(options = {}) {
  const { port = PORT, onContent = () => {}, onComplete = () => {} } = options;

  const app = express();

  app.use(express.static(__dirname + "/public"));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.sendFile(path.join("/index.html"));
  });

  app.get("/content", (req, res) => {
    res.send(onContent() || {});
  });

  app.post("/complete", (req, res) => {
    onComplete(req.body);
    res.sendStatus(200);
  });

  app.listen(port, function () {
    console.log("\n");
    console.log(`App listening on port ${port}!`);
  });
}

function getContent() {
  const { name } = path.parse(PATH_CONTENT);

  switch (name) {
    case "git-rebase-todo":
      return getCommits();
    case "COMMIT_EDITMSG":
      return getCommitEditMsg();
  }

  return { type: "unknown", content: null };
}

function getCommits() {
  let data = fs.readFileSync(PATH_CONTENT).toString();

  data = data.replace(/^\#.*$\n/gm, "").trim();
  data = data.split("\n");
  data = data.map((line) => line.split(" "));
  data = data.map(([action, commitHash, ...comment]) => ({
    action,
    commitHash,
    comment: comment.join(" "),
  }));

  return {
    type: "commits",
    data,
  };
}

function getCommitEditMsg() {
  let data = fs.readFileSync(PATH_CONTENT).toString();

  data = data.replace(/^\#.*$\n/gm, "").trim();

  return {
    type: "commit-edit-msg",
    data,
  };
}

function writeResult(result) {
  switch (result.type) {
    case "commits":
      writeCommits(result.data);
      break;
    case "commit-edit-msg":
      writeMessage(result.data);
      break;
  }
}

function writeCommits(commits = []) {
  const content = commits.reduce((memo, { action, commitHash, comment }) => {
    memo += `${action} ${commitHash} ${comment}\n`;

    return memo;
  }, "");

  fs.writeFileSync(PATH_CONTENT, content);
}

function writeMessage(message) {
  fs.writeFileSync(PATH_CONTENT, message);
}

main();
