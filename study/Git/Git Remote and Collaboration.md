# Git Remote and Collaboration

## Questions Covered

1. What is a remote, and how does `origin` work?
2. What is the difference between `fetch`, `pull`, and `push`?
3. What are tracking branches and upstream?
4. How does the fork and pull request workflow work?
5. What is `git push --force-with-lease`?
6. How do you sync a fork with upstream?
7. What are Git hooks, and which matter in teams?
8. How do you use tags for releases?
9. What is a shallow clone, and when use it?
10. How does Git integrate with CI/CD pipelines?

## What is a remote, and how does `origin` work?

A **remote** is a named reference to another repository (usually on a server). **`origin`** is the default name for the repo you cloned from.

```bash
git remote -v
# origin  https://github.com/org/app.git (fetch)
# origin  https://github.com/org/app.git (push)

git remote add upstream https://github.com/org/app.git
git remote rename origin old-origin
git remote remove upstream
git remote show origin
```

| Remote | Typical use |
|--------|-------------|
| **origin** | Your fork or team's canonical repo |
| **upstream** | Original project when you forked |
| **deploy** | Second remote for deployment pushes |

```bash
# Add SSH remote (preferred for frequent push)
git remote set-url origin git@github.com:you/app.git
```

## What is the difference between `fetch`, `pull`, and `push`?

```text
fetch:  remote ──download──►  origin/main (remote-tracking branch)
                              working tree unchanged

pull:   fetch + merge (or rebase) into current branch

push:   local commits ──upload──► remote branch
```

```bash
git fetch origin                    # update all remote-tracking refs
git fetch origin main               # update origin/main only
git pull origin main                # fetch + merge origin/main → current
git pull --rebase origin main       # fetch + rebase onto origin/main
git push origin feature/login       # publish local branch
git push -u origin feature/login    # push + set upstream
```

| Command | Modifies working tree? | Modifies local branches? |
|---------|---------------------|--------------------------|
| `fetch` | No | Only remote-tracking refs (`origin/*`) |
| `pull` | Yes (after merge/rebase) | Yes — current branch |
| `push` | No | No (updates remote) |

**Best practice:** `git fetch` + review (`git log origin/main..HEAD`) before merge/rebase — especially on shared branches.

## What are tracking branches and upstream?

A **tracking branch** links your local branch to a remote branch. Git uses it for `git pull`, `git push`, and status hints.

```bash
git push -u origin feature/x       # sets upstream
git branch -vv                     # show tracking info
# * feature/x  a1b2c3d [origin/feature/x] feat: oauth

git push                           # pushes to upstream if set
git pull                           # pulls from upstream
```

Set upstream on existing branch:

```bash
git branch --set-upstream-to=origin/main main
git switch main && git pull
```

Detached HEAD (not on a branch) — common after checking out a tag or remote commit:

```bash
git switch main                    # return to branch
# or create branch from detached state:
git switch -c fix-from-tag
```

## How does the fork and pull request workflow work?

Standard open-source and many enterprise flows:

```text
1. Fork repo on GitHub/GitLab/Azure DevOps
2. git clone your-fork
3. git remote add upstream original-repo
4. git switch -c feature/xyz
5. commit + push to your fork
6. Open Pull Request: your-fork/feature/xyz → upstream/main
7. Code review, CI runs, merge
8. Delete branch, pull latest main
```

```bash
git clone git@github.com:you/app.git
cd app
git remote add upstream git@github.com:org/app.git

git switch -c feature/add-cache
# ... commits ...
git push -u origin feature/add-cache
# Open PR in browser

# After merge, clean up
git switch main
git pull upstream main
git push origin main
git branch -d feature/add-cache
git push origin --delete feature/add-cache
```

| PR practice | Why |
|-------------|-----|
| Small, focused PRs | Faster review |
| Link ticket/issue | Traceability |
| Require CI green | Catch regressions |
| Squash merge for features | Clean `main` history |

## What is `git push --force-with-lease`?

After **rebase** on a feature branch, history rewrites — normal push is rejected. Force push overwrites remote branch tip.

```bash
git push --force-with-lease origin feature/x
```

