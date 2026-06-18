# Git Basics

## Questions Covered

1. What is Git, and why use it over SVN or TFVC?
2. What are the three areas of a Git repository?
3. How does the basic Git workflow work?
4. What is a commit, and what does a commit hash represent?
5. How do you initialize and clone a repository?
6. What is the difference between `git add`, `git commit`, and `git push`?
7. How do you read `git status` and `git diff`?
8. What is `.gitignore`, and how do you use it?
9. How do you configure Git (user, editor, defaults)?
10. What is the difference between `git switch` and `git checkout`?

## What is Git, and why use it over SVN or TFVC?

**Git** is a **distributed version control system (DVCS)**. Every clone is a full copy of history — you commit locally, then sync with remotes.

| Feature | Git | SVN / TFVC (centralized) |
|---------|-----|--------------------------|
| **Model** | Distributed — local commits, push later | Central server is source of truth |
| **Branching** | Cheap, fast, local | Heavier; branches often server-side |
| **Offline** | Full history locally | Needs server for most operations |
| **Merge** | Built-in merge/rebase workflows | Merge exists; less flexible |
| **Speed** | Fast local operations | Network-bound for many ops |

```text
Centralized (SVN):     Dev ──► Server (single history)
Distributed (Git):     Dev A ◄──► Remote ◄──► Dev B
                       each has full repo + branches
```

**Interview angle:** Git is the default for modern CI/CD, open source, and Azure DevOps / GitHub / GitLab. Know *why* distributed matters: feature branches, code review, and resilient workflows when the server is down.

## What are the three areas of a Git repository?

| Area | Also called | Contents |
|------|-------------|----------|
| **Working directory** | Working tree | Files you edit on disk |
| **Staging area** | Index | Changes selected for next commit |
| **Repository** | `.git` object store | Commits, branches, tags |

```text
Working dir  ──git add──►  Staging  ──git commit──►  Repository
     ▲                                                    │
     └──────────── git checkout / restore ◄──────────────┘
```

- **`git add`** moves changes from working dir → staging.
- **`git commit`** snapshots staging → repository.
- **`git restore`** (or `checkout --`) discards or moves changes between areas.

## How does the basic Git workflow work?

Typical day-to-day loop:

```bash
git pull origin main          # sync with remote (fetch + merge/rebase)
# edit files
git status                    # see what changed
git add src/app.ts            # stage specific file
git add .                     # stage all changes in cwd and below
git commit -m "feat: add login form validation"
git push origin feature/login
```

| Step | Purpose |
|------|---------|
| **Pull** | Get teammates' changes before you push |
| **Edit** | Change code in working directory |
| **Stage** | Curate exactly what goes in the commit |
| **Commit** | Immutable snapshot with message |
| **Push** | Publish commits to remote |

**Good commit hygiene:** One logical change per commit; imperative message (`fix:`, `feat:`, `docs:`); small commits ease review and `git bisect`.

## What is a commit, and what does a commit hash represent?

A **commit** is a snapshot of the project at a point in time, plus metadata:

- **Tree** — file/folder structure and blob hashes
- **Parent(s)** — previous commit(s); merges have two parents
- **Author / committer** — name, email, timestamp
- **Message** — why the change was made

```bash
git log --oneline -5
git show a1b2c3d                 # full commit details + diff
git log --graph --oneline --all  # branch topology
```

The **hash** (e.g. `a1b2c3d4e5f6…`) is a SHA-1 (or SHA-256 in newer repos) of the commit content. Same content → same hash. Hashes are used everywhere: `git cherry-pick`, `git revert`, CI build IDs (`${{ github.sha }}`).

## How do you initialize and clone a repository?

```bash
# New repo in current folder
git init
git init my-project && cd my-project

# Clone existing remote
git clone https://github.com/org/repo.git
git clone git@github.com:org/repo.git my-folder   # SSH, custom dir name
git clone --branch develop --single-branch https://github.com/org/repo.git
```

| Command | When to use |
|---------|-------------|
| `git init` | Greenfield project, existing folder |
| `git clone` | Join an existing project; copies full history |

