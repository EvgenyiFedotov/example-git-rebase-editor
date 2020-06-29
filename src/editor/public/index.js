fetch("/content").then(getJson).then(parseResponse).then(renderContent);

const ACTIONS = ["pick", "reword", "squash", "drop"];

let typeData = "";
let rebaseCommits = [];
let message = "";

function parseResponse(response) {
  const { type, data } = response;

  typeData = type;

  switch (type) {
    case "commits":
      rebaseCommits = data;
      break;
    case "commit-edit-msg":
      message = data;
      break;
  }

  return data;
}

function renderContent() {
  const appElement = document.getElementById("app");
  let content = null;
  const containerButtonSend = renderContainerButtonSend();

  appElement.innerHTML = "";
  appElement.classList.add("column");

  switch (typeData) {
    case "commits":
      content = renderCommits();
      break;
    case "commit-edit-msg":
      content = renderMessage();
      break;
  }

  appElement.append(content);
  appElement.append(containerButtonSend);
}

function renderCommits() {
  const element = document.createElement("div");

  element.classList.add("column");

  rebaseCommits.forEach((commitProps, index) => {
    const commit = renderCommit(commitProps, index, rebaseCommits.length);

    element.append(commit);
  });

  return element;
}

function renderCommit(commit, index, length) {
  const element = document.createElement("div");

  const buttonUp = renderButtonUp(index);
  const buttonDown = renderButtonDown(index, length);

  const action = renderAction(commit.action, index);
  const commitHash = renderCommitHash(commit.commitHash);
  const comment = renderComment(commit.comment);

  element.classList.add("row");

  element.append(buttonUp);
  element.append(buttonDown);
  element.append(action);
  element.append(commitHash);
  element.append(comment);

  return element;
}

function renderButtonUp(index) {
  const element = document.createElement("button");

  element.innerText = "Up";
  element.disabled = index === 0;
  element.onclick = () => {
    const prev = rebaseCommits[index - 1];

    rebaseCommits[index - 1] = rebaseCommits[index];
    rebaseCommits[index] = prev;

    renderContent();
  };

  return element;
}

function renderButtonDown(index, length) {
  const element = document.createElement("button");

  element.innerText = "Down";
  element.disabled = index === length - 1;
  element.onclick = () => {
    const prev = rebaseCommits[index + 1];

    rebaseCommits[index + 1] = rebaseCommits[index];
    rebaseCommits[index] = prev;

    renderContent();
  };

  return element;
}

function renderAction(currentAction, index) {
  const element = document.createElement("select");

  ACTIONS.forEach((itemAction) => {
    element.append(renderActionOption(itemAction));
  });

  element.value = currentAction;
  element.onchange = () => {
    rebaseCommits[index].action = element.value;
    renderContent();
  };

  return element;
}

function renderActionOption(action) {
  const element = document.createElement("option");

  element.value = action;
  element.innerText = action;

  return element;
}

function renderCommitHash(commitHash) {
  const element = document.createElement("div");

  element.innerText = commitHash;

  return element;
}

function renderComment(comment) {
  const element = document.createElement("div");

  element.innerText = comment;

  return element;
}

function renderContainerButtonSend() {
  const element = document.createElement("div");
  const buttonSend = renderButtonSend();

  element.append(buttonSend);

  return element;
}

function renderMessage() {
  const element = document.createElement("textarea");

  element.value = message;
  element.onchange = () => {
    message = element.value;
  };

  return element;
}

function renderButtonSend() {
  const element = document.createElement("button");

  element.innerText = "Send";
  element.onclick = () => {
    let body = { type: typeData, data: null };

    switch (typeData) {
      case "commits":
        body.data = rebaseCommits;
        break;
      case "commit-edit-msg":
        body.data = message;
        break;
    }

    fetch("/complete", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }).then(() => window.close());
  };

  return element;
}

// Added
function getJson(response) {
  return response.json();
}
