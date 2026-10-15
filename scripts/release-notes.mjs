// The release notes, in one place: `npm run release` turns commits into a release with `notesFromCommits` and writes it
// into CHANGELOG.md with `renderRelease`; the docs' Releases page reads the changelog back with `parseChangelog`. The
// release workflow copies each version's section into its GitHub release, so all three show the same notes.
//
// A release in the changelog:
//
//   ## 0.16.0 (2026-10-15)
//
//   2 new components and 1 fix.
//
//   ### New components
//
//   - **[SignaturePad](https://openwarelabs.github.io/ui/#/components/signature-pad)**: a box to sign with a mouse, finger
//     or pen ([#55](https://github.com/openwarelabs/ui/pull/55), [11816c6](https://github.com/openwarelabs/ui/commit/…))
//
//   ### Fixes
//
//   - **Menu:** close on Escape ([#60](…), [a1b2c3d](…))
//
// A `feat: add SignaturePad, a box to sign…` commit becomes a new component when SignaturePad has a docs page
// (docs/examples/SignaturePad.tsx); "add AspectRatio and Image, …" names two. `feat(blocks): add …` is a new block.

export const repository = "https://github.com/openwarelabs/ui";
export const docsSite = "https://openwarelabs.github.io/ui/";

/** The groups a release's notes fall into, in the order they're shown. */
export const groups = [
    { key: "breaking", title: "Breaking changes" },
    { key: "components", title: "New components" },
    { key: "blocks", title: "New blocks" },
    { key: "improvements", title: "Improvements" },
    { key: "fixes", title: "Fixes" },
    { key: "performance", title: "Performance" },
    { key: "other", title: "Other changes" },
];

const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
export const componentUrl = (name) => `${docsSite}#/components/${kebab(name)}`;

/**
 * One note from a commit's description: "add X, what it is (#55)" → { group, components, text, pr }.
 * `isComponent(name)` says whether a name has a docs page.
 */
