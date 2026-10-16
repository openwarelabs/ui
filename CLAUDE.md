# Working on Openware UI

## Branches
- Give every branch a meaningful name that says what the change is, such as `docs/hide-blocks-section` or `fix/menu-escape`: a Conventional Commits type, a slash, then a few words in kebab case. Never a generated or random name.
- If a session starts on a generated branch name, rename it before opening a pull request.

## Commits and pull requests
- Pull requests are squash-merged with their title as the commit subject, and `npm run release` reads those subjects to pick the version. So every pull request title, and every commit subject, follows Conventional Commits: `type(scope): description`, with type one of `feat`, `fix`, `perf`, `refactor`, `docs`, `style`, `test`, `build`, `ci`, `chore`, `revert`. Check a title with `node scripts/check-commits.mjs --title "…"`.
- After opening a pull request, watch it until it's merged or closed: fix CI failures and respond to review comments as they come in.
