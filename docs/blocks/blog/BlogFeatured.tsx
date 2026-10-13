import { Avatar, Card, Link, Tag, Text, User } from "@openwarelabs/ui";
import { ArrowRight } from "lucide-react";

import "./BlogFeatured.css";

type CoverKind = "horizon" | "orbit" | "diff" | "bars";

const more: Array<{ title: string; category: string; date: string; iso: string; author: string; cover: CoverKind }> = [
    { title: "Agents now open their own pull requests", category: "Product", date: "8 Oct 2026", iso: "2026-10-08", author: "Maya Chen", cover: "orbit" },
    {
        title: "How we cut median review time to 42 minutes",
        category: "Engineering",
        date: "30 Sep 2026",
        iso: "2026-09-30",
        author: "Tomás Reyes",
        cover: "diff",
    },
    { title: "Roll back any deploy in one click", category: "Product", date: "22 Sep 2026", iso: "2026-09-22", author: "Clara Novak", cover: "bars" },
];

/** A post's cover, drawn with CSS from the brand scale. Swap it for an image: <img src="…" alt="" />. */
function Cover({ kind, className = "" }: { kind: CoverKind; className?: string }) {
    return (
        <div className={`blog-featured__cover blog-featured__cover--${kind} ${className}`} aria-hidden="true">
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

export function BlogFeatured() {
    return (
        <section className="blog-featured" aria-labelledby="blog-featured-title">
            <div className="blog-featured__inner">
                <div className="blog-featured__header">
                    <Text variant="section-title" id="blog-featured-title">
                        Latest from Acme
                    </Text>
                    <Link href="#" variant="standalone" className="blog-featured__all">
                        All posts
                        <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>

                <Card padding="none" className="blog-featured__lead">
                    <Cover kind="horizon" />
                    <div className="blog-featured__lead-body">
                        <Text variant="caption" as="div" className="blog-featured__meta">
                            <Tag size="sm">Customer story</Tag>
                            <time dateTime="2026-09-15">15 Sep 2026</time>
                        </Text>
                        <Text variant="heading" as="h3" className="blog-featured__lead-title">
                            <Link href="#" variant="standalone" className="blog-featured__link">
                                How Halcyon ships twice a day with a team of six
                            </Link>
                        </Text>
                        <Text variant="lead" className="blog-featured__excerpt">
                            Halcyon moved planning, reviews and deploys into Acme. Agents take the routine fixes, reviews land within the hour, and release day
                            is just another day.
                        </Text>
                        <dl className="blog-featured__facts">
                            <div className="blog-featured__fact">
                                <Text variant="caption" as="dt">
                                    Deploys a day
                                </Text>
                                <Text variant="heading" as="dd" className="blog-featured__fact-value">
                                    2.3
                                </Text>
                            </div>
                            <div className="blog-featured__fact">
                                <Text variant="caption" as="dt">
                                    Median review
                                </Text>
                                <Text variant="heading" as="dd" className="blog-featured__fact-value">
                                    38m
                                </Text>
                            </div>
                            <div className="blog-featured__fact">
                                <Text variant="caption" as="dt">
                                    By agents
                                </Text>
                                <Text variant="heading" as="dd" className="blog-featured__fact-value">
                                    31%
                                </Text>
                            </div>
                        </dl>
                        <div className="blog-featured__byline">
                            <User name="Jonas Berg" description="Customer success" />
                            <Text variant="caption" className="blog-featured__read">
                                6 min read
                            </Text>
                        </div>
                    </div>
                </Card>

                <ul className="blog-featured__more">
                    {more.map((post) => (
                        <li key={post.title}>
                            <div className="blog-featured__item">
                                <Cover kind={post.cover} className="blog-featured__thumb" />
                                <div>
                                    <Text variant="caption" as="div" className="blog-featured__meta">
                                        <span>{post.category}</span>
                                        <span aria-hidden="true">·</span>
                                        <time dateTime={post.iso}>{post.date}</time>
                                    </Text>
                                    <Text variant="card-title" as="h3" className="blog-featured__item-title">
                                        <Link href="#" variant="standalone" className="blog-featured__link">
                                            {post.title}
                                        </Link>
                                    </Text>
                                    <Text variant="caption" as="div" className="blog-featured__item-author">
                                        <Avatar name={post.author} size="sm" />
                                        {post.author}
                                    </Text>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
