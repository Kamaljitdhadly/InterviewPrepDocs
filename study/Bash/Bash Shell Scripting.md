# Bash Shell Scripting

## Questions Covered

1. What makes a valid Bash script?
2. What are set -e, set -u, and pipefail?
3. How do you use variables and quoting in scripts?
4. How do you read command-line arguments?
5. How do if/else and test expressions work?
6. How do for, while, and until loops work?
7. How do you write and call functions?
8. How do you handle errors and exit codes?
9. How do you debug Bash scripts?
10. How do you parse arguments with getopts?
11. What are common Bash scripting best practices?
12. How do you write scripts for CI/CD pipelines?

## What makes a valid Bash script?

A Bash script is a text file with commands executed sequentially by the Bash interpreter:

```bash
#!/usr/bin/env bash
# deploy.sh — deploy application to staging

set -euo pipefail
IFS=$'\n\t'

APP_NAME="contoso-api"
ENV="${1:-staging}"

echo "Deploying $APP_NAME to $ENV..."
dotnet publish -c Release -o ./publish
echo "Done."
```

| Step | Action |
|------|--------|
| 1 | Create `deploy.sh` |
| 2 | `chmod +x deploy.sh` (optional if using `bash deploy.sh`) |
| 3 | Run `./deploy.sh staging` |

**Shebang:** `#!/usr/bin/env bash` finds bash in PATH — more portable than `#!/bin/bash` on some systems.

## What are set -e, set -u, and pipefail?

**Defensive script header** — fail fast, catch bugs early:

```bash
set -e          # exit immediately if any command fails (non-zero)
set -u          # error on undefined variables
set -o pipefail # pipeline fails if ANY command in pipe fails
set -o errexit nounset pipefail   # combined shorthand in some scripts
```

```bash
# Without set -u
echo $UNDEFINED_VAR    # prints empty — silent bug

# With set -u
echo $UNDEFINED_VAR    # bash: UNDEFINED_VAR: unbound variable
```

**When set -e is tricky:** Commands in `if`, `||`, `&&` may not trigger exit. Use explicit checks for critical paths:

```bash
if ! dotnet test; then
  echo "Tests failed"
  exit 1
fi
```

## How do you use variables and quoting in scripts?

```bash
name="Contoso Shop"
count=42
readonly DEPLOY_TOKEN="abc123"    # cannot reassign

# Always quote expansions
rm -rf "$BUILD_DIR"
cp "$src" "$dest"

# Command substitution
version=$(git describe --tags --always)
today=$(date +%Y-%m-%d)

# Arithmetic
total=$((count + 1))
(( count++ ))

# Arrays
servers=("web1" "web2" "web3")
echo "${servers[0]}"
echo "${#servers[@]}"              # length
for s in "${servers[@]}"; do echo "$s"; done
```

| Practice | Why |
|----------|-----|
| `"$var"` | Prevents word splitting |
| `'$var'` | Literal — no expansion |
| `${var:-default}` | Default if unset or empty |
| `${var:?message}` | Exit with error if unset |

## How do you read command-line arguments?

```bash
#!/usr/bin/env bash
# usage: ./deploy.sh -e prod -v 1.2.3

ENV="staging"
VERSION=""

while getopts "e:v:h" opt; do
  case $opt in
    e) ENV="$OPTARG" ;;
    v) VERSION="$OPTARG" ;;
    h) echo "Usage: $0 -e env -v version"; exit 0 ;;
    *) exit 1 ;;
  esac
done

shift $((OPTIND - 1))    # remaining positional args
echo "Env: $ENV, Version: $VERSION, Extra: $*"
```

**Positional parameters:**

| Variable | Meaning |
|----------|---------|
| `$0` | Script name |
| `$1`, `$2`, ... | Arguments |
| `$#` | Argument count |
| `$@` | All args as separate quoted strings |
| `$*` | All args as single string |

```bash
./script.sh arg1 arg2
# $1=arg1, $2=arg2
```

## How do if/else and test expressions work?

```bash
# File tests
if [ -f "config.yml" ]; then
  echo "Config exists"
fi

if [ -d "$BUILD_DIR" ] && [ -n "$VERSION" ]; then
  echo "Ready to deploy"
else
  echo "Missing build dir or version"
  exit 1
fi

# Numeric compare (use -eq, -lt, -gt for integers)
if [ "$count" -gt 0 ]; then
  echo "Has items"
fi

# Bash extended test [[ ]] — safer for strings
if [[ "$ENV" == "prod" && "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Valid prod deploy"
fi

# String empty test
if [ -z "$DEPLOY_TOKEN" ]; then
  echo "DEPLOY_TOKEN required"
  exit 1
fi
```

| Test | Meaning |
|------|---------|
| `-f file` | Regular file exists |
| `-d dir` | Directory exists |
| `-z "$s"` | String is empty |
| `-n "$s"` | String is non-empty |
| `-eq`, `-ne`, `-lt` | Integer compare in `[ ]` |

Use `[[ ]]` in Bash scripts; `[ ]` is POSIX portable.

## How do for, while, and until loops work?

```bash
# For — list
for file in logs/*.log; do
  gzip "$file"
done

for i in {1..5}; do
  echo "Attempt $i"
done

# C-style for
for (( i=0; i<10; i++ )); do
  echo $i
done

# While — read file line by line
while IFS= read -r line; do
  echo "Line: $line"
done < input.txt

# While — wait for service
until curl -sf http://localhost:8080/health; do
  echo "Waiting for app..."
  sleep 2
done
echo "App is up"
```

