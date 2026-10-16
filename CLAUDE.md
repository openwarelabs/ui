# Working on Openware UI

## Branches
- Give every branch a meaningful name that says what the change is, such as `docs/hide-blocks-section` or `fix/menu-escape`: a Conventional Commits type, a slash, then a few words in kebab case. Never a generated or random name.
- If a session starts on a generated branch name, rename it before opening a pull request.

## Worktrees
- Always work in a git worktree of its own for each branch (`git worktree add ../ui-<branch> -b <branch> origin/main`), never by switching branches in one checkout. Several changes can then be built, checked and pushed side by side without treading on each other's files, builds or `node_modules`.
- Agents working in parallel each take their own worktree and branch, one per pull request. Keep the shared files every component touches (`README.md`, `src/index.ts`, `scripts/css.mjs`, `scripts/build.mjs`, `docs/app/ai.ts`) to the smallest possible edit, so the pull requests merge in any order with as few conflicts as possible.
- When a pull request does conflict with `main`, merge `main` into its branch in that worktree and resolve there; never rebase or force-push a branch that already has a pull request.

## Commits and pull requests
- Pull requests are squash-merged with their title as the commit subject, and `npm run release` reads those subjects to pick the version. So every pull request title, and every commit subject, follows Conventional Commits: `type(scope): description`, with type one of `feat`, `fix`, `perf`, `refactor`, `docs`, `style`, `test`, `build`, `ci`, `chore`, `revert`. Check a title with `node scripts/check-commits.mjs --title "…"`.
- After opening a pull request, watch it until it's merged or closed: fix CI failures and respond to review comments as they come in.
