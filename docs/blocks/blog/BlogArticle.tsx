import { useEffect, useState, type MouseEvent } from "react";

import { Code, CodeBlock, CopyButton, Disclosure, Link, Tag, TagGroup, User } from "@openwarelabs/ui";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";

import "./BlogArticle.css";

const sections = [
    { id: "blog-article-what-changed", title: "What's changed" },
    { id: "blog-article-how-it-works", title: "How a run works" },
    { id: "blog-article-setting-it-up", title: "Setting it up" },
    { id: "blog-article-whats-next", title: "What's next" },
];

const config = `agents:
  pull_requests: true
  branch_prefix: agent/
  reviewers: suggested     # or a list of people
  checks:
    - npm test
    - npm run lint
  max_attempts: 3`;

const postLink = "example.com/blog/agents-open-pull-requests";

/** The list of sections, shared by the aside on desktop and the disclosure on smaller screens. */
function Contents({ active, onGo }: { active: string; onGo: (event: MouseEvent<HTMLAnchorElement>, id: string) => void }) {
    return (
        <ol className="blog-article__toc">
            {sections.map((section) => (
                <li key={section.id}>
                    <a
                        className="blog-article__toc-link"
                        href={`#${section.id}`}
                        aria-current={active === section.id ? "location" : undefined}
                        onClick={(event) => onGo(event, section.id)}
                    >
                        {section.title}
                    </a>
                </li>
            ))}
        </ol>
    );
}

export function BlogArticle() {
    const [active, setActive] = useState(sections[0]!.id);

    // Marks the section being read: the last heading that has scrolled past the top of the window.
    useEffect(() => {
        const onScroll = () => {
            let current = sections[0]!.id;
            for (const section of sections) {
                const heading = document.getElementById(section.id);
                if (heading && heading.getBoundingClientRect().top < 140) current = section.id;
            }
            setActive(current);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
        event.preventDefault();
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.getElementById(id)?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
        setActive(id);
    };

    return (
        <article className="blog-article" aria-labelledby="blog-article-title">
            <div className="blog-article__inner">
                <Link href="#" variant="standalone" className="blog-article__back">
                    <ArrowLeft size={16} aria-hidden="true" />
                    All posts
                </Link>

                <header className="blog-article__header">
                    <div className="blog-article__meta-top">
                        <Tag size="sm">Product</Tag>
                        <span>Agents</span>
                    </div>
                    <h1 id="blog-article-title" className="blog-article__title">
                        Agents now open their own pull requests
                    </h1>
                    <p className="blog-article__dek">
                        Hand an agent a task and it comes back with a branch, a passing build and a pull request your team reviews like any other.
                    </p>
                    <div className="blog-article__byline">
                        <User name="Maya Chen" description="Product lead" />
                        <span className="blog-article__byline-facts">
                            <span>
                                <CalendarDays size={15} aria-hidden="true" />
                                <time dateTime="2026-10-08">8 Oct 2026</time>
                            </span>
                            <span>
                                <Clock size={15} aria-hidden="true" />4 min read
                            </span>
                        </span>
                    </div>
                </header>

                {/* The cover, drawn with CSS. Swap it for an image: <img src="…" alt="" />. */}
                <div className="blog-article__cover" aria-hidden="true">
                    <span className="blog-article__ring blog-article__ring--4" />
                    <span className="blog-article__ring blog-article__ring--3" />
                    <span className="blog-article__ring blog-article__ring--2" />
                    <span className="blog-article__ring blog-article__ring--1" />
                    <span className="blog-article__core" />
                    <span className="blog-article__orbiter blog-article__orbiter--1" />
                    <span className="blog-article__orbiter blog-article__orbiter--2" />
                    <span className="blog-article__orbiter blog-article__orbiter--brass" />
                </div>

                <div className="blog-article__layout">
                    <Disclosure title="On this page" headingLevel={2} className="blog-article__toc-fold">
                        <Contents active={active} onGo={go} />
                    </Disclosure>

                    <div className="blog-article__prose ow-type-prose">
                        <h2 id={sections[0]!.id}>{sections[0]!.title}</h2>
                        <p>
                            Until now, an agent run ended with a diff. Someone on your team had to read it, copy it onto a branch, push it and open a pull
                            request before anyone could review it. For small fixes, that was most of the work.
                        </p>
                        <p>
                            From today, agents do that part themselves. Assign a task to an agent and it creates a branch, makes the change, runs your checks
                            and opens a pull request with a summary of what it changed and why. Your team reviews it like any other: comments, suggestions and
                            approvals all work the same.
                        </p>

                        <h2 id={sections[1]!.id}>{sections[1]!.title}</h2>
                        <p>Each run starts from a fresh copy of your repository, set up the way your CI sets it up. The agent:</p>
                        <ol>
                            <li>reads the task and the files it mentions,</li>
                            <li>makes the smallest change that does the job,</li>
                            <li>runs your tests and linters, and fixes what fails,</li>
                            <li>opens the pull request and asks the reviewers you'd expect.</li>
                        </ol>
                        <blockquote className="blog-article__quote">
                            <p>We never wanted to take people out of review. We wanted what reaches review to be worth a person's time.</p>
                        </blockquote>
                        <p>
                            If the checks still fail after three tries, the agent stops and hands the task back with what it tried, so nobody inherits a
                            half-finished branch.
                        </p>

                        <h2 id={sections[2]!.id}>{sections[2]!.title}</h2>
                        <p>
                            Agents can open pull requests in any project on the Team plan or above. Turn it on in a project's settings, or add it to the
                            project's <Code>acme.yaml</Code>:
                        </p>
                        <CodeBlock code={config} title="acme.yaml" language="yaml" />
                        <p>
                            Pull requests from agents carry an <strong>Agent</strong> label and their branches start with <Code>agent/</Code>, so you can give
                            them their own branch rules if you want to.
                        </p>

                        <h2 id={sections[3]!.id}>{sections[3]!.title}</h2>
                        <p>
                            Next, agents will answer review comments on their own pull requests and push the fixes. A few teams are trying it now; if you'd like
                            to join them, write to <Link href="#">agents@example.com</Link>.
                        </p>

                        <div className="blog-article__end">
                            <TagGroup label="Topics">
                                <Tag size="sm">Agents</Tag>
                                <Tag size="sm">Pull requests</Tag>
                                <Tag size="sm">Reviews</Tag>
                            </TagGroup>
                            <CopyButton value={postLink} label="Copy link" copiedLabel="Link copied" />
                        </div>
                    </div>

                    <aside className="blog-article__aside" aria-labelledby="blog-article-toc">
                        <p id="blog-article-toc" className="blog-article__toc-label">
                            On this page
                        </p>
                        <Contents active={active} onGo={go} />
                        <div className="blog-article__aside-share">
                            <CopyButton value={postLink} label="Copy link" copiedLabel="Link copied" />
                        </div>
                    </aside>
                </div>
            </div>
        </article>
    );
}
