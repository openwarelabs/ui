import { Badge, Link } from "@openwarelabs/ui";
import { releases, repository } from "docs:releases";

import { componentDocs, hrefOf, kebab } from "../app/content";
import { DocPage, Section } from "../app/Page";
import type { Release, ReleaseNote } from "../app/types";

const groupTitles: Array<[ReleaseNote["group"], string]> = [
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

/** The pull request and the commit a note came from, as small links after it. */
function Refs({ note }: { note: ReleaseNote }) {
    if (!note.pr && !note.hash) return null;
    return (
        <span className="docs-release__refs">
            {note.pr ? (
                <a href={`${repository}/pull/${note.pr}`} aria-label={`Pull request ${note.pr}`}>
                    #{note.pr}
                </a>
            ) : null}
            {note.hash ? (
                <a href={`${repository}/commit/${note.hash}`} aria-label={`Commit ${note.hash.slice(0, 7)}`}>
                    <code>{note.hash.slice(0, 7)}</code>
                </a>
            ) : null}
        </span>
    );
}

/** A new component as a card: its name links to its page, with its group and what it is. */
function ComponentCard({ name, note }: { name: string; note: ReleaseNote }) {
    const doc = componentDocs.find((entry) => entry.slug === kebab(name));
    return (
        <li className="docs-release-card">
            <span className="docs-release-card__head">
                <a className="docs-release-card__name" href={hrefOf.component(kebab(name))}>
                    {name}
                </a>
                {doc ? <Badge>{doc.meta.category}</Badge> : null}
            </span>
            <span className="docs-release-card__text">{note.text ? sentence(note.text) : doc?.meta.description}</span>
            <Refs note={note} />
        </li>
    );
}

function ReleaseSection({ release, latest }: { release: Release; latest: boolean }) {
    const added = release.notes.filter((note) => note.group === "components");
    const ghRelease = `${repository}/releases/tag/v${release.version}`;
    return (
        <Section
            id={versionId(release.version)}
            title={
                <span className="docs-release__title">
                    {release.version}
                    {latest ? <Badge variant="success">Latest</Badge> : null}
                </span>
            }
        >
            <p className="docs-release__meta">
                {release.date ? <time dateTime={release.date}>{formatDate(release.date)}</time> : null}
                <span aria-hidden="true">·</span>
                <span>{release.summary || "Maintenance only."}</span>
                <span aria-hidden="true">·</span>
                <Link href={ghRelease}>GitHub release</Link>
            </p>

            {added.length ? (
                <>
                    <h3 className="docs-release__group">New components</h3>
                    <ul className="docs-release-cards">
                        {added.flatMap((note) => (note.components ?? []).map((name) => <ComponentCard key={name} name={name} note={note} />))}
                    </ul>
                </>
            ) : null}

            {groupTitles.map(([group, title]) => {
                const list = release.notes.filter((note) => note.group === group);
                if (!list.length) return null;
                return (
                    <div key={group}>
                        <h3 className="docs-release__group">{title}</h3>
                        <ul className="docs-list docs-release__list">
                            {list.map((note, index) => (
                                <li key={note.hash ?? index}>
                                    {note.scope ? <strong>{note.scope}: </strong> : null}
                                    {sentence(note.text)} <Refs note={note} />
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </Section>
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
            toc={releases.map((release) => ({ id: versionId(release.version), label: release.version, level: 2 as const }))}
        >
            {releases.map((release, index) => (
                <ReleaseSection key={release.version} release={release} latest={index === 0} />
            ))}
        </DocPage>
    );
}
