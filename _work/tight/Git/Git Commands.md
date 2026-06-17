# Git Commands

### Basic Commands

- **git init**\
  Initialize a new repository.

- **git clone <repository-url>**\
  Clone a remote repo locally.

- **git add <file>**\
  Stage a file.

- **git add .**\
  Stage all changes in the current directory.

- **git commit -m "message"**\
  Commit staged changes.

- **git status**\
  Show working tree and staging status.

- **git log**\
  Show commit history.

- **git diff**\
  Show unstaged/staged/commit diffs.

- **git rm <file>**\
  Remove a file from working tree and index.

- **git mv <source> <destination>**\
  Rename or move a file.

### Branching and Merging

- **git branch**\
  List branches or create one.

- **git branch <branch-name>**\
  Create a branch.

- **git checkout <branch-name>**\
  Switch branches.

- **git checkout -b <branch-name>**\
  Create and switch to a branch.

- **git merge <branch-name>**\
  Merge into the current branch.

- **git rebase <branch-name>**\
  Reapply commits onto another base.

- **git branch -d <branch-name>**\
  Delete a branch locally.

- **git branch -D <branch-name>**\
  Force-delete a branch locally.

### Remote Repositories

- **git remote add <name> <url>**\
  Add a remote.

- **git remote -v**\
  List remotes.

- **git fetch <remote>**\
  Download remote updates.

- **git pull <remote> <branch>**\
  Fetch and merge a remote branch.

- **git push <remote> <branch>**\
  Push commits to a remote branch.

- **git push origin --delete <branch>**\
  Delete a remote branch.

### Tagging

- **git tag**\
  List tags.

- **git tag <tag-name>**\
  Create a lightweight tag.

- **git tag -a <tag-name> -m "message"**\
  Create an annotated tag.

- **git push <remote> <tag-name>**\
  Push a tag to remote.

- **git tag -d <tag-name>**\
  Delete a local tag.

### Stashing Changes

- **git stash**\
  Stash working changes.

- **git stash pop**\
  Apply latest stash and drop it.

- **git stash list**\
  List stashes.

- **git stash drop**\
  Remove a stash entry.

### Undoing Changes

- **git reset <file>**\
  Unstage a file.

- **git reset --hard**\
  Discard all uncommitted changes.

- **git revert <commit>**\
  Revert a commit with a new commit.

- **git clean -f**\
  Remove untracked files.

### Configuration

- **git config --global user.name "Your Name"**\
  Set global commit author name.

- **git config --global user.email "your.email@example.com"**\
  Set global commit email.

- **git config --list**\
  List configuration.

### Advanced Commands

- **git cherry-pick <commit>**\
  Apply a specific commit to the current branch.

- **git rebase -i <commit>**\
  Interactive rebase (edit, squash, reorder).

- **git reflog**\
  Show reference update history.

- **git archive**\
  Export files from a commit or branch.

- **git bisect**\
  Binary search for a bad commit.

- **git blame <file>**\
  Show last author per line.

### Examples

1.  **Initialize a Repository**

```bash
git init
```

2.  **Clone a Repository**

```bash
git clone https://github.com/user/repo.git
```

3.  **Create a Branch and Switch to It**

```bash
git checkout -b feature-branch
```

4.  **Merge a Branch**

```bash
git checkout main
git merge feature-branch
```

5.  **Push Changes to a Remote Repository**

```bash
git push origin main
```

6.  **Stash Changes**

```bash
git stash
```

7.  **Revert a Commit**

```bash
git revert a1b2c3d
```

8.  **List All Branches**

```bash
git branch
```

9.  **Fetch and Merge Changes**

```bash
git pull origin main
```

10. **Show Commit History**

```bash
git log
```
