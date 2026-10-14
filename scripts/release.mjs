// `npm run release`: works out the next version from the commits since the last release, checks everything,
// writes the changelog, then commits, tags and pushes. The tag starts .github/workflows/release.yml, which
// publishes @openwarelabs/ui, @openwarelabs/blocks and @openwarelabs/ui-mcp to npm and makes the GitHub release.
//
// The version follows the Conventional Commits in the subjects:
//   feat: …                         a minor release (0.5.0 → 0.6.0)
//   fix: … / perf: …                a patch release (0.5.0 → 0.5.1)
//   feat!: … or "BREAKING CHANGE:"  a major release from 1.0 on; before 1.0, a minor one
//   chore:, docs:, refactor:, test:, ci:, build:, style:  no release on their own
//
//   npm run release                 the version the commits call for
//   npm run release -- --dry-run    shows the version and the notes, and changes nothing
//   npm run release -- minor        forces patch, minor, major or an exact version such as 1.0.0
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { root } from "./css.mjs";

const repository = "https://github.com/openwarelabs/ui";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const forced = args.find((arg) => !arg.startsWith("--"));

const git = (...command) => execFileSync("git", command, { cwd: root, encoding: "utf8" }).trim();
const run = (command, commandArgs) => execFileSync(command, commandArgs, { cwd: root, stdio: "inherit" });
const fail = (message) => {
    console.error(`\n✗ ${message}\n`);
    process.exit(1);
};

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);

// 1. The tree is clean, on main, and has everything origin has.
if (!dryRun) {
    if (git("status", "--porcelain")) fail("There are uncommitted changes. Commit or stash them first.");
    const branch = git("rev-parse", "--abbrev-ref", "HEAD");
    if (branch !== "main") fail(`Releases go out from main, and this is ${branch}.`);
    git("fetch", "--quiet", "--tags", "origin");
    const [behind, ahead] = git("rev-list", "--left-right", "--count", "origin/main...HEAD").split(/\s+/).map(Number);
    if (behind > 0) fail(`main is ${behind} commit${behind === 1 ? "" : "s"} behind origin/main. Pull first.`);
    if (ahead > 0) console.log(`main has ${ahead} unpushed commit${ahead === 1 ? "" : "s"}; the release pushes them too.`);
}

// 2. The last release: the newest v* tag, or before the first tag, the newest "Release x.y.z" commit.
const current = readJson("package.json").version;
const tags = git("tag", "--list", "v*", "--sort=-v:refname").split("\n").filter(Boolean);
let base = tags[0];
if (!base) {
    const releaseCommit = git("log", "--format=%H %s").split("\n").find((line) => /^\w+ (chore\(release\): |Release )v?\d+\.\d+\.\d+/.test(line));
    base = releaseCommit?.split(" ")[0];
}
const range = base ? `${base}..HEAD` : "HEAD";
const since = tags[0] ?? (base ? `release commit ${base.slice(0, 7)}` : "the start");

// 3. The commits since then, read as Conventional Commits.
const separator = "\u001e";
const raw = git("log", range, `--format=%H%x1f%s%x1f%b${separator}`);
const commits = raw
    .split(separator)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
        const [hash, subject, body = ""] = entry.split("\u001f");
        const match = /^(\w+)(?:\(([^)]+)\))?(!)?: (.+)$/.exec(subject);
        return {
            hash,
            subject,
            type: match?.[1].toLowerCase(),
            scope: match?.[2],
            description: match?.[4] ?? subject,
            breaking: Boolean(match?.[3]) || /^BREAKING[ -]CHANGE:/m.test(body),
        };
    })
    .filter((commit) => !/^(chore\(release\)|Release v?\d)/.test(commit.subject));

if (!commits.length) fail(`Nothing has changed since ${since}.`);

// 4. The next version.
const [major, minor, patch] = current.split(".").map(Number);
const bumps = { major: `${major + 1}.0.0`, minor: `${major}.${minor + 1}.0`, patch: `${major}.${minor}.${patch + 1}` };
let level;
if (commits.some((commit) => commit.breaking)) level = major >= 1 ? "major" : "minor";
else if (commits.some((commit) => commit.type === "feat")) level = "minor";
else if (commits.some((commit) => commit.type === "fix" || commit.type === "perf")) level = "patch";

