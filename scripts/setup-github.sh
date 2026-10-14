#!/usr/bin/env bash
# One-time GitHub setup for openwarelabs/ui, with the GitHub CLI (gh auth login first). Safe to run again.
#   - Pull requests are squash-merged only, with the PR title as the commit subject; branches are deleted after.
#   - main takes changes only through pull requests, which need the Checks, Cleaner and PR title checks to pass.
#     Repository admins can bypass it, so `npm run release` can push its version commit and tag.
#   - main can't be force-pushed or deleted.
set -euo pipefail

repo="${1:-openwarelabs/ui}"

echo "Merge settings for ${repo}..."
gh api --method PATCH "repos/$repo" --silent \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -f squash_merge_commit_title=PR_TITLE \
  -f squash_merge_commit_message=PR_BODY \
  -F delete_branch_on_merge=true \
  -F allow_update_branch=true

ruleset=$(cat <<'JSON'
{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [{ "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always" }],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["squash"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": false,
        "required_status_checks": [{ "context": "Checks" }, { "context": "Cleaner" }, { "context": "PR title" }]
      }
    }
  ]
}
JSON
)

if ! rulesets=$(gh api "repos/$repo/rulesets" 2>&1); then
  echo "Couldn't read the rulesets: $rulesets" >&2
  echo "Rulesets need a public repository, or GitHub Team for a private one in an organization." >&2
  exit 1
fi
existing=$(gh api "repos/$repo/rulesets" --jq '.[] | select(.name == "main") | .id')
if [ -n "$existing" ]; then
  echo "Updating the main ruleset (${existing})..."
  echo "$ruleset" | gh api --method PUT "repos/$repo/rulesets/$existing" --input - --silent
else
  echo "Creating the main ruleset..."
  echo "$ruleset" | gh api --method POST "repos/$repo/rulesets" --input - --silent
fi

echo "Done. main now takes squash-merged pull requests only: https://github.com/$repo/rules"
