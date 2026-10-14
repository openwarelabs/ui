import { useId } from "react";

import { Avatar, Card, cx, Link, Tag, Text, User } from "@openwarelabs/ui";

import { ArrowRightIcon } from "@blocks/shared/icons";
import type { Blog02Props } from "./Blog02.types";

/** One post large, with its cover, excerpt, figures and author, and the next few in a row below it. */
export function Blog02({ title, allLink, featured, posts = [], className, ...props }: Blog02Props) {
    const titleId = `${useId()}-title`;

    return (
        <section className={cx("ow-blog02", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-blog02__inner">
                <div className="ow-blog02__header">
                    <Text variant="section-title" id={titleId}>
                        {title}
                    </Text>
                    {allLink ? (
                        <Link href={allLink.href} variant="standalone" className="ow-blog02__all">
                            {allLink.label}
                            <ArrowRightIcon size={16} />
                        </Link>
                    ) : null}
                </div>

                <Card padding="none" className="ow-blog02__lead">
                    {featured.cover ? <div className="ow-blog02__lead-cover">{featured.cover}</div> : null}
                    <div className="ow-blog02__lead-body">
                        <Text variant="caption" as="div" className="ow-blog02__meta">
                            {featured.category ? <Tag size="sm">{featured.category}</Tag> : null}
                            <time dateTime={featured.dateTime}>{featured.date}</time>
                        </Text>
                        <Text variant="heading" as="h3" className="ow-blog02__lead-title">
                            <Link href={featured.href} variant="standalone" className="ow-blog02__link">
                                {featured.title}
                            </Link>
                        </Text>
                        {featured.excerpt ? (
                            <Text variant="lead" className="ow-blog02__excerpt">
                                {featured.excerpt}
                            </Text>
                        ) : null}
                        {featured.facts?.length ? (
                            <dl className="ow-blog02__facts">
                                {featured.facts.map((fact, index) => (
                                    <div key={index} className="ow-blog02__fact">
                                        <Text variant="caption" as="dt">
                                            {fact.label}
                                        </Text>
                                        <Text variant="heading" as="dd" className="ow-blog02__fact-value">
                                            {fact.value}
                                        </Text>
                                    </div>
                                ))}
                            </dl>
                        ) : null}
                        {featured.author || featured.readingTime ? (
                            <div className="ow-blog02__byline">
                                {featured.author ? (
                                    <User name={featured.author.name} description={featured.author.jobTitle} src={featured.author.avatar} />
                                ) : null}
                                {featured.readingTime ? (
                                    <Text variant="caption" className="ow-blog02__read">
                                        {featured.readingTime}
                                    </Text>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </Card>

                {posts.length ? (
                    <ul className="ow-blog02__more">
                        {posts.map((post, index) => (
                            <li key={index}>
                                <div className="ow-blog02__item">
                                    {post.cover ? <div className="ow-blog02__thumb">{post.cover}</div> : null}
                                    <div>
                                        <Text variant="caption" as="div" className="ow-blog02__meta">
                                            {post.category ? (
                                                <>
                                                    <span>{post.category}</span>
                                                    <span aria-hidden="true">·</span>
                                                </>
                                            ) : null}
                                            <time dateTime={post.dateTime}>{post.date}</time>
                                        </Text>
                                        <Text variant="card-title" as="h3" className="ow-blog02__item-title">
                                            <Link href={post.href} variant="standalone" className="ow-blog02__link">
                                                {post.title}
                                            </Link>
                                        </Text>
                                        {post.author ? (
                                            <Text variant="caption" as="div" className="ow-blog02__item-author">
                                                <Avatar name={post.author.name} src={post.author.avatar} size="sm" />
                                                {post.author.name}
                                            </Text>
                                        ) : null}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </section>
    );
}
