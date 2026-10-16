import { useRef, useState } from "react";

import { Prose, TableOfContents, Text, type TocItem } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "TableOfContents",
    category: "Navigation",
    description:
        "The headings of a long page as links beside it, with the one nearest the top marked as the page scrolls: docs, an article, a settings page with many sections.",
    source: "components/TableOfContents/TableOfContents.tsx",
    imports: ["TableOfContents"],
    props: ["TableOfContentsProps", "TocItem"],
    keyboard: [
        ["Tab", "Moves through the links."],
        ["Enter", "Scrolls to that heading and puts its id in the address bar."],
    ],
    notes: [
        'A nav landmark named "Table of contents" (aria-label), holding nested lists of links; the current one has aria-current="location".',
        "Headings are read from contentRef (h2 and h3 by default, selector for others) and need ids: one without is left out. Or pass the tree yourself as items.",
        "The heading nearest the top counts as current once it is within offset pixels of the scroller's top; at the very end, the last heading is. Clicking a link scrolls to it, honouring the heading's scroll-margin-top and the scroller's scroll-padding-top, and updates the hash with history.replaceState, so Back isn't filled with headings.",
        "Pass container when the content scrolls inside an element rather than the window, as these examples do.",
        "The scroll to a clicked heading is smooth unless the person prefers reduced motion; the bar slides to the current link, and stays put under reduced motion too.",
    ],
    related: ["Prose", "NavList", "Markdown"],
    since: "0.18.0",
};

const scroller = {
    height: 360,
    overflowY: "auto" as const,
    scrollPaddingTop: 12,
    flex: "1 1 280px",
    minWidth: 0,
    padding: "0 var(--ow-space-lg)",
    border: "1px solid var(--ow-border)",
    borderRadius: "var(--ow-radius-lg)",
};

/** The handbook's text, with ids on its headings (prefixed, so two copies on one page stay apart). */
function Handbook({ prefix }: { prefix: string }) {
    const id = (slug: string) => `${prefix}-${slug}`;
    return (
        <Prose size="sm">
            <h2 id={id("overview")}>Overview</h2>
            <p>
                This handbook is for everyone who writes for the docs site: the engineers describing what they shipped, and the
                writers who tidy it afterwards. Aoife owns the site; ask her before adding a new section to the sidebar.
            </p>
            <p>
                Every page is a Markdown file in the <code>docs/</code> folder. The build turns it into HTML, checks its links and
                publishes it with the next release.
            </p>
            <h2 id={id("setting-up")}>Setting up</h2>
            <p>You need Node 22 and a clone of the repository. Nothing else is installed on your machine.</p>
            <h3 id={id("install")}>Install</h3>
            <p>
                Run <code>npm install</code> once, then <code>npm run docs</code>. The site opens at <code>localhost:4000</code> and
                reloads as you type.
            </p>
            <h3 id={id("configure")}>Configure</h3>
            <p>
                The sidebar order lives in <code>docs/nav.json</code>. Cian keeps the generated reference pages at the end, so new
                guides go above them.
            </p>
            <h2 id={id("writing-a-page")}>Writing a page</h2>
            <p>
                Start with the task the reader has, not with the feature. Niamh&apos;s rule: if the first sentence could open any
                page, it can open none of them.
            </p>
            <h3 id={id("headings")}>Headings</h3>
            <p>
                One <code>h1</code> per page, from the title. Use <code>h2</code> for the steps and <code>h3</code> under them; the
                table of contents reads both. Keep them short enough to fit on one line in the sidebar.
            </p>
            <h3 id={id("code-samples")}>Code samples</h3>
            <p>
                Samples are run in CI, so they have to work. Put the complete file in <code>docs/samples/</code> and include it by
                name; don&apos;t paste a fragment.
            </p>
            <h2 id={id("publishing")}>Publishing</h2>
            <p>Open a pull request. The preview link is in its first comment within a minute or two.</p>
            <h3 id={id("preview")}>Preview</h3>
            <p>
                Saoirse reviews every page before it goes out. Tag her, say which pages changed, and read your own preview once on a
                phone.
            </p>
            <h3 id={id("release")}>Release</h3>
            <p>
                Merged pages ship with the next release on Tuesday. A fix to a page that&apos;s wrong can go out sooner: ask Oisín
                to run the docs deploy by hand.
            </p>
            <h2 id={id("troubleshooting")}>Troubleshooting</h2>
            <p>
                If the build fails on a link, the link is to a page that moved. If a sample fails, run it on its own with{" "}
                <code>npm run sample -- &lt;name&gt;</code> and read the error; it&apos;s nearly always a renamed import.
            </p>
        </Prose>
    );
}

