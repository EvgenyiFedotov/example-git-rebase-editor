# example-git-rebase-editor

Code for example, how you can create git rebase editor

## Install

```sh
# Clone repo
git clone git@github.com:EvgenyiFedotov/example-git-rebase-editor.git

# Link package for install CLI
yarn link
```

## CLI

```sh
git-rebase-editor [options] [command]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  attach
  detach
  help [command]  display help for command
```

## Use case

```sh
# Open folder with git

# Change editor on `rebase-editor`
git-rebase-editor attach

# Rebase
git rebase -i HEAD~1

# For revert editor
git-rebase-editor detach
```