**Don't** use `for line in $(cat file)` — breaks on whitespace. Use `while read` loop.

## How do you write and call functions?

```bash
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

deploy_to() {
  local env="$1"
  local version="$2"
  log "Deploying $version to $env"
  # deploy commands...
}

log "Starting pipeline"
deploy_to "staging" "1.2.3"
```

| Keyword | Purpose |
|---------|---------|
| `local` | Variable scoped to function |
| `return N` | Exit function with code (default 0) |
| `$*` / `$@` | Function arguments |

**Export functions** for subshells: `export -f deploy_to` (rare).

## How do you handle errors and exit codes?

```bash
#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  echo "Cleaning up temp files..."
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT                    # run on script exit

TEMP_DIR=$(mktemp -d)

if ! docker build -t "app:$VERSION" .; then
  echo "Docker build failed" >&2
  exit 1
fi

# Explicit exit codes
exit 0    # success
exit 1    # general error
exit 2    # misuse (common convention)
```

| Mechanism | Use |
|-----------|-----|
| `$?` | Last command exit code |
| `exit N` | Terminate script with code |
| `trap cmd SIGNAL` | Run on EXIT, ERR, INT, TERM |
| `|| true` | Suppress failure (use sparingly) |

**CI:** Non-zero exit fails the pipeline step — ensure scripts `exit 1` on failure paths.

## How do you debug Bash scripts?

```bash
bash -x script.sh              # trace — print each command
bash -n script.sh              # syntax check only

# Inside script
set -x                         # enable trace
set +x                         # disable trace

# Debug function
debug() {
  [[ "${DEBUG:-}" == "1" ]] && echo "DEBUG: $*" >&2
}
debug "VERSION=$VERSION"
```

| Technique | When |
|-----------|------|
| `set -x` | See exact commands in CI logs |
| `shellcheck script.sh` | Static analysis — use locally |
| `echo "$var"` | Quick inspect (stderr preferred) |
| `trap 'echo "Failed at line $LINENO"' ERR` | Pinpoint failure line |

Run **ShellCheck** before commit — catches quoting, unused vars, deprecated syntax.

## How do you parse arguments with getopts?

See command-line arguments section — `getopts` handles flags:

```bash
while getopts ":e:v:h" opt; do
  case $opt in
    e) ENV="$OPTARG" ;;
    v) VERSION="$OPTARG" ;;
    h) usage; exit 0 ;;
    \?) echo "Invalid option: -$OPTARG" >&2; exit 1 ;;
    :) echo "Option -$OPTARG requires argument" >&2; exit 1 ;;
  esac
done
```

Leading `:` in `":e:v:h"` enables detection of missing required args.

For long options (`--env prod`), use `getopt` (GNU) or manual parsing:

```bash
for arg in "$@"; do
  case $arg in
    --env=*) ENV="${arg#*=}" ;;
    --help) usage; exit 0 ;;
  esac
done
```

## What are common Bash scripting best practices?

| Do | Don't |
|----|-------|
| `set -euo pipefail` at top | Silent failures |
| Quote `"$variables"` | Unquoted `$var` |
| Use `[[ ]]` in Bash | Old `[ ]` string bugs |
| `local` in functions | Global pollution |
| `mktemp -d` for temp dirs | Predictable `/tmp/myapp` |
| `shellcheck` in CI | 500-line unmaintainable scripts |
| Meaningful exit codes | Always `exit 0` on error |
| Log to stderr with `>&2` | Mix logs with pipe data |

```bash
# Prefer
if command -v docker >/dev/null 2>&1; then
  docker version
else
  echo "docker not found" >&2
  exit 1
fi
```

**When NOT to use Bash:** Complex logic, JSON APIs, cross-platform — use Python/Node/PowerShell instead. Bash excels at **glue** — orchestrating CLI tools.

## How do you write scripts for CI/CD pipelines?

**Azure Pipelines / GitHub Actions** typically run inline bash or call a script:

```yaml
# azure-pipelines.yml
- bash: |
    set -euo pipefail
    dotnet restore
    dotnet test --no-restore
    dotnet publish -c Release -o $(Build.ArtifactStagingDirectory)
  displayName: Build and test
```

```bash
#!/usr/bin/env bash
# ci/build.sh — called from pipeline
set -euo pipefail

: "${BUILD_CONFIGURATION:=Release}"
: "${ARTIFACT_DIR:?ARTIFACT_DIR must be set}"

dotnet test --configuration "$BUILD_CONFIGURATION"
dotnet publish -c "$BUILD_CONFIGURATION" -o "$ARTIFACT_DIR"
```

| CI tip | Detail |
|--------|--------|
| Use env vars from CI | `BUILD_BUILDID`, `GITHUB_SHA` |
| Fail fast | `set -e` |
| Don't assume interactive | No prompts; use `-y` flags |
| Idempotent | Safe to re-run |
| Pin tool versions | `dotnet`, `node` via pipeline setup tasks |

## Related Topics

- Bash/Bash Basics.md
- Bash/Bash Text Processing and Pipes.md
- Bash/Bash System and DevOps Commands.md
- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
- Docker/Docker Build and CICD Integration.md
