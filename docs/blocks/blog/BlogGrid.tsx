import { useState } from "react";

import { Button, Card, SectionHeading, SegmentedControl, Tag, User } from "@openwarelabs/ui";
import { ArrowRight } from "lucide-react";

import "./BlogGrid.css";

type CoverKind = "orbit" | "diff" | "bars" | "horizon" | "glyph" | "tiles";

const posts: Array<{
    title: string;
    excerpt: string;
    category: string;
    date: string;
    iso: string;
    read: string;
    author: string;
    role: string;
    cover: CoverKind;
}> = [
    {
        title: "Agents now open their own pull requests",
        excerpt: "Hand an agent a task and it comes back with a branch, a passing build and a pull request your team reviews like any other.",
        category: "Product",
        date: "8 Oct 2026",
        iso: "2026-10-08",
        read: "4 min read",
        author: "Maya Chen",
        role: "Product lead",
        cover: "orbit",
    },
    {
        title: "How we cut median review time to 42 minutes",
        excerpt: "Smaller changes, reviewers picked by the code they touch, and a queue that tells you what's waiting on you.",
        category: "Engineering",
        date: "30 Sep 2026",
        iso: "2026-09-30",
        read: "7 min read",
        author: "Tomás Reyes",
        role: "Staff engineer",
        cover: "diff",
    },
    {
        title: "Roll back any deploy in one click",
        excerpt: "Every deploy keeps the last good build warm, so undoing a bad release takes seconds, not a fresh build.",
        category: "Product",
        date: "22 Sep 2026",
        iso: "2026-09-22",
        read: "3 min read",
        author: "Clara Novak",
        role: "Engineering manager",
        cover: "bars",
    },
    {
        title: "How Halcyon ships twice a day with a team of six",
        excerpt: "Halcyon moved planning, reviews and deploys into Acme, and stopped losing Fridays to release day.",
        category: "Customers",
        date: "15 Sep 2026",
        iso: "2026-09-15",
        read: "6 min read",
        author: "Jonas Berg",
        role: "Customer success",
        cover: "horizon",
    },
    {
        title: "Writing tasks an agent can finish",
        excerpt: "What 40,000 agent runs taught us about scope, context, and knowing when to hand the work back to a person.",
        category: "Engineering",
        date: "4 Sep 2026",
        iso: "2026-09-04",
        read: "5 min read",
        author: "Aiko Tanaka",
        role: "Machine learning engineer",
        cover: "glyph",
    },
    {
        title: "Quarry's move from three tools to one",
        excerpt: "Tickets, code review and deploys used to live in three places. Quarry's platform team on folding them into one.",
        category: "Customers",
        date: "27 Aug 2026",
        iso: "2026-08-27",
        read: "5 min read",
        author: "Lena Fischer",
        role: "Solutions engineer",
        cover: "tiles",
    },
];

const filters = ["All", "Product", "Engineering", "Customers"];