let next;
if (forced) {
    if (bumps[forced]) next = bumps[forced];
    else if (/^\d+\.\d+\.\d+$/.test(forced)) next = forced;
    else fail(`"${forced}" isn't patch, minor, major or a version like 1.2.3.`);
} else if (level) {
    next = bumps[level];
} else {
    const listed = commits.map((commit) => `  ${commit.hash.slice(0, 7)} ${commit.subject}`).join("\n");
    fail(
        `None of the ${commits.length} commits since ${since} is a feat, fix, perf or breaking change, so there's nothing to release:\n${listed}\n\n  To release anyway: npm run release -- patch (or minor, major)`,
    );
}
const order = (version) => version.split(".").map(Number).reduce((sum, part) => sum * 10000 + part, 0);
if (order(next) <= order(current)) fail(`${next} isn't after the current version, ${current}.`);

// 5. The release notes.
const link = (commit) => `([${commit.hash.slice(0, 7)}](${repository}/commit/${commit.hash}))`;
const item = (commit) => `- ${commit.scope ? `**${commit.scope}:** ` : ""}${commit.description} ${link(commit)}`;
const groups = [
    ["Breaking changes", commits.filter((commit) => commit.breaking)],
    ["Features", commits.filter((commit) => commit.type === "feat" && !commit.breaking)],
    ["Fixes", commits.filter((commit) => commit.type === "fix" && !commit.breaking)],
    ["Performance", commits.filter((commit) => commit.type === "perf" && !commit.breaking)],
];
// Commits that don't follow the convention still belong in the notes: they're real changes.
const other = commits.filter((commit) => !commit.type);
if (other.length) groups.push(["Other changes", other]);
const today = new Date().toISOString().slice(0, 10);
const notes = groups
    .filter(([, list]) => list.length)
    .map(([title, list]) => `### ${title}\n\n${list.map(item).join("\n")}`)
    .join("\n\n");
const section = `## ${next} (${today})\n\n${notes || "Maintenance only."}\n`;

const reason = forced ? `forced: ${forced}` : `${level}, from the commits`;
console.log(`\nRelease ${current} → ${next} (${reason}), ${commits.length} commit${commits.length === 1 ? "" : "s"} since ${since}:\n\n${section}`);
if (dryRun) {
    console.log("Dry run: nothing was changed.");
    process.exit(0);
}

// 6. Everything the release workflow checks, here first, so a bad release never gets a tag.
console.log("Checking…");
run("npm", ["run", "typecheck"]);
run("npm", ["run", "contrast"]);
run("npm", ["run", "blocks:check"]);
run("npm", ["run", "build"]);
run("npm", ["run", "blocks:build"]);

// 7. The new version everywhere: the library, its lockfile, and the MCP server, which matches it.
run("npm", ["version", next, "--no-git-tag-version", "--allow-same-version"]);
const mcp = readJson("mcp/package.json");
mcp.version = next;
writeJson("mcp/package.json", mcp);
// The blocks package goes out with the library it's built on, and asks for that version or a later compatible one.
const blocks = readJson("blocks/package.json");
blocks.version = next;
blocks.peerDependencies["@openwarelabs/ui"] = `^${next}`;
writeJson("blocks/package.json", blocks);
run("npm", ["run", "mcp:build"]);

const changelogPath = path.join(root, "CHANGELOG.md");
const heading = "# Changelog\n\nEvery release of @openwarelabs/ui and @openwarelabs/ui-mcp. `npm run release` writes it from the commits.\n\n";
const previous = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, "utf8").replace(/^# Changelog[\s\S]*?(?=^## )/m, "") : "";
fs.writeFileSync(changelogPath, `${heading}${section}\n${previous}`.replace(/\n{3,}/g, "\n\n"));

// 8. Commit, tag and push, all at once so main and the tag can't disagree.
const tag = `v${next}`;
git("add", "package.json", "package-lock.json", "mcp/package.json", "blocks/package.json", "CHANGELOG.md");
git("commit", "--quiet", "-m", `chore(release): ${next}`);
git("tag", "-a", tag, "-m", `Release ${next}`);
git("push", "--atomic", "origin", "main", tag);

console.log(`\n✓ Pushed ${tag}. GitHub Actions now publishes it to npm and makes the GitHub release:\n  ${repository}/actions\n`);
