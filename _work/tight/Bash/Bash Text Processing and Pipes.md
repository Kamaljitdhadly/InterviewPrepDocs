# Bash Text Processing and Pipes

## Questions Covered

1. What are stdin, stdout, and stderr?
2. How do redirection and pipes work?
3. How do you use grep effectively?
4. What are sed basics for find-and-replace?
5. What are awk basics for column processing?
6. How do you use sort, uniq, and cut?
7. How do you use xargs?
8. How do you chain commands in pipelines?
9. What are here documents and here strings?
10. How do you process JSON and YAML in Bash?
11. What are common text processing interview patterns?
12. What pitfalls should you avoid in Bash pipelines?

## What are stdin, stdout, and stderr?

Every command has three standard streams:

| Stream | FD | Default | Purpose |
|--------|-----|---------|---------|
| **stdin** | 0 | Keyboard | Input |
| **stdout** | 1 | Terminal | Normal output |
| **stderr** | 2 | Terminal | Error messages |

```bash
command > out.txt           # stdout to file (overwrite)
command >> out.txt          # stdout append
command 2> err.txt          # stderr to file
command > all.txt 2>&1      # both stdout and stderr to file
command &> all.txt          # bash shorthand for above
command 2>/dev/null         # discard errors
```

**Exit code:** `$?` — `0` success, non-zero failure. Use in scripts: `if command; then ...`

## How do redirection and pipes work?

**Pipe** — connect stdout of one command to stdin of next:

```bash
cat access.log | grep "POST" | grep " 500 " | wc -l
```

```text
access.log → grep POST → grep 500 → wc -l → prints count
```

**Process substitution** — treat command output as file:

```bash
diff <(sort file1.txt) <(sort file2.txt)
```

**Tee** — write to file and stdout:

```bash
deploy.sh 2>&1 | tee deploy.log
```

| Operator | Meaning |
|----------|---------|
| `\|` | Pipe stdout |
| `>` / `>>` | Redirect stdout |
| `2>` | Redirect stderr |
| `<` | Redirect stdin from file |
| `\|`& | Pipe stdout + stderr (bash) |

## How do you use grep effectively?

**grep** searches **line by line** for patterns in text:

```bash
grep "error" app.log
grep -i "error" app.log              # case insensitive
grep -r "TODO" src/                  # recursive
grep -n "function" script.sh         # line numbers
grep -v "debug" app.log              # invert — lines NOT matching
grep -E "error|warn|fatal" app.log   # extended regex (egrep)
grep -c "404" access.log             # count matching lines
grep -A 3 -B 2 "Exception" app.log   # context after/before
```

```bash
# Practical — find failed CI lines
grep -E "FAILED|ERROR" pipeline.log | tail -20

# Filter docker ps
docker ps | grep nginx
```

**ripgrep (`rg`)** — faster modern alternative, respects `.gitignore`. Mention in interviews if you use it locally; servers may only have grep.

## What are sed basics for find-and-replace?

**sed** — stream editor, transforms text line-by-line:

```bash
sed 's/old/new/' file.txt              # replace first per line
sed 's/old/new/g' file.txt             # global per line
sed -i 's/debug/info/g' config.yml     # in-place edit (GNU sed)
sed -i.bak 's/old/new/g' file.txt      # backup original as .bak
sed -n '10,20p' file.txt               # print lines 10-20 only
sed '/^#/d' config.txt                 # delete comment lines
```

```bash
# Replace env placeholder in template
sed "s/{{VERSION}}/$BUILD_ID/g" deployment.yaml
```

**Mac vs Linux:** macOS `sed -i` requires `sed -i '' 's/.../'` — extension argument differs. CI usually runs GNU sed on Ubuntu.

## What are awk basics for column processing?

**awk** — column-oriented processing (great for logs):

```bash
# Print 1st and 7th column of access log
awk '{ print $1, $7 }' access.log

# Sum numeric column
awk '{ sum += $3 } END { print sum }' data.txt

# Filter rows where column 9 is 500
awk '$9 == 500 { print $0 }' access.log

# CSV-ish with custom delimiter
awk -F',' '{ print $2 }' users.csv
```

```bash
# Top IP addresses in access log
awk '{ print $1 }' access.log | sort | uniq -c | sort -rn | head -10
```

**Pattern:** `awk '/regex/ { action }'` — filter + process in one pass.

## How do you use sort, uniq, and cut?