export function noteFrom({ type, scope, description, breaking, hash }, isComponent) {
    const pr = /\s*\(#(\d+)\)$/.exec(description);
    let text = pr ? description.slice(0, pr.index) : description;
    const note = { group: "other", text, hash, ...(pr ? { pr: Number(pr[1]) } : {}), ...(scope ? { scope } : {}) };
    if (breaking) return { ...note, group: "breaking" };
    if (type === "fix") return { ...note, group: "fixes" };
    if (type === "perf") return { ...note, group: "performance" };
    if (type !== "feat") return note;
    if (scope === "blocks") {
        const { scope: _scope, ...rest } = note;
        return { ...rest, group: "blocks" };
    }
    // "add SignaturePad, a box to sign…" or "add AspectRatio and Image, with a placeholder…".
    const added = /^add ([A-Z]\w*(?:(?:, | and )[A-Z]\w*)*)(?:, (.+))?$/.exec(text);
    const names = added?.[1].split(/, | and /) ?? [];
    if (names.length && names.every(isComponent)) {
        text = added[2] ?? "";
        const { scope: _scope, ...rest } = note;
        return { ...rest, group: "components", components: names, text };
    }
    return { ...note, group: "improvements" };
}

/** The notes of a release, from its commits as release.mjs reads them. */
export const notesFromCommits = (commits, isComponent) => commits.map((commit) => noteFrom(commit, isComponent));

const plural = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

/** "10 new components, 2 improvements and 1 fix.", or "" when there's nothing but other changes. */
export function summaryOf(notes) {
    const count = (group) => notes.filter((note) => note.group === group).length;
    const components = notes.filter((note) => note.group === "components").reduce((sum, note) => sum + note.components.length, 0);
    const parts = [
        count("breaking") && plural(count("breaking"), "breaking change"),
        components && plural(components, "new component"),
        count("blocks") && plural(count("blocks"), "new set of blocks", "new sets of blocks"),
        count("improvements") && plural(count("improvements"), "improvement"),
        count("fixes") && plural(count("fixes"), "fix", "fixes"),
        count("performance") && plural(count("performance"), "performance change"),
    ].filter(Boolean);
    if (!parts.length) return "";
    const last = parts.pop();
    return `${parts.length ? `${parts.join(", ")} and ${last}` : last}.`;
}

function renderNote(note) {
    const refs = [
        note.pr ? `[#${note.pr}](${repository}/pull/${note.pr})` : "",
        note.hash ? `[${note.hash.slice(0, 7)}](${repository}/commit/${note.hash})` : "",
    ].filter(Boolean);
    const lead = note.components
        ? `${note.components.map((name) => `**[${name}](${componentUrl(name)})**`).join(" and ")}${note.text ? ": " : ""}`
        : note.scope
          ? `**${note.scope}:** `
          : "";
    return `- ${lead}${note.text}${refs.length ? ` (${refs.join(", ")})` : ""}`;
}

/** A release as its changelog section: heading, summary, then each group's notes. */
export function renderRelease({ version, date, notes }) {
    const summary = summaryOf(notes);
    const body = groups
        .map(({ key, title }) => [title, notes.filter((note) => note.group === key)])
        .filter(([, list]) => list.length)
        .map(([title, list]) => `### ${title}\n\n${list.map(renderNote).join("\n")}`)
        .join("\n\n");
    return `## ${version} (${date})\n\n${summary ? `${summary}\n\n` : ""}${body || "Maintenance only."}\n`;
}

export const changelogHeading =
    "# Changelog\n\nEvery release of @openwarelabs/ui, @openwarelabs/blocks and @openwarelabs/ui-mcp. `npm run release` writes it from the commits, and the docs' Releases page shows it.\n\n";

export const renderChangelog = (releases) => `${changelogHeading}${releases.map(renderRelease).join("\n")}`;

const legacyGroups = { Features: "feat", Fixes: "fix", Performance: "perf", "Breaking changes": "breaking", "Other changes": "other" };

/** One "- …" line back into a note. Reads this file's format, and the one before it (### Features, "(#55) ([hash](…))"). */
function parseNote(line, groupTitle, isComponent) {
    let rest = line.replace(/^- /, "");
    let pr;
    let hash;
    // New: " ([#55](…/pull/55), [abc1234](…/commit/<full>))". Old: " (#55) ([abc1234](…/commit/<full>))".
    const refs = /\s*\(((?:\[[^\]]+\]\([^)]+\)(?:, )?)+)\)$/.exec(rest);
    if (refs) {
        rest = rest.slice(0, refs.index);
        for (const [, label, url] of refs[1].matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
            if (label.startsWith("#")) pr = Number(label.slice(1));
            else hash = /\/commit\/([0-9a-f]+)/.exec(url)?.[1] ?? label;
        }
    }
    const group = groups.find((entry) => entry.title === groupTitle)?.key;
    if (group) {
        const components = /^((?:\*\*\[\w+\]\([^)]*\)\*\*(?: and )?)+)(?:: )?/.exec(rest);
        if (group === "components" && components) {
            const names = [...components[1].matchAll(/\*\*\[(\w+)\]/g)].map((match) => match[1]);
            return { group, components: names, text: rest.slice(components[0].length), ...(pr ? { pr } : {}), ...(hash ? { hash } : {}) };
        }
        const scoped = /^\*\*([^*]+):\*\* /.exec(rest);
        let text = scoped ? rest.slice(scoped[0].length) : rest;
        // The old format kept the pull request in the text: "… bundle size (#10)".
        const inline = /\s*\(#(\d+)\)$/.exec(text);
        if (inline) {
            text = text.slice(0, inline.index);
            pr ??= Number(inline[1]);
        }
        if (group === "blocks" && scoped?.[1] === "blocks") return { group, text, ...(pr ? { pr } : {}), ...(hash ? { hash } : {}) };
        return { group, text, ...(scoped ? { scope: scoped[1] } : {}), ...(pr ? { pr } : {}), ...(hash ? { hash } : {}) };
    }
    // The old format: classify it the way a release does now.
    const scoped = /^\*\*([^*]+):\*\* /.exec(rest);
    const description = `${scoped ? rest.slice(scoped[0].length) : rest}${pr ? ` (#${pr})` : ""}`;
    const kind = legacyGroups[groupTitle] ?? "other";
    return noteFrom(
        { type: kind === "breaking" || kind === "other" ? undefined : kind, scope: scoped?.[1], description, breaking: kind === "breaking", hash },
        isComponent,
    );
}

/** CHANGELOG.md as releases, newest first: { version, date, summary, notes }. */
export function parseChangelog(markdown, isComponent = () => false) {
    return markdown
        .split(/^## /m)
        .slice(1)
        .map((section) => {
            const [heading, ...lines] = section.split("\n");
            const [, version, date] = /^(\d+\.\d+\.\d+)(?: \((\d{4}-\d{2}-\d{2})\))?/.exec(heading) ?? [];
            if (!version) return undefined;
            const notes = [];
            let groupTitle;
            for (const line of lines) {
                if (line.startsWith("### ")) groupTitle = line.slice(4).trim();
                else if (line.startsWith("- ") && groupTitle) notes.push(parseNote(line, groupTitle, isComponent));
            }
            return { version, date: date ?? "", summary: summaryOf(notes), notes };
        })
        .filter(Boolean);
}
