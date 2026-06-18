# Bash Basics

## Questions Covered

1. What is Bash, and where is it used?
2. What is the difference between Bash, sh, and PowerShell?
3. How do you navigate the filesystem?
4. What are essential file and directory commands?
5. How do you view and edit file contents?
6. What are file permissions and chmod?
7. What are hard links vs symbolic links?
8. What are environment variables and PATH?
9. What is the difference between single and double quotes?
10. What are glob patterns and wildcards?
11. How does Bash work on Windows (WSL, Git Bash)?
12. What are useful Bash shortcuts and history tips?

## What is Bash, and where is it used?

**Bash** (Bourne Again Shell) is a **command-line shell and scripting language** on Linux, macOS, and Windows (via WSL/Git Bash). It interprets commands you type and runs scripts for automation.

| Where you use Bash | Example |
|--------------------|---------|
| **Linux servers** | Deploy apps, tail logs, restart services |
| **Docker containers** | `ENTRYPOINT` scripts, health checks |
| **CI/CD pipelines** | Azure Pipelines `script:`, GitHub Actions `run:` |
| **Kubernetes** | Init containers, debug pods with `kubectl exec` |
| **Mac terminal** | Default shell (or zsh with bash compatibility) |

```text
User types: ls -la /var/log
Shell:      parses → finds /bin/ls → exec with args → prints output
Script:     same commands in .sh file, run by bash interpreter
```

**Interview context:** DevOps and cloud roles expect you to read/write basic Bash for pipelines and server troubleshooting — not replace PowerShell on Windows for AD tasks, but essential for Linux containers and CI.

## What is the difference between Bash, sh, and PowerShell?

| Shell | Platform | Style |
|-------|----------|-------|
| **Bash** | Linux, macOS, WSL | POSIX + extensions; `#!/bin/bash` |
| **sh** | Unix minimal | POSIX only; use `#!/bin/sh` for max portability |
| **PowerShell** | Windows cross-platform | Objects in pipeline, not just text |
| **zsh** | macOS default | Bash-like with extras |

```bash
#!/bin/bash
# Bash-only features: arrays, [[ ]], process substitution
echo "Hello from Bash"
```

**Shebang rule:** First line `#!/bin/bash` tells OS which interpreter runs the script. Use `#!/usr/bin/env bash` for portability across paths.

For **Docker Alpine**, `/bin/sh` is often `ash` — avoid bashisms in minimal images unless you install bash.

## How do you navigate the filesystem?

```bash
pwd                          # print working directory
cd /var/www                  # absolute path
cd ../..                     # up two levels
cd ~                         # home directory
cd -                         # previous directory
ls -la                       # list all, long format, human sizes
ls -lhS                      # sort by size
tree -L 2                    # tree view (if installed)
```

| Path type | Example |
|-----------|---------|
| **Absolute** | `/home/user/app` — from root |
| **Relative** | `../config/app.yml` — from current dir |
| **Home** | `~/projects` → `/home/user/projects` |
| **Current** | `./script.sh` |

**Tab completion** — press Tab to autocomplete paths and commands. **Ctrl+R** — reverse search command history.

## What are essential file and directory commands?

```bash
mkdir -p app/logs            # create nested dirs (-p = no error if exists)
cp file.txt backup.txt
cp -r src/ dest/             # recursive copy
mv old.txt new.txt           # rename or move
rm file.txt
rm -rf build/                # recursive force — DANGEROUS, double-check path
touch app.log                # create empty file or update timestamp
```

| Command | Purpose |
|---------|---------|
| `mkdir -p` | Create parent directories as needed |
| `cp -a` | Archive mode — preserve permissions, timestamps |
| `mv` | Move/rename (same filesystem = fast rename) |
| `rm -i` | Interactive confirm before delete |
| `find . -name "*.log"` | Find files by name |

**Safety:** Never run `rm -rf /` or `rm -rf /*`. In scripts, quote variables: `rm -rf "$TARGET_DIR"`.

## How do you view and edit file contents?

```bash
cat config.yml               # dump entire file (small files only)
less /var/log/syslog         # paginated view (q to quit, / to search)
head -n 20 app.log           # first 20 lines
tail -n 50 app.log           # last 50 lines
tail -f app.log              # follow live log (Ctrl+C to stop)
wc -l file.txt               # line count
file binary.exe              # detect file type
```

**Editors in terminal:**
- `nano file.txt` — beginner-friendly
- `vim file.txt` — ubiquitous on servers
- Prefer editing locally + git push for production config changes

```bash
# Create file with heredoc
cat << 'EOF' > deploy.env
NODE_ENV=production
PORT=8080
EOF
```

