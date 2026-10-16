import { Badge, Link } from "@openwarelabs/ui";
import { releases, repository } from "docs:releases";

import { componentDocs, hrefOf, kebab } from "../app/content";
import { DocPage, Section } from "../app/Page";
import { Thumbnail } from "../app/Thumbnail";
import type { Release, ReleaseNote } from "../app/types";

/** The groups shown as lists under the new components' cards, in order. */
const listGroups: Array<[ReleaseNote["group"], string]> = [
    ["breaking", "Breaking changes"],
    ["blocks", "New blocks"],
    ["improvements", "Improvements"],
    ["fixes", "Fixes"],
    ["performance", "Performance"],
    ["other", "Other changes"],
];

const versionId = (version: string) => `v${version.replace(/\./g, "-")}`;

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const formatDate = (date: string) => (date ? dateFormat.format(new Date(`${date}T00:00:00Z`)) : "");

/** "a box to sign…" → "A box to sign…". */
const sentence = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "Filled areas along an ordered x axis, usually time: stacked, so…" → "Filled areas along an ordered x axis, usually time". */
const firstClause = (text: string) => text.split(/[:.](?:\s|$)/)[0]!.trim();

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

/** How each group is counted: in full under a release's heading, and in short beside its version in "On this page". */
const countGroups: Array<{ group: ReleaseNote["group"]; full: (count: number) => string; short: (count: number) => string }> = [
    { group: "breaking", full: (n) => plural(n, "breaking change"), short: (n) => `${n} breaking` },
    { group: "components", full: (n) => plural(n, "new component"), short: (n) => `${n} new` },
    { group: "blocks", full: (n) => plural(n, "new set of blocks", "new sets of blocks"), short: (n) => plural(n, "block set") },
    { group: "improvements", full: (n) => plural(n, "improvement"), short: (n) => `${n} improved` },
    { group: "fixes", full: (n) => plural(n, "fix", "fixes"), short: (n) => plural(n, "fix", "fixes") },
    { group: "performance", full: (n) => plural(n, "performance change"), short: (n) => `${n} perf` },
    { group: "other", full: (n) => plural(n, "other change"), short: (n) => `${n} other` },
];

/** What a release changed, group by group. Unlike its summary, this counts other changes too. */
function countsOf(release: Release) {
    return countGroups
        .map(({ group, full, short }) => {
            const notes = release.notes.filter((note) => note.group === group);
            const count = group === "components" ? notes.reduce((sum, note) => sum + (note.components?.length ?? 0), 0) : notes.length;
            return { group, count, full: full(count), short: short(count) };
        })
        .filter((entry) => entry.count > 0);
}

/** "11 new · 1 fix", or "Maintenance". */
const hintOf = (release: Release) =>
    countsOf(release)
        .slice(0, 2)
        .map((entry) => entry.short)
        .join(" · ") || "Maintenance";

/** The pull request and the commit a note came from, as small links after it. */
function Refs({ note }: { note: ReleaseNote }) {
    if (!note.pr && !note.hash) return null;
    return (
        <span className="docs-release__refs">
            {note.pr ? (
                <a className="docs-release__ref" href={`${repository}/pull/${note.pr}`} aria-label={`Pull request ${note.pr}`}>
                    #{note.pr}
                </a>
            ) : null}
            {note.hash ? (
                <a className="docs-release__ref" href={`${repository}/commit/${note.hash}`} aria-label={`Commit ${note.hash.slice(0, 7)}`}>
                    {note.hash.slice(0, 7)}
                </a>
            ) : null}
        </span>
    );
}