| Flag | Behavior |
|------|----------|
| `--force` | Overwrite remote unconditionally — dangerous |
| `--force-with-lease` | Overwrite only if remote matches your last `fetch` |

**Never** force-push `main`, `develop`, or any branch teammates commit to directly.

## How do you sync a fork with upstream?

```bash
git fetch upstream
git switch main
git merge upstream/main          # or: git rebase upstream/main
git push origin main             # update your fork's main
```

For feature branches behind `main`:

```bash
git switch feature/x
git fetch upstream
git rebase upstream/main
git push --force-with-lease origin feature/x
```

Azure DevOps / GitHub also offer **"Sync fork"** UI — same result as fetch + merge upstream.

## What are Git hooks, and which matter in teams?

**Hooks** are scripts Git runs at lifecycle events (`.git/hooks/` or shared via tools like Husky).

| Hook | When | Team use |
|------|------|----------|
| **pre-commit** | Before commit | Lint, format, secret scan |
| **commit-msg** | After message entered | Enforce Conventional Commits |
| **pre-push** | Before push | Run unit tests |
| **post-merge** | After merge | `npm install` if lockfile changed |

```bash
# Example pre-commit (conceptual — often via Husky)
#!/bin/sh
dotnet format --verify-no-changes || exit 1
```

Server-side hooks (on GitHub/Azure DevOps) enforce policy even if developers skip local hooks.

## How do you use tags for releases?

**Tags** mark specific commits — usually releases.

```bash
git tag                          # list tags
git tag v1.2.0                   # lightweight tag
git tag -a v1.2.0 -m "Release 1.2.0"   # annotated (preferred)
git push origin v1.2.0
git push origin --tags           # push all tags

git checkout v1.2.0              # detached HEAD at tag
git switch -c hotfix/1.2.1 v1.2.0
```

| Type | Stored | Use |
|------|--------|-----|
| **Lightweight** | Pointer to commit | Quick local markers |
| **Annotated** | Tag object + message + signer | Releases, CI triggers |

CI often triggers on tag push:

```yaml
# GitHub Actions pattern
on:
  push:
    tags: ['v*']
```

## What is a shallow clone, and when use it?

**Shallow clone** limits history depth — faster CI and large monorepos.

```bash
git clone --depth 1 https://github.com/org/huge-repo.git
git fetch --depth 100 origin main
git fetch --unshallow              # get full history if needed
```

| Scenario | Depth |
|----------|-------|
| CI build only needs latest | `--depth 1` |
| Need recent history for blame/bisect | `--depth 50` or more |
| Full archaeology | full clone |

Trade-off: shallow repos can't push to some refs without `git fetch --unshallow`.

## How does Git integrate with CI/CD pipelines?

Git is the **trigger and artifact source** for pipelines:

```text
push/PR ──► webhook ──► pipeline
              │
              ├── checkout (clone/fetch)
              ├── build & test
              ├── version from tag or sha
              └── deploy artifact tagged with commit hash
```

```yaml
# Azure Pipelines — checkout and build
steps:
  - checkout: self
    fetchDepth: 1
  - script: dotnet build
  - script: dotnet test
```

| Concept | Git tie-in |
|---------|------------|
| **Build ID** | Often `$(Build.SourceVersion)` = commit SHA |
| **PR validation** | Pipeline on `refs/pull/*/merge` |
| **Release** | Tag `v1.0.0` triggers deploy stage |
| **Immutable deploy** | Image `myapp:abc123def` from `git rev-parse --short HEAD` |

```bash
# Useful in pipeline scripts
export GIT_SHA=$(git rev-parse --short HEAD)
export GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
```

## Related Topics

- [Git Basics](Git%20Basics.md) — local workflow, commits
- [Git Branching and Merging](Git%20Branching%20and%20Merging.md) — merge, rebase, PR branches
- [Git Advanced and Troubleshooting](Git%20Advanced%20and%20Troubleshooting.md) — undo, stash, cherry-pick
- [Azure DevOps Pipelines and CI-CD](../Azure%20DevOps/Azure%20DevOps%20Pipelines%20and%20CI-CD.md)
- [Bash Basics](../Bash/Bash%20Basics.md) — shell skills for pipeline scripts
