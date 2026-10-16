import { Contact02, type Contact02Option } from "@openwarelabs/blocks";
import { Avatar, AvatarGroup, Link } from "@openwarelabs/ui";
import { BookOpen, Mail, MessagesSquare } from "lucide-react";

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

const options: Contact02Option[] = [
    {
        icon: <BookOpen size={20} />,
        title: "Documentation",
        description: "Guides for setup, agents and deploys, and the full API reference.",
        listLabel: "Popular guides",
        list: guides.map((guide) => ({ label: guide.title, href: "#", meta: guide.time })),
        link: { label: "Browse the docs", href: "#" },
    },
    {
        icon: <MessagesSquare size={20} />,
        title: "Community forum",
        description: "Ask how other teams work with Acme. Our engineers answer there every week.",
        listLabel: "Recent threads",
        list: threads.map((thread) => ({ label: thread.title, href: "#", meta: <>{thread.replies} replies</> })),
        link: { label: "Join the forum", href: "#" },
        footNote: (
            <>
                <AvatarGroup size="sm" max={3}>
                    <Avatar name="Declan Walsh" />
                    <Avatar name="Niamh Byrne" />
                    <Avatar name="Seán McCarthy" />
                </AvatarGroup>
                4,200 members
            </>
        ),
    },
    {
        icon: <Mail size={20} />,
        title: "Email support",
        description: "For anything about your own workspace: billing, access, or a deploy that won't go.",
        email: "support@example.com",
        listLabel: "Reply times by plan",
        list: replyTimes.map((row) => ({ label: row.plan, meta: row.time })),
        link: { label: "Write to support", href: "mailto:support@example.com" },
    },
];

export function ContactSupport() {
    return (
        <Contact02
            eyebrow="Support"
            title="How can we help?"
            description="Most answers are already written down. When they aren't, the people who build Acme read every message."
            options={options}
            status={{
                label: "All systems working",
                description: (
                    <>
                        Something broken? Check the <Link href="#">status page</Link> before you write.
                    </>
                ),
            }}
        />
    );
}