/** A new component as a card: its first example, its name linking to its page, its group and what it is. */
function ComponentCard({ name, note }: { name: string; note: ReleaseNote }) {
    const doc = componentDocs.find((entry) => entry.slug === kebab(name));
    // A note that adds several components describes them all in one line ("stacked areas, a disc with shares on it and
    // points…"), so each of their cards takes its own component's description instead.
    const shared = (note.components?.length ?? 0) > 1;
    const text = note.text && !shared ? sentence(note.text) : doc ? firstClause(doc.meta.description) : note.text ? sentence(note.text) : "";
    return (
        <li className="docs-card docs-release-card">
            {doc ? <Thumbnail doc={doc} className="docs-release-card__preview" /> : null}
            <span className="docs-card__body docs-release-card__body">
                <span className="docs-release-card__head">
                    <a className="docs-card__name docs-card__link" href={hrefOf.component(kebab(name))}>
                        {name}
                    </a>
                    {doc ? <span className="docs-release-card__category">{doc.meta.category}</span> : null}
                </span>
                {text ? <span className="docs-card__description docs-release-card__text">{text}</span> : null}
                <Refs note={note} />
            </span>
        </li>
    );
}

function ReleaseSection({ release, latest }: { release: Release; latest: boolean }) {
    const added = release.notes.filter((note) => note.group === "components");
    const counts = countsOf(release);
    const pulls = new Set(release.notes.flatMap((note) => (note.pr ? [note.pr] : []))).size;
    const patch = !release.version.endsWith(".0");
    const ghRelease = `${repository}/releases/tag/v${release.version}`;
    return (
        <div className={patch ? "docs-release docs-release--patch" : "docs-release"}>
            <Section
                id={versionId(release.version)}
                title={
                    <span className="docs-release__title">
                        {release.version}
                        {latest ? <Badge variant="success">Latest</Badge> : null}
                    </span>
                }
            >
                <div className="docs-release__meta">
                    <ul className="docs-release__counts">
                        {counts.map((entry) => (
                            <li
                                key={entry.group}
                                className={entry.group === "components" ? "docs-release__count docs-release__count--new" : "docs-release__count"}
                            >
                                {entry.full}
                            </li>
                        ))}
                        {pulls ? <li className="docs-release__count">{plural(pulls, "pull request")}</li> : null}
                        {counts.length ? null : <li className="docs-release__count">Maintenance only</li>}
                    </ul>
                    <span className="docs-release__when">
                        {release.date ? <time dateTime={release.date}>{formatDate(release.date)}</time> : null}
                        {release.date ? <span aria-hidden="true">·</span> : null}
                        <Link href={ghRelease}>GitHub release</Link>
                    </span>
                </div>

                {added.length ? (
                    <>
                        <h3 className="docs-release__group">New components</h3>
                        <ul className="docs-release-cards">
                            {added.flatMap((note) => (note.components ?? []).map((name) => <ComponentCard key={name} name={name} note={note} />))}
                        </ul>
                    </>
                ) : null}

                {listGroups.map(([group, title]) => {
                    const list = release.notes.filter((note) => note.group === group);
                    if (!list.length) return null;
                    return (
                        <div key={group}>
                            <h3 className="docs-release__group">{title}</h3>
                            <ul className="docs-release-notes">
                                {list.map((note, index) => (
                                    <li key={note.hash ?? index} className="docs-release-note">
                                        <span className="docs-release-note__text">
                                            {note.scope ? <code className="docs-release-note__scope">{note.scope}</code> : null}
                                            {sentence(note.text)}
                                        </span>
                                        <Refs note={note} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </Section>
        </div>
    );
}

export function Releases() {
    return (
        <DocPage
            title="Releases"
            description={
                <>
                    What each version of <code>@openwarelabs/ui</code> added and fixed, newest first. The same notes are in CHANGELOG.md and on each GitHub
                    release; <code>npm run release</code> writes them from the commits.
                </>
            }
            toc={releases.map((release) => ({
                id: versionId(release.version),
                label: release.version,
                level: 2 as const,
                hint: hintOf(release),
                group: formatDate(release.date) || undefined,
            }))}
        >
            {releases.map((release, index) => (
                <ReleaseSection key={release.version} release={release} latest={index === 0} />
            ))}
        </DocPage>
    );
}
