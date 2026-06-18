# Git Advanced and Troubleshooting

## Questions Covered

1. What is the difference between `git reset` and `git revert`?
2. What do `--soft`, `--mixed`, and `--hard` reset mean?
3. How does `git stash` work?
4. What is `git cherry-pick`, and when use it?
5. What is `git reflog`, and why is it a lifesaver?
6. How does `git bisect` find bugs?
7. What do `git blame` and `git log -S` help with?
8. How do you recover deleted branches or commits?
9. What are submodules and subtrees (brief)?
10. What are common Git mistakes and fixes?

## What is the difference between `git reset` and `git revert`?

| | **reset** | **revert** |
|---|-----------|------------|
| **Target** | Moves branch pointer | Creates new commit undoing a commit |
| **History** | Rewrites (if pushed, problematic) | Safe on shared branches |
| **Use when** | Local fix before push | Undo on `main` already pushed |

```bash
# reset — moves HEAD (local branch only, ideally)
git reset --soft HEAD~1     # undo commit, keep staged
git reset --mixed HEAD~1    # undo commit, unstage (default)
git reset --hard HEAD~1     # undo commit, discard changes — DESTRUCTIVE

# revert — safe for shared history
git revert a1b2c3d          # new commit that undoes a1b2c3d
git revert HEAD~3..HEAD     # revert range (no commit yet)
```

**Interview answer:** Use **revert** on public/shared branches; use **reset** to fix local commits you haven't shared.

## What do `--soft`, `--mixed`, and `--hard` reset mean?

```text
Commit C (HEAD)
    │
    ▼ reset --soft   → HEAD at B, staging & working = C's changes staged
    ▼ reset --mixed  → HEAD at B, C's changes in working dir (unstaged)
    ▼ reset --hard   → HEAD at B, C's changes GONE
```

```bash
git reset --soft HEAD~1       # amend-style: recommit differently
git reset HEAD file.ts        # unstage (mixed reset on one file)
git reset --hard origin/main  # match remote exactly — discard local
```

| Mode | HEAD | Staging | Working dir |
|------|------|---------|-------------|
| `--soft` | Moves | Unchanged | Unchanged |
| `--mixed` | Moves | Reset | Unchanged |
| `--hard` | Moves | Reset | Reset |

## How does `git stash` work?

**Stash** temporarily shelves uncommitted changes for a clean working tree.

```bash
git stash                           # stash tracked changes
git stash -u                        # include untracked files
git stash push -m "WIP login form"  # named stash
git stash list
git stash show -p stash@{0}
git stash pop                       # apply latest + remove from list
git stash apply stash@{1}           # apply, keep in list
git stash drop stash@{0}
git stash clear
```

Common pattern — switch branches with dirty tree:

```bash
git stash
git switch hotfix/urgent
# fix, commit, push
git switch feature/x
git stash pop    # may conflict — resolve like merge
```

Create branch from stash:

```bash
git stash branch recover-work stash@{0}
```

## What is `git cherry-pick`, and when use it?

**Cherry-pick** applies a specific commit's changes onto the current branch.

```bash
git cherry-pick a1b2c3d
git cherry-pick a1b2c3d e4f5g6h    # multiple commits
git cherry-pick -x a1b2c3d         # append "(cherry picked from ...)" to message
```

| Use case | Example |
|----------|---------|
| **Hotfix to release branch** | Pick security fix from `main` → `release/1.2` |
| **Recover one commit** | Bad rebase dropped a commit |
| **Backport** | Feature landed on `develop`, need on `main` |

On conflict:

```bash
# fix files
git add .
git cherry-pick --continue
git cherry-pick --abort
```

## What is `git reflog`, and why is it a lifesaver?

**Reflog** records where HEAD and branch tips have been — even after "lost" commits.

```bash
git reflog
# a1b2c3d HEAD@{0}: commit: feat: add cache
# e4f5g6h HEAD@{1}: reset: moving to HEAD~1
# i7j8k9l HEAD@{2}: commit: oops wrong branch

git reset --hard HEAD@{2}          # recover before bad reset
git branch recovered i7j8k9l       # branch from lost commit
```

| Situation | reflog helps |
|-----------|--------------|
| `git reset --hard` too far | Find previous HEAD |
| Deleted branch | Find tip commit hash |
| Failed rebase | Return to pre-rebase state |

