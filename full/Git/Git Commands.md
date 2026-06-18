# Git Commands

Here’s a comprehensive list of common Git commands, organized by category, along with brief explanations.

### Basic Commands

- **git init**\
  Initialize a new Git repository.

- **git clone <repository-url>**\
  Clone a remote repository to your local machine.

- **git add <file>**\
  Add a file to the staging area.

- **git add .**\
  Add all changes in the current directory to the staging area.

- **git commit -m "message"**\
  Commit staged changes with a message.

- **git status**\
  Show the working directory and staging area status.

- **git log**\
  Show the commit history.

- **git diff**\
  Show changes between commits, working directory, and staging area.

- **git rm <file>**\
  Remove a file from the working directory and staging area.

- **git mv <source> <destination>**\
  Move or rename a file.

### Branching and Merging

- **git branch**\
  List all branches or create a new branch.

- **git branch <branch-name>**\
  Create a new branch.

- **git checkout <branch-name>**\
  Switch to a different branch.

- **git checkout -b <branch-name>**\
  Create a new branch and switch to it.

- **git merge <branch-name>**\
  Merge a branch into the current branch.

- **git rebase <branch-name>**\
  Reapply commits on top of another base branch.

- **git branch -d <branch-name>**\
  Delete a branch (locally).

- **git branch -D <branch-name>**\
  Force delete a branch (locally).

### Remote Repositories

- **git remote add <name> <url>**\
  Add a new remote repository.

- **git remote -v**\
  List remote repositories.

- **git fetch <remote>**\
  Fetch updates from a remote repository.

- **git pull <remote> <branch>**\
  Fetch and merge changes from a remote branch into the current branch.

- **git push <remote> <branch>**\
  Push commits to a remote branch.

- **git push origin --delete <branch>**\
  Delete a branch on the remote repository.

### Tagging

- **git tag**\
  List all tags.

- **git tag <tag-name>**\
  Create a new tag.

- **git tag -a <tag-name> -m "message"**\
  Create an annotated tag with a message.

- **git push <remote> <tag-name>**\
  Push a tag to a remote repository.

- **git tag -d <tag-name>**\
  Delete a local tag.

### Stashing Changes

- **git stash**\
  Save changes in a stash to revert to a clean working directory.

- **git stash pop**\
  Apply the most recent stash and remove it from the stash list.

- **git stash list**\
  List all stashed changes.

- **git stash drop**\
  Remove a specific stash from the list.

### Undoing Changes

- **git reset <file>**\
  Unstage a file from the staging area.

- **git reset --hard**\
  Reset the working directory and index to the last commit, discarding all changes.

- **git revert <commit>**\
  Create a new commit that undoes the changes from a specified commit.

- **git clean -f**\
  Remove untracked files from the working directory.

### Configuration

- **git config --global user.name "Your Name"**\
  Set the global username for commits.

- **git config --global user.email "your.email@example.com"**\
  Set the global email address for commits.

- **git config --list**\
  List all Git configuration settings.

### Advanced Commands

- **git cherry-pick <commit>**\
  Apply the changes from a specific commit to the current branch.

- **git rebase -i <commit>**\
  Interactively rebase commits, allowing editing, squashing, or reordering.

- **git reflog**\
  Show the history of all actions performed on the repository.

- **git archive**\
  Create an archive of files from a particular commit or branch.

- **git bisect**\
  Use binary search to find the commit that introduced a bug.

- **git blame <file>**\
  Show what revision and author last modified each line of a file.

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

These commands cover most common and some advanced Git operations. For more detailed usage and options, you can use git help <command> to get additional information on each command.
