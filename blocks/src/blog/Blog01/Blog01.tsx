import { useId, useState } from "react";

import { Card, cx, Link, SectionHeading, SegmentedControl, Tag, Text, User } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import type { Blog01Props } from "./Blog01.types";

// The filter's value for every post: no category is empty.
const all = "";

/** A grid of post cards, each with a cover, its category and date, a title, an excerpt and the author, with a filter by category. */
export function Blog01({ eyebrow, title, description, posts, categories, moreAction, labels = {}, className, ...props }: Blog01Props) {
    const [filter, setFilter] = useState(all);
    const titleId = `${useId()}-title`;
    const shown = posts.map((post, index) => ({ post, index })).filter(({ post }) => filter === all || post.category === filter);

    return (
        <section className={cx("ow-blog01", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-blog01__inner">
                <div className="ow-blog01__header">
                    <SectionHeading eyebrow={eyebrow} title={<span id={titleId}>{title}</span>} intro={description} />
                    {categories?.length ? (
                        <div className="ow-blog01__filter">
                            <SegmentedControl
                                aria-label={labels.filter ?? "Show posts about"}
                                options={[{ value: all, label: labels.all ?? "All" }, ...categories.map((value) => ({ value, label: value }))]}
                                value={filter}
                                onChange={setFilter}
                            />
                        </div>
                    ) : null}
                </div>

                <ul className="ow-blog01__posts">
                    {shown.map(({ post, index }) => (
                        <li key={index}>
                            <Card padding="none" className="ow-blog01__post">
                                {post.cover ? <div className="ow-blog01__cover">{post.cover}</div> : null}
                                <div className="ow-blog01__body">
                                    <Text variant="caption" as="div" className="ow-blog01__meta">
                                        {post.category ? <Tag size="sm">{post.category}</Tag> : null}
                                        <time dateTime={post.dateTime}>{post.date}</time>
                                    </Text>
                                    <Text variant="heading" as="h3" className="ow-blog01__post-title">
                                        <Link href={post.href} variant="standalone" className="ow-blog01__link">
                                            {post.title}
                                        </Link>
                                    </Text>
                                    {post.excerpt ? (
                                        <Text variant="copy" className="ow-blog01__excerpt">
                                            {post.excerpt}
                                        </Text>
                                    ) : null}
                                    {post.author || post.readingTime ? (
                                        <div className="ow-blog01__byline">
                                            {post.author ? (
                                                <User name={post.author.name} description={post.author.jobTitle} src={post.author.avatar} size="sm" />
                                            ) : null}
                                            {post.readingTime ? (
                                                <Text variant="caption" className="ow-blog01__read">
                                                    {post.readingTime}
                                                </Text>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>

                {moreAction ? (
                    <div className="ow-blog01__footer">
                        <BlockActionButton action={moreAction} variant="secondary" size="md" />
                    </div>
                ) : null}
            </div>
        </section>
    );
}
