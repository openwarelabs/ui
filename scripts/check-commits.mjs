// Checks that commit subjects follow Conventional Commits, which `npm run release` reads to pick the version:
//   type(optional scope)!: description     e.g. "feat(Button): add a pill shape", "fix: close menus on Escape"
// Usage: node scripts/check-commits.mjs <range>   (default: the commits on this branch that origin/main doesn't have)
import { execFileSync } from "node:child_process";

export const types = ["feat", "fix", "perf", "refactor", "docs", "style", "test", "build", "ci", "chore", "revert"];
export const pattern = new RegExp(`^(${types.join("|")})(\\([^)]+\\))?!?: \\S`);

const range = process.argv[2] ?? "origin/main..HEAD";
const subjects = execFileSync("git", ["log", "--format=%h %s", "--no-merges", range], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
const bad = subjects.filter((line) => !pattern.test(line.slice(line.indexOf(" ") + 1)));

if (bad.length) {
    console.error(`These commits don't follow the convention (type: description, with type one of ${types.join(", ")}):\n`);
    for (const line of bad) console.error(`  ${line}`);
    console.error('\nFor example: "feat: add a date range picker", "fix(Menu): close on Escape", "feat!: rename Stack\'s gap sizes".');
    process.exit(1);
}
console.log(`${subjects.length} commit${subjects.length === 1 ? "" : "s"} follow the convention.`);
