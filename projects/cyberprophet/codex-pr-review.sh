#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-}"
REPO_DIR="${2:-}"
PRS="${3:-}"

command -v codex >/dev/null 2>&1 || { echo "codex not found"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "gh not found"; exit 1; }

[[ -n "$REPO" ]] || { echo "REPO is empty"; exit 1; }
[[ -n "$REPO_DIR" ]] || { echo "REPO_DIR is empty"; exit 1; }
[[ -n "$PRS" ]] || { echo "PRS is empty"; exit 1; }

cd "$REPO_DIR"

codex exec <<EOF
You are working in a GitHub repository and must EXECUTE pull request review using GitHub CLI.

Repository:
$REPO

Repository directory:
$REPO_DIR

Target PRs (one per line, format: "<number>: <title>"):
$PRS

Review outcomes:
- approve
- request-changes
- comment

Instructions:

0. Preparation:
   - Capture the current branch:
     ORIGINAL_BRANCH=\$(git branch --show-current 2>/dev/null || echo "main")
   - Fetch latest refs:
     git fetch --all --prune

1. Process ONLY the PR numbers listed in "Target PRs".

2. For each PR number:

   # 2-1. Clean working tree before checkout
   - Run:
     git reset --hard
     git clean -fd

   # 2-2. Checkout PR branch
   - Run:
     gh pr checkout <number>
   - This switches to the PR branch locally for accurate analysis.

   # 2-3. Load PR metadata
   - Run:
     gh pr view <number> -R $REPO --json title,body,author,baseRefName,headRefName,changedFiles,additions,deletions

   # 2-4. Load diff (base branch vs PR branch)
   - Run:
     gh pr diff <number> -R $REPO
   - This shows the exact changes between the base branch and the PR branch.

   # 2-5. (Optional) Run project checks if the tool is installed

   ## .NET project
   - If *.sln exists AND command "dotnet" is available:
       dotnet build --no-restore 2>&1 || true
       dotnet test 2>&1 || true

   ## Node project
   - If package.json exists AND command "npm" is available:
       npm test 2>&1 || true

   ## Flutter project
   - If pubspec.yaml exists AND command "flutter" is available:
       flutter analyze 2>&1 || true
       flutter test 2>&1 || true

   - If the required tool is not installed, skip the check and note it in the review.
   - If dependencies are not installed, do not attempt to install them.
     Note that checks could not fully run due to missing dependencies.

   # 2-6. Review decision rules

   Choose exactly ONE:

   - approve:
     * change is small and safe
     * no obvious bug risk
     * intent is clear and matches implementation

   - request-changes:
     * clear bug risk or broken logic
     * missing validation / null handling
     * security or data integrity concern
     * major mismatch between intent and code

   - comment:
     * generally acceptable but needs clarification
     * minor improvements suggested
     * uncertainty exists but not critical

   Safety rule:
   - If unsure -> choose comment
   - If risk exists -> choose request-changes
   - Be conservative

3. Analyze the diff and produce findings as inline code comments.

   For each finding, classify severity:
   - **P1** (🔴 High): bug risk, security, data integrity, broken logic
   - **P2** (🟡 Medium): missing validation, edge case, performance concern
   - **P3** (🟢 Low): style, naming, minor improvement suggestion

4. Build a JSON payload for the GitHub Pull Request Review API.

   The JSON must follow this exact structure:
   {
     "event": "<APPROVE|REQUEST_CHANGES|COMMENT>",
     "body": "## Review Summary\n- Outcome: <outcome>\n- Summary: <1-2 sentences>",
     "comments": [
       {
         "path": "<file path relative to repo root>",
         "line": <line number in the NEW file (right side of diff)>,
         "body": "**<severity badge>  <short title>**\n\n<detailed explanation>\n\nUseful? React with 👍 / 👎."
       }
     ]
   }

   Severity badge format:
   - P1: **<sub><sub>![P1 Badge](https://img.shields.io/badge/P1-orange?style=flat)</sub></sub>  Title**
   - P2: **<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Title**
   - P3: **<sub><sub>![P3 Badge](https://img.shields.io/badge/P3-green?style=flat)</sub></sub>  Title**

   Rules for comments array:
   - Each comment MUST reference a specific file path and line number from the diff
   - The line number must be from the NEW side of the diff (lines with + prefix)
   - If no issues found, use an empty comments array []
   - Maximum 5 comments per review (focus on highest severity)

5. Save the JSON to a temp file and submit via GitHub API:

   TMP_JSON=\$(mktemp --suffix=.json)
   # Write the JSON payload to TMP_JSON
   cat <<'REVIEW_JSON' > \$TMP_JSON
   <the JSON object>
   REVIEW_JSON

   gh api repos/$REPO/pulls/<number>/reviews \
     --input \$TMP_JSON

6. Cleanup:

   rm -f \$TMP_JSON

7. After all PRs are processed, return to the original branch:

   git reset --hard
   git clean -fd
   git checkout "\$ORIGINAL_BRANCH"

Output format (one line per PR):
#<number> -> <outcome> + reviewed
#<number> -> skipped (reason: <short reason>)
#<number> -> failed (reason: <short reason>)

If a PR cannot be processed, do not stop the whole run. Continue to the next PR.
EOF
