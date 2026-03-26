#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-}"
REPO_DIR="${2:-}"
ISSUES="${3:-}"

command -v codex >/dev/null 2>&1 || { echo "codex not found"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "gh not found"; exit 1; }

[[ -n "$REPO" ]] || { echo "REPO is empty"; exit 1; }
[[ -n "$REPO_DIR" ]] || { echo "REPO_DIR is empty"; exit 1; }
[[ -n "$ISSUES" ]] || { echo "ISSUES is empty"; exit 1; }

cd "$REPO_DIR"

ME=$(gh api user --jq .login)

codex exec <<EOF
You are working in a GitHub repository. Your job is to triage new issues by labeling them
and providing an actionable solution proposal as a comment.

Repository: $REPO
Repository directory: $REPO_DIR

Target issues (one per line, format: "<number>: <title>"):
$ISSUES

Allowed labels:
- bug
- enhancement
- question
- needs-info

Labeling rules:
- bug: broken behavior, errors, incorrect logic, failures
- enhancement: feature, improvement, refactor, implementation request
- question: clarification or discussion
- needs-info: unclear or insufficient details to act on

Instructions:

0. Preparation:
   - Ensure you are inside the repository directory.
   - Run: git fetch --all --prune
   - Verify which allowed labels exist in the repository:
     gh label list -R $REPO --json name --jq '.[].name'
   - Only use labels that appear in both the allowed list AND the repository.
     If an allowed label does not exist in the repo, never attempt to use it.

1. Process ONLY the issue numbers listed in "Target issues".

2. For each issue number:

   # 2-1. Load issue details
   - Run:
     gh issue view <number> -R $REPO --json title,body,labels,comments
   - If the last comment on this issue was written by you ($ME), skip it.

   # 2-2. Read and understand the issue
   - Read the title and body carefully.
   - If the title and body alone are insufficient to classify confidently,
     inspect existing issue comments for additional context:
     gh issue view <number> -R $REPO --json comments --jq '.comments[].body'
   - Identify the core problem or request.

   # 2-3. Choose exactly ONE label from the allowed set.
   - If unsure, use needs-info.
   - If the body is empty or too vague, prefer needs-info.

   # 2-4. Apply the label
   - Run:
     gh issue edit <number> -R $REPO --add-label "<label>"

   # 2-5. Investigate the codebase for a solution proposal
   - Based on the issue content, search the repository for relevant code.
   - Use grep, file reads, or any tool available to understand the affected area.
   - Identify:
     * Which files/modules are likely involved
     * What the root cause might be (for bugs)
     * Where the change should be made (for enhancements)
     * What information is missing (for needs-info)

   # 2-6. Write and post a triage comment
   - Create a temporary markdown file:
     TMP_FILE=\$(mktemp)

   - Classify severity of each finding:
     - P1 (🔴 High): bug risk, security, data integrity, broken logic
     - P2 (🟡 Medium): missing validation, edge case, performance concern
     - P3 (🟢 Low): style, naming, minor improvement

   - Write the comment into TMP_FILE using this format:

cat <<COMMENT > \$TMP_FILE
## Triage Summary
- **Type**: <chosen label>
- **Summary**: <1-2 sentence summary of the issue>
- **Why this label**: <reason for the label choice>
- **Missing info**: <what is unclear, or "none">

## Findings

<For each finding, use this format:>

**<sub><sub>![P1 Badge](https://img.shields.io/badge/P1-orange?style=flat)</sub></sub>  <short title>**

<detailed explanation with file path and line reference>

\`\`\`
<relevant code snippet if applicable>
\`\`\`

<Repeat for each finding. Use P1/P2/P3 badge as appropriate. Maximum 5 findings, highest severity first.>

## Suggested Approach
1. <concrete step>
2. <concrete step>
3. ...

**Risks or trade-offs**: <write "none" if straightforward>
**Estimated scope**: <small / medium / large>
COMMENT

   - Post the comment:
     gh issue comment <number> -R $REPO --body-file \$TMP_FILE
   - Clean up:
     rm -f \$TMP_FILE

Rules:
- MUST execute gh commands, not just describe them.
- Do not edit issue title or body.
- Do not close issues.
- Do not create new labels. If the chosen label does not exist, report and skip.
- Do not add more than one label per issue.
- Do not post more than one comment per issue.
- Only label and comment on issues where your last comment is not the most recent one.
- The solution proposal must reference actual code locations found in the repository,
  not hypothetical paths. If no relevant code is found, say so honestly.
- Inspect only the files and modules relevant to the issue. Do not broadly scan the whole repository.
- Separate confirmed observations from likely causes. Do not present guesses as verified facts.
- Before posting a triage comment, check if one already exists to avoid duplicates.
- Shell safety: be careful with quotes and special characters in comment bodies.

Output format (one line per issue):
#<number> -> <label> + commented
#<number> -> skipped (reason: <short reason>)
#<number> -> failed (reason: <short reason>)

If a single issue fails, continue processing the rest.
EOF