```bash
sort file.txt
sort -n numbers.txt          # numeric sort
sort -k2 -t',' data.csv      # sort by 2nd field, comma delimiter
sort -u file.txt             # unique sorted lines

uniq file.txt                # remove adjacent duplicates only!
sort file.txt | uniq         # correct unique count pattern
sort file.txt | uniq -c      # count occurrences

cut -d',' -f1,3 users.csv    # fields 1 and 3
cut -c1-10 file.txt          # characters 1-10
```

**Classic pipeline — top 10 URLs:**

```bash
awk '{ print $7 }' access.log | sort | uniq -c | sort -rn | head -10
```

## How do you use xargs?

**xargs** builds commands from stdin — runs one arg per line (or batches):

```bash
find . -name "*.tmp" -print0 | xargs -0 rm
echo "file1 file2 file3" | xargs -n1 wc -l
cat hosts.txt | xargs -I{} ping -c 1 {}
```

| Flag | Purpose |
|------|---------|
| `-0` | Null-separated input (use with `find -print0`) |
| `-n1` | One argument per command invocation |
| `-I{}` | Replace `{}` with input item |
| `-P4` | Parallel — 4 processes |

**Safe delete:**

```bash
find . -name "*.log" -mtime +30 -print0 | xargs -0 rm -f
```

Avoid `find ... | xargs rm` without `-print0` — breaks on filenames with spaces.

## How do you chain commands in pipelines?

```bash
# Conditional execution
command1 && command2         # run command2 if command1 succeeds
command1 || command2         # run command2 if command1 fails
command1 ; command2          # always run both sequentially

# Group subshell
(cd /tmp && ./build.sh)      # cd doesn't affect parent shell

# Command substitution
today=$(date +%Y-%m-%d)
files=$(ls *.log | wc -l)
echo "Logs today: $files on $today"
```

**Practical deploy chain:**

```bash
dotnet test && dotnet publish -c Release -o ./publish && \
  docker build -t myapp:$BUILD_ID . && \
  docker push myapp:$BUILD_ID
```

Stop on first failure with `set -e` in scripts (see Shell Scripting doc).

## What are here documents and here strings?

**Heredoc** — multiline input:

```bash
cat << EOF > nginx.conf
server {
  listen 80;
  root /var/www;
}
EOF

# Run SQL
psql "$DATABASE_URL" << SQL
SELECT count(*) FROM orders;
SQL
```

**Here string:**

```bash
grep "pattern" <<< "$variable_content"
```

Quote delimiter (`<< 'EOF'`) to disable expansion; unquoted `EOF` expands `$variables`.

## How do you process JSON and YAML in Bash?

Raw Bash is poor at JSON — use CLI tools:

```bash
# jq — JSON (install in CI: apt install jq)
cat package.json | jq '.version'
echo '{"name":"app"}' | jq -r '.name'
curl -s api/users/1 | jq '.email'

# yq — YAML
yq '.spec.replicas' deployment.yaml
yq -i '.spec.replicas = 3' deployment.yaml
```

```bash
# Without jq — fragile, avoid in production
grep -o '"version": "[^"]*"' package.json
```

**Azure CLI / kubectl** output JSON — pipe to `jq` for scripting:

```bash
az account show | jq -r '.id'
kubectl get pods -o json | jq '.items[].metadata.name'
```

## What are common text processing interview patterns?

| Task | Pipeline |
|------|----------|
| Count errors in log | `grep -c ERROR app.log` |
| Last 100 lines live | `tail -f app.log` |
| Disk usage by folder | `du -sh */ \| sort -hr \| head` |
| Find large files | `find . -type f -size +100M` |
| Parse CSV column | `cut -d',' -f2 data.csv` |
| HTTP 5xx count | `awk '$9 ~ /^5/ { c++ } END { print c }' access.log` |

Explain **why pipes matter:** composable small tools, no monolithic script, Unix philosophy.

## What pitfalls should you avoid in Bash pipelines?

| Pitfall | Fix |
|---------|-----|
| Unquoted `$var` with spaces | Always `"$var"` |
| `uniq` without `sort` | Sort first |
| `find \| xargs rm` on weird filenames | `find -print0 \| xargs -0` |
| Pipe hides exit code | `set -o pipefail` in scripts |
| Parsing JSON with grep/sed | Use `jq` |
| Huge file through multiple pipes | Consider `awk` single pass |

```bash
set -o pipefail    # pipeline fails if any command fails
set -e             # exit on error
```

## Related Topics

- Bash/Bash Basics.md
- Bash/Bash Shell Scripting.md
- Bash/Bash System and DevOps Commands.md
- Kubernetes/Kubernetes Basics.md
