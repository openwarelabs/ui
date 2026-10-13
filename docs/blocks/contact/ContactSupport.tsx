import { Avatar, AvatarGroup, Card, CopyButton, Link, SectionHeading, Text } from "@openwarelabs/ui";
import { ArrowRight, BookOpen, Mail, MessagesSquare } from "lucide-react";

import "./ContactSupport.css";

const guides = [
    { title: "Connect your first repository", time: "4 min" },
    { title: "Choose what an agent can access", time: "6 min" },
    { title: "Set up SAML single sign-on", time: "8 min" },
];

const threads = [
    { title: "Running agents on a monorepo", replies: 24 },
    { title: "Preview deploys for a mobile app", replies: 11 },
    { title: "Reviewing agent PRs as a team of two", replies: 17 },
];

const replyTimes = [
    { plan: "Free", time: "Through the forum" },
    { plan: "Team", time: "Within a working day" },
    { plan: "Business", time: "Within 4 hours" },
    { plan: "Enterprise", time: "Within 1 hour, any day" },
];

export function ContactSupport() {
    return (
        <section className="contact-support" aria-labelledby="contact-support-title">
            <div className="contact-support__inner">
                <SectionHeading
                    align="center"
                    eyebrow="Support"
                    title={<span id="contact-support-title">How can we help?</span>}
                    intro="Most answers are already written down. When they aren't, the people who build Acme read every message."
                />

                <div className="contact-support__grid">
                    <Card padding="none" className="contact-support__card">
                        <div className="contact-support__body">
                            <span className="contact-support__icon" aria-hidden="true">
                                <BookOpen size={20} />
                            </span>
                            <Text variant="heading" as="h3" className="contact-support__title">
                                Documentation
                            </Text>
                            <Text variant="copy" className="contact-support__text">
                                Guides for setup, agents and deploys, and the full API reference.
                            </Text>
                            <ul className="contact-support__list" aria-label="Popular guides">
                                {guides.map((guide) => (
                                    <Text key={guide.title} variant="body" as="li">
                                        <Link href="#" variant="standalone">
                                            {guide.title}
                                        </Link>
                                        <Text variant="caption" className="contact-support__meta">
                                            {guide.time}
                                        </Text>
                                    </Text>
                                ))}
                            </ul>
                        </div>
                        <div className="contact-support__foot">
                            <Link href="#" variant="standalone" className="contact-support__foot-link">
                                Browse the docs
                                <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                    </Card>

                    <Card padding="none" className="contact-support__card">
                        <div className="contact-support__body">
                            <span className="contact-support__icon" aria-hidden="true">
                                <MessagesSquare size={20} />
                            </span>
                            <Text variant="heading" as="h3" className="contact-support__title">
                                Community forum
                            </Text>
                            <Text variant="copy" className="contact-support__text">
                                Ask how other teams work with Acme. Our engineers answer there every week.
                            </Text>
                            <ul className="contact-support__list" aria-label="Recent threads">
                                {threads.map((thread) => (
                                    <Text key={thread.title} variant="body" as="li">
                                        <Link href="#" variant="standalone">
                                            {thread.title}
                                        </Link>
                                        <Text variant="caption" className="contact-support__meta">
                                            {thread.replies} replies
                                        </Text>
                                    </Text>
                                ))}
                            </ul>
                        </div>
                        <div className="contact-support__foot">
                            <Link href="#" variant="standalone" className="contact-support__foot-link">
                                Join the forum
                                <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                            <Text variant="caption" className="contact-support__members">
                                <AvatarGroup size="sm" max={3}>
                                    <Avatar name="Jonas Berg" />
                                    <Avatar name="Aiko Tanaka" />
                                    <Avatar name="Sam Okafor" />
                                </AvatarGroup>
                                4,200 members
                            </Text>
                        </div>
                    </Card>

                    <Card padding="none" className="contact-support__card">
                        <div className="contact-support__body">
                            <span className="contact-support__icon" aria-hidden="true">
                                <Mail size={20} />
                            </span>
                            <Text variant="heading" as="h3" className="contact-support__title">
                                Email support
                            </Text>
                            <Text variant="copy" className="contact-support__text">
                                For anything about your own workspace: billing, access, or a deploy that won't go.
                            </Text>
                            <div className="contact-support__address">
                                <Text variant="body" as="span">
                                    support@example.com
                                </Text>
                                <CopyButton value="support@example.com" label="Copy address" iconOnly />
                            </div>
                            <ul className="contact-support__list" aria-label="Reply times by plan">
                                {replyTimes.map((row) => (
                                    <Text key={row.plan} variant="body" as="li">
                                        <span>{row.plan}</span>
                                        <Text variant="caption" className="contact-support__meta">
                                            {row.time}
                                        </Text>
                                    </Text>
                                ))}
                            </ul>
                        </div>
                        <div className="contact-support__foot">
                            <Link href="mailto:support@example.com" variant="standalone" className="contact-support__foot-link">
                                Write to support
                                <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                    </Card>
                </div>

                <Text variant="body" tone="muted" align="center" className="contact-support__status">
                    <Text variant="label" as="span" tone="default" className="contact-support__state">
                        All systems working
                    </Text>
                    <span>
                        Something broken? Check the <Link href="#">status page</Link> before you write.
                    </span>
                </Text>
            </div>
        </section>
    );
}
