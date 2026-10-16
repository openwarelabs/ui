import { Blog01, type Blog01Post } from "@openwarelabs/blocks";
import { ArrowRight } from "lucide-react";

import "./BlogGrid.css";

type CoverKind = "orbit" | "diff" | "bars" | "horizon" | "glyph" | "tiles";

/** A post's cover, drawn with CSS from the brand scale. In your own posts, pass an image: <img src="…" alt="" />. */
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

const posts: Blog01Post[] = [
    {
        title: "Agents now open their own pull requests",
        href: "#",
        excerpt: "Hand an agent a task and it comes back with a branch, a passing build and a pull request your team reviews like any other.",
        category: "Product",
        date: "8 Oct 2026",
        dateTime: "2026-10-08",
        readingTime: "4 min read",
        author: { name: "Siobhan Murphy", jobTitle: "Product lead" },
        cover: <Cover kind="orbit" />,
    },
    {
        title: "How we cut median review time to 42 minutes",
        href: "#",
        excerpt: "Smaller changes, reviewers picked by the code they touch, and a queue that tells you what's waiting on you.",
        category: "Engineering",
        date: "30 Sep 2026",
        dateTime: "2026-09-30",
        readingTime: "7 min read",
        author: { name: "Ciarán Kelly", jobTitle: "Staff engineer" },
        cover: <Cover kind="diff" />,
    },
    {
        title: "Roll back any deploy in one click",
        href: "#",
        excerpt: "Every deploy keeps the last good build warm, so undoing a bad release takes seconds, not a fresh build.",
        category: "Product",
        date: "22 Sep 2026",
        dateTime: "2026-09-22",
        readingTime: "3 min read",
        author: { name: "Aoife O'Sullivan", jobTitle: "Engineering manager" },
        cover: <Cover kind="bars" />,
    },
    {
        title: "How Halcyon ships twice a day with a team of six",
        href: "#",
        excerpt: "Halcyon moved planning, reviews and deploys into Acme, and stopped losing Fridays to release day.",
        category: "Customers",
        date: "15 Sep 2026",
        dateTime: "2026-09-15",
        readingTime: "6 min read",
        author: { name: "Declan Walsh", jobTitle: "Customer success" },
        cover: <Cover kind="horizon" />,
    },
    {
        title: "Writing tasks an agent can finish",
        href: "#",
        excerpt: "What 40,000 agent runs taught us about scope, context, and knowing when to hand the work back to a person.",
        category: "Engineering",
        date: "4 Sep 2026",
        dateTime: "2026-09-04",
        readingTime: "5 min read",
        author: { name: "Niamh Byrne", jobTitle: "Machine learning engineer" },
        cover: <Cover kind="glyph" />,
    },
    {
        title: "Quarry's move from three tools to one",
        href: "#",
        excerpt: "Tickets, code review and deploys used to live in three places. Quarry's platform team on folding them into one.",
        category: "Customers",
        date: "27 Aug 2026",
        dateTime: "2026-08-27",
        readingTime: "5 min read",
        author: { name: "Róisín O'Brien", jobTitle: "Solutions engineer" },
        cover: <Cover kind="tiles" />,
    },
];

const categories = ["Product", "Engineering", "Customers"];

export function BlogGrid() {
    return (
        <Blog01
            eyebrow="Blog"
            title="Notes on shipping software"
            description="Product news, how we build Acme, and the teams who use it."
            categories={categories}
            posts={posts}
            moreAction={{ label: "Browse every post", href: "#", endIcon: <ArrowRight size={16} /> }}
        />
    );
}
