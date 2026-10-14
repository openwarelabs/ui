import { useEffect, useId, useState, type MouseEvent } from "react";

import { CopyButton, cx, Disclosure, Link, Tag, TagGroup, Text, User } from "@openwarelabs/ui";

import { ArrowLeftIcon, CalendarDaysIcon, ClockIcon } from "@blocks/shared/icons";
import type { Blog04Props } from "./Blog04.types";

/** An article's page: the title, author and date, a wide cover, then the text at a readable width with On this page beside it. */
export function Blog04({
    backLink,
    category,
    topic,
    title,
    description,
    author,
    date,
    dateTime,
    readingTime,
    cover,
    children,
    sections = [],
    tags = [],
    shareUrl,
    labels = {},
    className,
    ...props
}: Blog04Props) {
    const [active, setActive] = useState(sections[0]?.id);
    const id = useId();
    const titleId = `${id}-title`;
    const contentsLabel = labels.contents ?? "On this page";
    const sectionIds = sections.map((section) => section.id).join(" ");

    // Marks the section being read: the last heading that has scrolled past the top of the window.
    useEffect(() => {
        const ids = sectionIds.split(" ").filter(Boolean);
        if (!ids.length) return;
        const onScroll = () => {
            let current = ids[0];
            for (const sectionId of ids) {
                const heading = document.getElementById(sectionId);
                if (heading && heading.getBoundingClientRect().top < 140) current = sectionId;
            }
            setActive(current);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [sectionIds]);

    const go = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        event.preventDefault();
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.getElementById(sectionId)?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
        setActive(sectionId);
    };

    const contents = (
        <ol className="ow-blog04__toc">
            {sections.map((section) => (
                <li key={section.id}>
                    <Link
                        href={`#${section.id}`}
                        variant="standalone"
                        className="ow-blog04__toc-link"
                        aria-current={active === section.id ? "location" : undefined}
                        onClick={(event) => go(event, section.id)}
                    >
                        {section.title}
                    </Link>
                </li>
            ))}
        </ol>
    );

    const copy = shareUrl ? <CopyButton value={shareUrl} label={labels.copyLink ?? "Copy link"} copiedLabel={labels.linkCopied ?? "Link copied"} /> : null;

    return (
        <article className={cx("ow-blog04", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-blog04__inner">
                {backLink ? (
                    <Link href={backLink.href} variant="standalone" className="ow-blog04__back">
                        <ArrowLeftIcon size={16} />
                        {backLink.label}
                    </Link>
                ) : null}

                <header className="ow-blog04__header">
                    {category || topic ? (
                        <div className="ow-blog04__meta-top">
                            {category ? <Tag size="sm">{category}</Tag> : null}
                            {topic ? (
                                <Text variant="body" as="span" tone="muted">
                                    {topic}
                                </Text>
                            ) : null}
                        </div>
                    ) : null}
                    <Text variant="page-title" id={titleId} className="ow-blog04__title">
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="lead" className="ow-blog04__dek">
                            {description}
                        </Text>
                    ) : null}
                    {author || date || readingTime ? (
                        <div className="ow-blog04__byline">
                            {author ? <User name={author.name} description={author.jobTitle} src={author.avatar} /> : null}
                            {date || readingTime ? (
                                <Text variant="body" as="span" tone="muted" className="ow-blog04__byline-facts">
                                    {date ? (
                                        <span>
                                            <CalendarDaysIcon size={15} />
                                            <time dateTime={dateTime}>{date}</time>
                                        </span>
                                    ) : null}
                                    {readingTime ? (
                                        <span>
                                            <ClockIcon size={15} />
                                            {readingTime}
                                        </span>
                                    ) : null}
                                </Text>
                            ) : null}
                        </div>
                    ) : null}
                </header>

                {cover ? <div className="ow-blog04__cover">{cover}</div> : null}

                <div className="ow-blog04__layout">
                    {sections.length ? (
                        <Disclosure title={contentsLabel} headingLevel={2} className="ow-blog04__toc-fold">
                            {contents}
                        </Disclosure>
                    ) : null}

                    <div className="ow-blog04__prose">
                        {children}

                        {tags.length || copy ? (
                            <div className="ow-blog04__end">
                                {tags.length ? (
                                    <TagGroup label={labels.topics ?? "Topics"}>
                                        {tags.map((tag, index) => (
                                            <Tag key={index} size="sm">
                                                {tag}
                                            </Tag>
                                        ))}
                                    </TagGroup>
                                ) : null}
                                {copy}
                            </div>
                        ) : null}
                    </div>

                    {sections.length || copy ? (
                        <aside className="ow-blog04__aside" aria-labelledby={sections.length ? `${id}-toc` : undefined}>
                            {sections.length ? (
                                <>
                                    <Text variant="label" as="p" id={`${id}-toc`} className="ow-blog04__toc-label">
                                        {contentsLabel}
                                    </Text>
                                    {contents}
                                </>
                            ) : null}
                            {copy ? <div className="ow-blog04__aside-share">{copy}</div> : null}
                        </aside>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