Quoted `'EOF'` prevents variable expansion inside heredoc.

## What are file permissions and chmod?

Unix permissions: **owner**, **group**, **others** — each **r**ead, **w**rite, **e**xecute:

```bash
ls -l script.sh
# -rwxr-xr-- 1 user group 1234 Jun 17 10:00 script.sh
#  ^^^ ^^^ ^^^
#  owner group other
```

| Numeric | Meaning |
|---------|---------|
| 4 | read (r) |
| 2 | write (w) |
| 1 | execute (x) |
| 7 | r+w+x (4+2+1) |
| 5 | r+x |
| 6 | r+w |

```bash
chmod 755 script.sh          # rwxr-xr-x
chmod +x script.sh           # add execute for all
chmod u+w file.txt           # user write
chown user:group file.txt    # change owner (needs root)
```

**Scripts must be executable** to run as `./deploy.sh` — or invoke with `bash deploy.sh` (no chmod needed).

## What are hard links vs symbolic links?

```bash
ln file.txt hardlink.txt     # hard link — same inode
ln -s /etc/nginx/nginx.conf nginx.conf   # symlink
ls -la                       # symlinks show -> target
```

| | **Hard link** | **Symbolic link** |
|--|---------------|-------------------|
| **Target** | Same file data | Path pointer |
| **Cross filesystem** | No | Yes |
| **Broken if original deleted** | Data remains | Link breaks |

Use **symlinks** for config aliases (`current` → `releases/20250617`).

## What are environment variables and PATH?

```bash
echo $HOME
echo $PATH
export APP_ENV=production
export DATABASE_URL="postgres://localhost/db"

# Persist in ~/.bashrc or ~/.bash_profile
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

| Variable | Typical use |
|----------|-------------|
| `$HOME` | User home directory |
| `$PATH` | Colon-separated dirs searched for executables |
| `$USER` | Current username |
| `$?` | Exit code of last command (0 = success) |
| `$1`, `$2` | Script arguments |

**PATH order matters** — first match wins. Don't prepend untrusted directories to PATH.

## What is the difference between single and double quotes?

```bash
name="Contoso"
echo "Hello $name"      # Hello Contoso — variables expand
echo 'Hello $name'      # Hello $name — literal
echo "Price: \$9.99"    # escape with backslash
```

| Quote | Variable `$` | Command `` ` `` / `$()` |
|-------|--------------|-------------------------|
| `"double"` | Expands | Expands |
| `'single'` | Literal | Literal |

Use `"$variable"` in scripts — prevents word splitting on spaces in filenames.

## What are glob patterns and wildcards?

```bash
ls *.log                   # all .log files
ls app-{dev,staging}.yml   # brace expansion
ls file?.txt               # ? = single char
ls [abc]*.sh               # character class
shopt -s extglob           # extended globs
rm !(important).tmp        # all .tmp except important.tmp
```

**Glob vs regex:** Globs match filenames; `grep` uses regex on file *contents*.

Quote globs when you want literal pass-through: `ssh host 'ls *.log'`.

## How does Bash work on Windows (WSL, Git Bash)?

| Option | Use |
|--------|-----|
| **WSL2** | Full Linux kernel — best for Docker, real Bash |
| **Git Bash** | Lightweight — git + basic Unix tools on Windows |
| **PowerShell** | Native Windows — different syntax |

```bash
# WSL — access Windows files
cd /mnt/c/Users/Hello/projects

# Line endings — critical for scripts
dos2unix script.sh         # fix CRLF → LF
```

**CI on Windows agents:** Azure Pipelines may run `bash` step on `ubuntu-latest` (Linux) or use Git Bash on `windows-latest`. Prefer **Linux agents** for shell scripts in CI.

## What are useful Bash shortcuts and history tips?

| Shortcut | Action |
|----------|--------|
| **Ctrl+C** | Cancel current command |
| **Ctrl+D** | EOF / exit shell |
| **Ctrl+L** | Clear screen |
| **Ctrl+R** | Search history |
| **!!** | Repeat last command |
| **!$** | Last argument of previous command |
| **Tab** | Autocomplete |

```bash
history | grep docker
!!                         # run last command again
sudo !!                    # re-run last with sudo
```

```bash
# ~/.bashrc — useful options
shopt -s histappend        # append to history file
export HISTSIZE=10000
export HISTCONTROL=ignoredups
```

## Related Topics

- Bash/Bash Text Processing and Pipes.md
- Bash/Bash Shell Scripting.md
- Bash/Bash System and DevOps Commands.md
- Docker/Docker Basics.md
- Git/Git Commands.md
