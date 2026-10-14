import { Blog04 } from "@openwarelabs/blocks";
import { Code, CodeBlock, Link, Text } from "@openwarelabs/ui";

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

/** The cover, drawn with CSS. In your own articles, pass an image: <img src="…" alt="" />. */
function Cover() {
    return (
        <div className="blog-article__drawing" aria-hidden="true">
            <span className="blog-article__ring blog-article__ring--4" />
            <span className="blog-article__ring blog-article__ring--3" />
            <span className="blog-article__ring blog-article__ring--2" />
            <span className="blog-article__ring blog-article__ring--1" />
            <span className="blog-article__core" />
            <span className="blog-article__orbiter blog-article__orbiter--1" />
            <span className="blog-article__orbiter blog-article__orbiter--2" />
            <span className="blog-article__orbiter blog-article__orbiter--brass" />
        </div>
    );
}

export function BlogArticle() {
    return (
        <Blog04
            backLink={{ label: "All posts", href: "#" }}
            category="Product"
            topic="Agents"
            title="Agents now open their own pull requests"
            description="Hand an agent a task and it comes back with a branch, a passing build and a pull request your team reviews like any other."
            author={{ name: "Maya Chen", jobTitle: "Product lead" }}
            date="8 Oct 2026"
            dateTime="2026-10-08"
            readingTime="4 min read"
            cover={<Cover />}
            sections={sections}
            tags={["Agents", "Pull requests", "Reviews"]}
            shareUrl="example.com/blog/agents-open-pull-requests"
        >
            <Text variant="heading" as="h2" id="blog-article-what-changed">
                What's changed
            </Text>
            <Text variant="prose" tone="soft">
                Until now, an agent run ended with a diff. Someone on your team had to read it, copy it onto a branch, push it and open a pull request before
                anyone could review it. For small fixes, that was most of the work.
            </Text>
            <Text variant="prose" tone="soft">
                From today, agents do that part themselves. Assign a task to an agent and it creates a branch, makes the change, runs your checks and opens a
                pull request with a summary of what it changed and why. Your team reviews it like any other: comments, suggestions and approvals all work the
                same.
            </Text>

            <Text variant="heading" as="h2" id="blog-article-how-it-works">
                How a run works
            </Text>
            <Text variant="prose" tone="soft">
                Each run starts from a fresh copy of your repository, set up the way your CI sets it up. The agent:
            </Text>
            <Text variant="prose" as="ol" tone="soft">
                <li>reads the task and the files it mentions,</li>
                <li>makes the smallest change that does the job,</li>
                <li>runs your tests and linters, and fixes what fails,</li>
                <li>opens the pull request and asks the reviewers you'd expect.</li>
            </Text>
            <blockquote>
                <Text variant="heading" as="p">
                    We never wanted to take people out of review. We wanted what reaches review to be worth a person's time.
                </Text>
            </blockquote>
            <Text variant="prose" tone="soft">
                If the checks still fail after three tries, the agent stops and hands the task back with what it tried, so nobody inherits a half-finished
                branch.
            </Text>

            <Text variant="heading" as="h2" id="blog-article-setting-it-up">
                Setting it up
            </Text>
            <Text variant="prose" tone="soft">
                Agents can open pull requests in any project on the Team plan or above. Turn it on in a project's settings, or add it to the project's{" "}
                <Code>acme.yaml</Code>:
            </Text>
            <CodeBlock code={config} title="acme.yaml" language="yaml" />
            <Text variant="prose" tone="soft">
                Pull requests from agents carry an <strong>Agent</strong> label and their branches start with <Code>agent/</Code>, so you can give them their
                own branch rules if you want to.
            </Text>

            <Text variant="heading" as="h2" id="blog-article-whats-next">
                What's next
            </Text>
            <Text variant="prose" tone="soft">
                Next, agents will answer review comments on their own pull requests and push the fixes. A few teams are trying it now; if you'd like to join
                them, write to <Link href="#">agents@example.com</Link>.
            </Text>
        </Blog04>
    );
}