Reflog entries expire (default ~90 days) — act soon after mistakes.

## How does `git bisect` find bugs?

**Binary search** through commit history to find the first bad commit.

```bash
git bisect start
git bisect bad                  # current commit is broken
git bisect good v1.0.0          # this tag/ commit worked

# Git checks out middle commit — test manually:
git bisect good                 # or: git bisect bad
# repeat until Git prints the culprit commit

git bisect reset                # return to original branch
```

Automated bisect with test script:

```bash
git bisect start HEAD v1.0.0
git bisect run npm test         # exit 0 = good, 1-125 = bad, 125+ = skip
```

| Step | Action |
|------|--------|
| 1 | Mark known good and bad endpoints |
| 2 | Git checks out midpoint |
| 3 | You (or script) mark good/bad |
| 4 | ~log₂(n) steps for n commits |

## What do `git blame` and `git log -S` help with?

**Blame** — who last changed each line:

```bash
git blame src/app.ts
git blame -L 40,60 src/app.ts       # lines 40-60 only
git blame -w src/app.ts             # ignore whitespace
```

**Pickaxe (`-S`)** — find commits that added/removed a string:

```bash
git log -S "GetUserById" --oneline
git log -G "regex.*pattern" -p      # regex pickaxe
```

| Command | Question it answers |
|---------|---------------------|
| `git blame` | Who introduced this line? |
| `git log -S` | Which commit added/removed this function? |
| `git log --follow file.ts` | History across renames |

## How do you recover deleted branches or commits?

```bash
# 1. reflog — find commit hash
git reflog
git branch recovered-branch a1b2c3d

# 2. if you know the hash from GitHub/Azure DevOps UI
git fetch origin
git branch recovered origin/feature/x   # if remote still has it

# 3. recover deleted file from last commit
git restore --source=HEAD~1 -- path/to/file.ts
git checkout HEAD~1 -- path/to/file.ts   # legacy syntax
```

```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Undo last commit and discard changes
git reset --hard HEAD~1    # only if sure — use reflog safety net
```

## What are submodules and subtrees (brief)?

For **nested repositories** inside a repo:

| | **Submodule** | **Subtree** |
|---|---------------|-------------|
| **Model** | Pointer to external commit | External history merged in |
| **Clone** | Needs `git submodule update --init` | Single clone |
| **Update** | Explicit submodule bump | `git subtree pull` |
| **Complexity** | Higher — easy to forget init | Simpler for consumers |

```bash
# Submodule (common for shared libs)
git submodule add https://github.com/org/shared-lib.git libs/shared
git clone --recurse-submodules https://github.com/org/app.git

# Subtree (vendor code in monorepo)
git subtree add --prefix=vendor/lib lib-remote main --squash
```

**Interview:** Know submodules exist and `git clone --recurse-submodules`; many teams prefer package managers (npm, NuGet) over submodules.

## What are common Git mistakes and fixes?

| Mistake | Fix |
|---------|-----|
| Committed to wrong branch | `git stash`, switch branch, `stash pop`, commit |
| Commit message typo (not pushed) | `git commit --amend -m "correct message"` |
| Added wrong files to staging | `git restore --staged file` |
| Committed secret | Remove from history (`git filter-repo` / BFG), rotate secret, force push with team coordination |
| `merge --no-ff` by accident | `git reset --hard ORIG_HEAD` if just merged (local) |
| Can't push — non-FF | `git pull --rebase` then push |
| Detached HEAD commits | `git switch -c save-work` before they become unreachable |
| Large file in history | `git filter-repo`, add to `.gitignore` |

```bash
# Amend last commit to add forgotten file (not pushed)
git add forgotten.ts
git commit --amend --no-edit

# Remove file from Git but keep on disk
git rm --cached huge.zip
echo "*.zip" >> .gitignore
git commit -m "chore: stop tracking zip files"
```

**Emergency mantra:** `git reflog` first, `git reset --hard` last.

## Related Topics

- [Git Basics](Git%20Basics.md) — staging, commits, config
- [Git Branching and Merging](Git%20Branching%20and%20Merging.md) — rebase, conflicts
- [Git Remote and Collaboration](Git%20Remote%20and%20Collaboration.md) — push, PR, tags
- [Git Commands](Git%20Commands.md) — full command reference
- [Bash System and DevOps Commands](../Bash/Bash%20System%20and%20DevOps%20Commands.md)
