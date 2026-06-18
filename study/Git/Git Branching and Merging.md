# Git Branching and Merging

## Questions Covered

1. Why are branches central to Git workflows?
2. What are common branching strategies (Git Flow, GitHub Flow, trunk-based)?
3. How do you create, list, and delete branches?
4. What is a fast-forward merge vs a three-way merge?
5. What is merge vs rebase, and when use each?
6. How do you resolve merge conflicts?
7. What is interactive rebase (`git rebase -i`)?
8. What is squash merge, and when is it used?
9. What happens during a rebase conflict?
10. What is the golden rule of rebasing?

## Why are branches central to Git workflows?

Branches are **movable pointers** to commits. Creating a branch is instant and local — no server round-trip.

```text
main:     A ── B ── C
               \
feature:        D ── E
```

| Benefit | Example |
|---------|---------|
| **Isolation** | Feature work without breaking `main` |
| **Parallelism** | Multiple devs on different branches |
| **Review** | PR compares branch → target |
| **Release** | `release/1.2` stabilizes while `main` continues |

```bash
git branch                     # list local branches
git branch -a                  # include remotes
git switch -c feature/oauth    # create and switch
git switch main
git merge feature/oauth
git branch -d feature/oauth    # delete after merge
```

## What are common branching strategies (Git Flow, GitHub Flow, trunk-based)?

| Strategy | Branches | Best for |
|----------|----------|----------|
| **GitHub Flow** | `main` + short-lived feature branches | Web apps, continuous deploy |
| **Git Flow** | `main`, `develop`, `feature/*`, `release/*`, `hotfix/*` | Scheduled releases, enterprise |
| **Trunk-based** | `main` + very short branches (< 1 day) | High-velocity teams, feature flags |

```text
GitHub Flow:
  main ──●──●──●──●──●  (always deployable)
          \    /
           feature PR

Git Flow:
  main     ──●────────────●──  (releases)
  develop  ──●──●──●──●──●──
              \  /  \  /
            feature  release
```

**Interview tip:** Most modern teams use **GitHub Flow** or **trunk-based** with feature flags. Git Flow is still asked about for enterprise release trains.

## How do you create, list, and delete branches?

```bash
git branch feature/login           # create, stay on current
git switch -c feature/login        # create and switch
git switch feature/login           # switch to existing
git branch -m old-name new-name    # rename current branch
git branch -d feature/login        # safe delete (merged)
git branch -D feature/login        # force delete
git push origin --delete feature/login   # delete remote branch
```

| Flag | Meaning |
|------|---------|
| `-c` | Create branch (`switch -c`) |
| `-d` | Delete if fully merged |
| `-D` | Delete regardless of merge |
| `-u origin/branch` | Set upstream on push |

Track remote branch locally:

```bash
git fetch origin
git switch -c feature/x origin/feature/x    # track remote
git switch feature/x                        # if tracking already set
```

## What is a fast-forward merge vs a three-way merge?

**Fast-forward (FF):** Target branch tip moves forward — no merge commit. History stays linear.

```text
Before:  main: A──B
              \
         feature: C──D

After FF merge on main:  A──B──C──D  (main points to D)
```

**Three-way merge:** Diverged histories — Git creates a **merge commit** with two parents.

```text
Before:  main: A──B──E
              \
         feature: C──D

After:   A──B──E───M  (M merges E + D)
              \   /
               C─D
```

```bash
git switch main
git merge feature/x              # FF if possible
git merge --no-ff feature/x        # always create merge commit
git merge --squash feature/x       # one commit on main (see squash section)
```

| Type | When | History |
|------|------|---------|
| **FF** | No new commits on target since branch | Linear |
| **Three-way** | Both branches moved | Merge commit |
| **Squash** | Want one commit on target | Linear, loses branch commits on main |

## What is merge vs rebase, and when use each?

| | **Merge** | **Rebase** |
|---|-----------|------------|
| **History** | Preserves branch topology | Rewrites commits onto new base |
| **Merge commit** | Often yes (`--no-ff`) | No |
| **Safety on shared branches** | Safe | **Never rebase pushed/shared history** |
| **Typical use** | Integrate feature into `main` | Update feature branch with latest `main` |

