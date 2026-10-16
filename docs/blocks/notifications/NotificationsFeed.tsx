import type { ReactNode } from "react";

import { Notifications02, type Notifications02Day } from "@openwarelabs/blocks";
import { Avatar, AvatarGroup, Badge, Link, Text } from "@openwarelabs/ui";
import { Bot, Rocket } from "lucide-react";

import "./NotificationsFeed.css";

const Who = ({ children }: { children: ReactNode }) => (
    <Text as="span" variant="label" tone="default">
        {children}
    </Text>
);
/** A commit, a branch or a diff count: mono, at the size of the line it sits in. */
const Mono = ({ children, tone }: { children: ReactNode; tone?: "success" | "danger" }) => (
    <Text variant="code" tone={tone} className="notifications-feed__mono">
        {children}
    </Text>
);
const To = ({ children }: { children: ReactNode }) => (
    <Link href="#" variant="standalone">
        {children}
    </Link>
);

const recent: Notifications02Day[] = [
    {
        dateTime: "2026-10-13",
        label: "Today",
        date: "Tuesday 13 October",
        events: [
            {
                id: "e1",
                kind: "deploy",
                by: "Siobhan Murphy",
                time: "14:32",
                line: (
                    <>
                        <Who>Siobhan Murphy</Who> deployed <To>marketing-site</To> to production
                    </>
                ),
                detail: (
                    <>
                        <Badge size="sm" variant="success">
                            Live
                        </Badge>
                        <Mono>main · 3f9c2a1</Mono>
                        <span>Built in 48 s</span>
                    </>
                ),
            },
            {
                id: "e2",
                kind: "agent",
                icon: <Bot size={15} />,
                tone: "primary",
                time: "13:05",
                line: (
                    <>
                        <Who>Agent</Who> opened <To>#482 Add VAT to EU invoices</To> in <To>billing-api</To>
                    </>
                ),
                detail: (
                    <>
                        <Mono tone="success">+124</Mono>
                        <Mono tone="danger">−38</Mono>
                        <span>6 files · asked Ciarán Kelly to review</span>
                    </>
                ),
            },
            {
                id: "e3",
                kind: "review",
                by: "Aoife O'Sullivan",
                time: "11:47",
                line: (
                    <>
                        <Who>Aoife O'Sullivan</Who> commented on <To>Fix invoice dates in the EU</To>
                    </>
                ),
                detail: (
                    <Text variant="caption" as="p" tone="soft" className="notifications-feed__quote">
                        The rounding looks right now. Can we add a test for a customer in Dublin at 23:30 UTC?
                    </Text>
                ),
            },
            {
                id: "e4",
                kind: "review",
                by: "Ciarán Kelly",
                time: "09:20",
                line: (
                    <>
                        <Who>Ciarán Kelly</Who> approved <To>#479 Pricing page copy</To>
                    </>
                ),
            },
        ],
    },
    {
        dateTime: "2026-10-12",
        label: "Yesterday",
        date: "Monday 12 October",
        events: [
            {
                id: "e5",
                kind: "deploy",
                icon: <Rocket size={14} />,
                tone: "danger",
                time: "18:10",
                line: (
                    <>
                        <To>mobile-app</To> failed to deploy from <Mono>release/2.4</Mono>
                    </>
                ),
                detail: (
                    <>
                        <Badge size="sm" variant="danger">
                            Failed
                        </Badge>
                        <span>Tests failed in checkout.spec.ts · started by Aoife O'Sullivan</span>
                    </>
                ),
            },
            {
                id: "e6",
                kind: "team",
                by: "Declan Walsh",
                time: "16:44",
                line: (
                    <>
                        <Who>Declan Walsh</Who> created the project <To>design-system</To>
                    </>
                ),
            },
            {
                id: "e7",
                kind: "team",
                by: "Niamh Byrne",
                time: "10:02",
                line: (
                    <>
                        <Who>Niamh Byrne</Who> invited Seán McCarthy and Róisín O'Brien to Acme
                    </>
                ),
                detail: (
                    <>
                        <AvatarGroup size="sm" label="Seán McCarthy and Róisín O'Brien">
                            <Avatar name="Seán McCarthy" />
                            <Avatar name="Róisín O'Brien" />
                        </AvatarGroup>
                        <span>Both joined within the hour</span>
                    </>
                ),
            },
        ],
    },
];

const earlier: Notifications02Day[] = [
    {
        dateTime: "2026-10-09",
        label: "Friday",
        date: "9 October",
        events: [
            {
                id: "e8",
                kind: "agent",
                icon: <Bot size={15} />,
                tone: "primary",
                time: "17:30",
                line: (
                    <>
                        <Who>Agent</Who> finished <To>Update the API reference</To> in <To>docs</To>
                    </>
                ),
                detail: (
                    <>
                        <Badge size="sm" variant="success">
                            Done
                        </Badge>
                        <span>6 files changed in 4 min 12 s</span>
                    </>
                ),
            },
            {
                id: "e9",
                kind: "deploy",
                by: "Cillian Ryan",
                time: "15:12",
                line: (
                    <>
                        <Who>Cillian Ryan</Who> deployed <To>billing-api</To> to production
                    </>
                ),
                detail: (
                    <>
                        <Badge size="sm" variant="success">
                            Live
                        </Badge>
                        <Mono>main · 8d41e07</Mono>
                        <span>Built in 1 min 6 s</span>
                    </>
                ),
            },
        ],
    },
    {
        dateTime: "2026-10-08",
        label: "Thursday",
        date: "8 October",
        events: [
            {
                id: "e10",
                kind: "review",
                by: "Siobhan Murphy",
                time: "16:05",
                line: (
                    <>
                        <Who>Siobhan Murphy</Who> requested changes on <To>#471 Release 2.4</To>
                    </>
                ),
                detail: (
                    <Text variant="caption" as="p" tone="soft" className="notifications-feed__quote">
                        The changelog still lists the old Team price. It's €12 a person now.
                    </Text>
                ),
            },
            {
                id: "e11",
                kind: "team",
                by: "Cillian Ryan",
                time: "11:20",
                line: (
                    <>
                        <Who>Cillian Ryan</Who> created the API key <To>production-ci</To>
                    </>
                ),
                detail: <span>Expires in 90 days · deploys only</span>,
            },
        ],
    },
];

// In your app this fetches the next page; here the older days are already in the file.
const loadEarlier = () => new Promise<Notifications02Day[]>((resolve) => window.setTimeout(() => resolve(earlier), 600));

export function NotificationsFeed() {
    return (
        <Notifications02
            title="Activity"
            description="What happened across Acme, newest first."
            days={recent}
            kinds={[
                { value: "deploy", label: "Deploys" },
                { value: "review", label: "Reviews" },
                { value: "agent", label: "Agents" },
            ]}
            onLoadEarlier={loadEarlier}
            labels={{ empty: "Nothing of this kind in the last two days.", end: "That's everything from the past week." }}
        />
    );
}