After `git init`, add a remote before push:

```bash
git remote add origin https://github.com/you/repo.git
git branch -M main
git push -u origin main    # -u sets upstream tracking
```

## What is the difference between `git add`, `git commit`, and `git push`?

| Command | Scope | Reversible? |
|---------|-------|-------------|
| `git add` | Local staging only | Yes — `git restore --staged` |
| `git commit` | Local repository | Yes — reset/revert (with care) |
| `git push` | Publishes to remote | Harder — others may have pulled |

```bash
git add -p file.ts           # interactively stage hunks
git commit -m "fix: null check"
git commit --amend           # replace last commit (only if not pushed!)
git push origin feature/x
```

**Common mistake:** Committing secrets or `bin/` output — use `.gitignore` and `git rm --cached` if already tracked.

## How do you read `git status` and `git diff`?

```bash
git status                   # branch, staged vs unstaged, untracked
git diff                     # unstaged changes (working vs staging)
git diff --staged            # staged changes (staging vs last commit)
git diff main..feature       # commits on feature not in main
git diff main...feature      # diff from merge-base (PR view)
```

| `git status` line | Meaning |
|-------------------|---------|
| **Changes to be committed** | Staged — will be in next commit |
| **Changes not staged** | Modified but not `git add`ed |
| **Untracked files** | New files Git doesn't track yet |

```bash
# Useful log formats
git log --oneline --decorate -10
git log -p -2                  # patch for last 2 commits
git log --author="Jane" --since="2 weeks ago"
```

## What is `.gitignore`, and how do you use it?

`.gitignore` lists patterns Git should **never** track (build output, secrets, IDE files).

```gitignore
# Build output
bin/
obj/
dist/
node_modules/

# Secrets — never commit
.env
*.pfx
appsettings.Development.json

# IDE
.vs/
.idea/
*.user

# OS
Thumbs.db
.DS_Store
```

| Pattern | Matches |
|---------|---------|
| `*.log` | Any `.log` file |
| `/build` | Only root-level `build` |
| `**/temp` | `temp` in any directory |
| `!important.log` | Negation — track this exception |

If a file was already committed:

```bash
git rm --cached appsettings.Development.json
git commit -m "chore: stop tracking local settings"
```

Global ignore for all repos: `git config --global core.excludesfile ~/.gitignore_global`

## How do you configure Git (user, editor, defaults)?

```bash
git config --global user.name "Jane Doe"
git config --global user.email "jane@company.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"
git config --global pull.rebase false    # merge on pull (default)
git config --global push.autoSetupRemote true

git config --list --show-origin          # where each setting came from
```

| Scope | Flag | Stored in |
|-------|------|-----------|
| **System** | `--system` | All users on machine |
| **Global** | `--global` | `~/.gitconfig` |
| **Local** | `--local` | `.git/config` (per repo) |

Repo-specific email (e.g. work vs personal):

```bash
cd ~/work/project
git config user.email "jane@company.com"
```

## What is the difference between `git switch` and `git checkout`?

Git 2.23+ split responsibilities:

| Task | Modern command | Legacy |
|------|----------------|--------|
| Change branch | `git switch main` | `git checkout main` |
| Create + switch | `git switch -c feature/x` | `git checkout -b feature/x` |
| Restore file | `git restore file.ts` | `git checkout -- file.ts` |

```bash
git switch main
git switch -c hotfix/timeout
git restore --staged app.ts    # unstage
git restore app.ts             # discard working changes
```

`git checkout` still works everywhere — interviews may use either. Prefer **`switch`** / **`restore`** for clarity in new scripts and docs.

## Related Topics

- [Git Branching and Merging](Git%20Branching%20and%20Merging.md) — branches, merge vs rebase, conflicts
- [Git Remote and Collaboration](Git%20Remote%20and%20Collaboration.md) — remotes, pull requests, fork workflow
- [Git Commands](Git%20Commands.md) — command cheat sheet reference
- [Azure DevOps Pipelines and CI-CD](../Azure%20DevOps/Azure%20DevOps%20Pipelines%20and%20CI-CD.md) — Git in CI/CD