/** Headings read from the article as it scrolls inside a box; the box is the container. */
export function Article() {
    const content = useRef<HTMLDivElement>(null);
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ow-space-lg)", alignItems: "flex-start" }}>
            <div ref={content} style={scroller} role="region" aria-label="Handbook" tabIndex={0}>
                <Handbook prefix="article" />
            </div>
            <div style={{ flex: "0 0 180px" }}>
                <TableOfContents contentRef={content} container={content} offset={24} />
            </div>
        </div>
    );
}
Article.layout = { align: "start" as const, fill: true, minHeight: 400 };

const items: TocItem[] = [
    { id: "items-overview", title: "Overview" },
    {
        id: "items-setting-up",
        title: "Setting up",
        children: [
            { id: "items-install", title: "Install" },
            { id: "items-configure", title: "Configure" },
        ],
    },
    {
        id: "items-writing",
        title: "Writing a page",
        children: [
            { id: "items-headings", title: "Headings" },
            { id: "items-code", title: "Code samples" },
        ],
    },
    { id: "items-publishing", title: "Publishing" },
];

/** An explicit items tree, say from a CMS, controlled: the current id shows under it. */
export function ExplicitItems() {
    const box = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState("items-overview");
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ow-space-lg)", alignItems: "flex-start" }}>
            <div ref={box} style={scroller} role="region" aria-label="Handbook" tabIndex={0}>
                <Prose size="sm">
                    <h2 id="items-overview">Overview</h2>
                    <p>Every page is a Markdown file; the build checks its links and publishes it with the next release.</p>
                    <h2 id="items-setting-up">Setting up</h2>
                    <p>You need Node 22 and a clone of the repository.</p>
                    <h3 id="items-install">Install</h3>
                    <p>Run npm install once, then npm run docs. The site opens on port 4000 and reloads as you type.</p>
                    <h3 id="items-configure">Configure</h3>
                    <p>The sidebar order lives in nav.json. New guides go above the generated reference pages.</p>
                    <h2 id="items-writing">Writing a page</h2>
                    <p>Start with the task the reader has, not with the feature.</p>
                    <h3 id="items-headings">Headings</h3>
                    <p>One h1 per page, h2 for the steps and h3 under them. Keep them short enough for one line.</p>
                    <h3 id="items-code">Code samples</h3>
                    <p>Samples are run in CI, so they have to work. Include the whole file by name.</p>
                    <h2 id="items-publishing">Publishing</h2>
                    <p>Open a pull request. The preview link is in its first comment, and Saoirse reviews every page before it goes out.</p>
                </Prose>
            </div>
            <div style={{ display: "grid", gap: "var(--ow-space-md)", flex: "0 0 180px" }}>
                <TableOfContents items={items} container={box} offset={24} title="Contents" activeId={active} onActiveChange={setActive} />
                <Text variant="caption" tone="muted">
                    Current: {active}
                </Text>
            </div>
        </div>
    );
}
ExplicitItems.layout = { align: "start" as const, fill: true, minHeight: 400 };

/** collapsible shows a section's subheadings only while it is current. */
export function Collapsible() {
    const content = useRef<HTMLDivElement>(null);
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ow-space-lg)", alignItems: "flex-start" }}>
            <div ref={content} style={scroller} role="region" aria-label="Handbook" tabIndex={0}>
                <Handbook prefix="collapsible" />
            </div>
            <div style={{ flex: "0 0 180px" }}>
                <TableOfContents contentRef={content} container={content} offset={24} collapsible />
            </div>
        </div>
    );
}
Collapsible.layout = { align: "start" as const, fill: true, minHeight: 400 };
