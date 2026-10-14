#!/usr/bin/env bash
# One-time GitHub setup for openwarelabs/ui, with the GitHub CLI (gh auth login first). Safe to run again.
#   - Pull requests are squash-merged only, with the PR title as the commit subject; branches are deleted after.
#     Auto-merge is on, so `gh pr merge --squash --auto` merges once the checks pass.
#   - main takes changes only through pull requests, which need the Checks, Cleaner, PR title, Visual and Accessibility checks to pass.
#     Repository admins can bypass it, so `npm run release` can push its version commit and tag.
#   - main can't be force-pushed or deleted.
#   - GitHub Pages, built by the Docs workflow on each release, at https://openwarelabs.github.io/ui/, which is
#     also the repository's website link.
#   - The "visual change" label, which lets a pull request through the Visual check when it's meant to change how
#     things look.
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
  -F allow_auto_merge=true \
  -F allow_update_branch=true \
  -f homepage="https://${repo%%/*}.github.io/${repo#*/}/"

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
        "required_status_checks": [{ "context": "Checks" }, { "context": "Cleaner" }, { "context": "PR title" }, { "context": "Visual" }, { "context": "Accessibility" }]
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

echo "GitHub Pages, from the Docs workflow..."
if gh api "repos/$repo/pages" --silent 2>/dev/null; then
  gh api --method PUT "repos/$repo/pages" --silent -f build_type=workflow
else
  gh api --method POST "repos/$repo/pages" --silent -f build_type=workflow
fi
# Pages' environment lets only main deploy; the Docs workflow deploys from release tags, so they're allowed too.
if ! gh api "repos/$repo/environments/github-pages/deployment-branch-policies" --jq '.branch_policies[].name' 2>/dev/null | grep -qx 'v\*\.\*\.\*'; then
  gh api --method POST "repos/$repo/environments/github-pages/deployment-branch-policies" --silent -f name='v*.*.*' -f type=tag
fi

echo "The visual change label..."
gh label create "visual change" --repo "$repo" --force --color FBCA04 \
  --description "Meant to change how blocks or components look: lets the Visual check pass"

echo "Done. main now takes squash-merged pull requests only: https://github.com/$repo/rules"