/** A post's cover, drawn with CSS from the brand scale. Swap it for an image: <img src="…" alt="" />. */
function Cover({ kind }: { kind: CoverKind }) {
    return (
        <div className={`blog-grid__cover blog-grid__cover--${kind}`} aria-hidden="true">
            {kind === "orbit" ? (
                <>
                    <span className="blog-grid__shape blog-grid__ring blog-grid__ring--3" />
                    <span className="blog-grid__shape blog-grid__ring blog-grid__ring--2" />
                    <span className="blog-grid__shape blog-grid__ring blog-grid__ring--1" />
                    <span className="blog-grid__shape blog-grid__core" />
                    <span className="blog-grid__shape blog-grid__moon" />
                    <span className="blog-grid__brass" />
                </>
            ) : null}
            {kind === "diff" ? (
                <>
                    <span className="blog-grid__shape blog-grid__pane blog-grid__pane--back">
                        <span className="blog-grid__line" style={{ width: "70%" }} />
                        <span className="blog-grid__line blog-grid__line--removed" style={{ width: "88%" }} />
                        <span className="blog-grid__line blog-grid__line--removed" style={{ width: "54%" }} />
                        <span className="blog-grid__line" style={{ width: "76%" }} />
                    </span>
                    <span className="blog-grid__shape blog-grid__pane blog-grid__pane--front">
                        <span className="blog-grid__line" style={{ width: "58%" }} />
                        <span className="blog-grid__line blog-grid__line--added" style={{ width: "82%" }}>
                            <span className="blog-grid__brass" />
                        </span>
                        <span className="blog-grid__line blog-grid__line--added" style={{ width: "64%" }} />
                        <span className="blog-grid__line" style={{ width: "40%" }} />
                    </span>
                </>
            ) : null}
            {kind === "bars" ? (
                <span className="blog-grid__shape blog-grid__chart">
                    <span className="blog-grid__bar" />
                    <span className="blog-grid__bar" />
                    <span className="blog-grid__bar" />
                    <span className="blog-grid__bar" />
                    <span className="blog-grid__bar" />
                    <span className="blog-grid__bar">
                        <span className="blog-grid__brass" />
                    </span>
                </span>
            ) : null}
            {kind === "horizon" ? (
                <>
                    <span className="blog-grid__shape blog-grid__sun">
                        <span className="blog-grid__brass" />
                    </span>
                    <span className="blog-grid__shape blog-grid__water">
                        <span />
                        <span />
                        <span />
                    </span>
                    <span className="blog-grid__shape blog-grid__wordmark">Halcyon</span>
                </>
            ) : null}
            {kind === "glyph" ? (
                <>
                    <span className="blog-grid__shape blog-grid__braces">{"{ }"}</span>
                    <span className="blog-grid__brass" />
                </>
            ) : null}
            {kind === "tiles" ? (
                <>
                    <span className="blog-grid__shape blog-grid__tools">
                        <span className="blog-grid__tool" />
                        <span className="blog-grid__tool" />
                        <span className="blog-grid__tool" />
                    </span>
                    <span className="blog-grid__shape blog-grid__one">
                        <span className="blog-grid__brass" />
                    </span>
                    <span className="blog-grid__shape blog-grid__wordmark">Quarry</span>
                </>
            ) : null}
        </div>
    );
}

export function BlogGrid() {
    const [filter, setFilter] = useState("All");
    const shown = posts.filter((post) => filter === "All" || post.category === filter);

    return (
        <section className="blog-grid" aria-labelledby="blog-grid-title">
            <div className="blog-grid__inner">
                <div className="blog-grid__header">
                    <SectionHeading
                        eyebrow="Blog"
                        title={<span id="blog-grid-title">Notes on shipping software</span>}
                        intro="Product news, how we build Acme, and the teams who use it."
                    />
                    <div className="blog-grid__filter">
                        <SegmentedControl
                            aria-label="Show posts about"
                            options={filters.map((value) => ({ value, label: value }))}
                            value={filter}
                            onChange={setFilter}
                        />
                    </div>
                </div>

                <ul className="blog-grid__posts">
                    {shown.map((post) => (
                        <li key={post.title}>
                            <Card padding="none" className="blog-grid__post">
                                <Cover kind={post.cover} />
                                <div className="blog-grid__body">
                                    <div className="blog-grid__meta">
                                        <Tag size="sm">{post.category}</Tag>
                                        <time dateTime={post.iso}>{post.date}</time>
                                    </div>
                                    <h3 className="blog-grid__post-title">
                                        <a className="blog-grid__link" href="#">
                                            {post.title}
                                        </a>
                                    </h3>
                                    <p className="blog-grid__excerpt">{post.excerpt}</p>
                                    <div className="blog-grid__byline">
                                        <User name={post.author} description={post.role} size="sm" />
                                        <span className="blog-grid__read">{post.read}</span>
                                    </div>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>

                <div className="blog-grid__footer">
                    <Button shape="pill" endIcon={<ArrowRight size={16} />}>
                        Browse every post
                    </Button>
                </div>
            </div>
        </section>
    );
}