```bash
# Merge feature into main
git switch main
git pull
git merge feature/x

# Rebase feature onto latest main (before PR)
git switch feature/x
git fetch origin
git rebase origin/main
# resolve conflicts if any, then:
git rebase --continue
git push --force-with-lease origin feature/x
```

```text
Merge:     main ──●──●──●──M
                    \     /
                     ●──●  feature

Rebase:    main ──●──●──●──●'──●''  (feature commits replayed)
```

**Rule of thumb:** Rebase **your local** feature branch to keep PR clean; **merge** into `main` (or squash-merge via PR UI). Never rebase `main` or branches others use.

## How do you resolve merge conflicts?

Conflict markers appear when Git can't auto-merge:

```text
<<<<<<< HEAD
const timeout = 5000;
=======
const timeout = 10000;
>>>>>>> feature/retry
```

```bash
git merge feature/x
# CONFLICT in app.ts
git status                      # lists unmerged files

# Edit files — remove markers, keep correct code
git add app.ts
git commit                      # completes merge (or rebase --continue)
```

| Tool | Command |
|------|---------|
| **Abort merge** | `git merge --abort` |
| **Abort rebase** | `git rebase --abort` |
| **Visual merge** | `git mergetool` |
| **See conflicted files** | `git diff --name-only --diff-filter=U` |

**Strategy tips:**
- Talk to the other author for overlapping logic changes
- Run tests after resolving
- For `package-lock.json` / `yarn.lock` — often regenerate rather than hand-merge

## What is interactive rebase (`git rebase -i`)?

Rewrites **local** commit history before sharing — squash, reorder, reword, drop.

```bash
git rebase -i HEAD~4    # last 4 commits
```

Editor opens:

```text
pick a1b2c3d feat: add login
pick e4f5g6h fix typo
pick i7j8k9l WIP debug
pick m0n1o2p feat: add logout

# Commands: pick, reword, edit, squash, fixup, drop
```

Common edits:

```text
pick a1b2c3d feat: add login
fixup e4f5g6h fix typo          # squash into previous, discard message
squash i7j8k9l WIP debug        # squash, combine messages
drop m0n1o2p feat: add logout   # remove commit
```

After rebase, push requires `--force-with-lease` (only on **your** feature branch).

## What is squash merge, and when is it used?

**Squash merge** combines all branch commits into **one** commit on the target branch.

```bash
git switch main
git merge --squash feature/x
git commit -m "feat: complete OAuth login flow"
```

| Pros | Cons |
|------|------|
| Clean linear history on `main` | Loses granular branch commit history on `main` |
| One revert undoes whole feature | Harder to bisect individual steps |

GitHub/GitLab **"Squash and merge"** button does this in the UI — common for feature PRs with messy WIP commits.

## What happens during a rebase conflict?

Rebase replays commits one-by-one. Each replay can conflict:

```bash
git rebase origin/main
# CONFLICT during replay of commit 2 of 5

# Fix files, then:
git add .
git rebase --continue

# Or skip this commit:
git rebase --skip

# Or abort entirely:
git rebase --abort
```

Unlike merge, you're resolving **per commit** during replay — can mean multiple conflict rounds. Use `git rebase -i` first to squash WIP commits and reduce pain.

## What is the golden rule of rebasing?

> **Never rebase commits that have been pushed to a shared branch others may have pulled.**

Rebasing rewrites commit hashes. If teammates based work on old hashes, history diverges painfully.

| Safe | Unsafe |
|------|--------|
| Rebase local commits before first push | Rebase `main` |
| Rebase your feature branch (you alone) | Rebase `develop` after team merged |
| `git push --force-with-lease` on your feature | Force push without lease |

`--force-with-lease` refuses to push if remote has new commits you haven't seen — safer than `--force`.

## Related Topics

- [Git Basics](Git%20Basics.md) — three areas, commits, staging
- [Git Remote and Collaboration](Git%20Remote%20and%20Collaboration.md) — PR workflow, pull/push
- [Git Advanced and Troubleshooting](Git%20Advanced%20and%20Troubleshooting.md) — cherry-pick, reflog, bisect
- [Azure DevOps Deployment Strategies](../Azure%20DevOps/Azure%20DevOps%20Deployment%20Strategies.md) — release branching
