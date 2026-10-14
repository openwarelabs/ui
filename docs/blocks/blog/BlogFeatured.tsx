import { Blog02, type Blog02Post } from "@openwarelabs/blocks";

import "./BlogFeatured.css";

type CoverKind = "horizon" | "orbit" | "diff" | "bars";

/**
 * A post's cover, drawn with CSS from the brand scale: filling the featured post's frame, or small beside a title. In
 * your own posts, pass an image: <img src="…" alt="" />.
 */
function Cover({ kind, size }: { kind: CoverKind; size: "fill" | "small" }) {
    return (
        <div className={`blog-featured__cover blog-featured__cover--${kind} blog-featured__cover--${size}`} aria-hidden="true">
            {kind === "horizon" ? (
                <>
                    <span className="blog-featured__shape blog-featured__sun">
                        <span className="blog-featured__brass" />
                    </span>
                    <span className="blog-featured__shape blog-featured__water">
                        <span />
                        <span />
                        <span />
                    </span>
                    <span className="blog-featured__shape blog-featured__wordmark">Halcyon</span>
                </>
            ) : null}
            {kind === "orbit" ? (
                <>
                    <span className="blog-featured__shape blog-featured__ring blog-featured__ring--3" />
                    <span className="blog-featured__shape blog-featured__ring blog-featured__ring--2" />
                    <span className="blog-featured__shape blog-featured__ring blog-featured__ring--1" />
                    <span className="blog-featured__shape blog-featured__core" />
                    <span className="blog-featured__brass" />
                </>
            ) : null}
            {kind === "diff" ? (
                <>
                    <span className="blog-featured__shape blog-featured__pane blog-featured__pane--back">
                        <span className="blog-featured__line" style={{ width: "70%" }} />
                        <span className="blog-featured__line" style={{ width: "88%" }} />
                        <span className="blog-featured__line" style={{ width: "54%" }} />
                    </span>
                    <span className="blog-featured__shape blog-featured__pane blog-featured__pane--front">
                        <span className="blog-featured__line" style={{ width: "58%" }} />
                        <span className="blog-featured__line blog-featured__line--added" style={{ width: "82%" }}>
                            <span className="blog-featured__brass" />
                        </span>
                        <span className="blog-featured__line blog-featured__line--added" style={{ width: "64%" }} />
                    </span>
                </>
            ) : null}
            {kind === "bars" ? (
                <span className="blog-featured__shape blog-featured__chart">
                    <span className="blog-featured__bar" />
                    <span className="blog-featured__bar" />
                    <span className="blog-featured__bar" />
                    <span className="blog-featured__bar" />
                    <span className="blog-featured__bar" />
                    <span className="blog-featured__bar">
                        <span className="blog-featured__brass" />
                    </span>
                </span>
            ) : null}
        </div>
    );
}

const featured: Blog02Post = {
    title: "How Halcyon ships twice a day with a team of six",
    href: "#",
    category: "Customer story",
    date: "15 Sep 2026",
    dateTime: "2026-09-15",
    excerpt:
        "Halcyon moved planning, reviews and deploys into Acme. Agents take the routine fixes, reviews land within the hour, and release day is just another day.",
    facts: [
        { label: "Deploys a day", value: "2.3" },
        { label: "Median review", value: "38m" },
        { label: "By agents", value: "31%" },
    ],
    author: { name: "Jonas Berg", jobTitle: "Customer success" },
    readingTime: "6 min read",
    cover: <Cover kind="horizon" size="fill" />,
};

const posts: Blog02Post[] = [
    {
        title: "Agents now open their own pull requests",
        href: "#",
        category: "Product",
        date: "8 Oct 2026",
        dateTime: "2026-10-08",
        author: { name: "Maya Chen" },
        cover: <Cover kind="orbit" size="small" />,
    },
    {
        title: "How we cut median review time to 42 minutes",
        href: "#",
        category: "Engineering",
        date: "30 Sep 2026",
        dateTime: "2026-09-30",
        author: { name: "Tomás Reyes" },
        cover: <Cover kind="diff" size="small" />,
    },
    {
        title: "Roll back any deploy in one click",
        href: "#",
        category: "Product",
        date: "22 Sep 2026",
        dateTime: "2026-09-22",
        author: { name: "Clara Novak" },
        cover: <Cover kind="bars" size="small" />,
    },
];

export function BlogFeatured() {
    return <Blog02 title="Latest from Acme" allLink={{ label: "All posts", href: "#" }} featured={featured} posts={posts} />;
}
