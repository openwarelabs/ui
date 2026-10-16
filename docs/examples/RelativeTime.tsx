import { Avatar, RelativeTime, Stack, Text, Timeline, TimelineItem } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "RelativeTime",
    category: "Data display",
    description:
        "A moment as people say it, \"3 minutes ago\" or \"in 2 days\", kept up to date as time passes, with the exact date in its title.",
    source: "components/Countdown/RelativeTime.tsx",
    imports: ["RelativeTime"],
    props: ["RelativeTimeProps"],
    notes: [
        "It's a <time> element with the exact moment in dateTime, so machines read it as well as people, and the full date and time in its title for anyone who hovers.",
        "The words come from Intl.RelativeTimeFormat in the browser's language, or the locale you pass; no library and no translations to ship.",
        "It updates every second under a minute away, every minute under an hour, then every hour, and reads the clock each time rather than counting, so a tab left in the background catches up when it's shown again.",
        "The first render, on a server too, uses the clock as it is; on hydration the client patches the words if they've changed in between, without a warning.",
        "Past a threshold, relative words stop helping (\"3 months ago\"), so it shows the absolute date instead; set threshold to the number of days.",
        "It has no live region: a feed of times changing by themselves shouldn't be read out. The time is read when the reader reaches it.",
    ],
    related: ["Countdown", "Timeline", "Stat", "Text"],
    since: "0.18.0",
};

const minutes = 60 * 1000;
const hours = 60 * minutes;
const days = 24 * hours;

const events = [
    { who: "Aoife O'Sullivan", what: "deployed v0.18.0 to production", when: Date.now() - 40 * 1000 },
    { who: "Cian Murphy", what: "merged #71 Round VAT per line", when: Date.now() - 12 * minutes },
    { who: "Niamh Byrne", what: "commented on the pricing page", when: Date.now() - 3 * hours },
    { who: "Oisín Kelly", what: "opened #70 Dark map style", when: Date.now() - 26 * hours },
    { who: "Saoirse Doyle", what: "invited Eoin Fitzgerald to the team", when: Date.now() - 6 * days },
];

/** An activity feed: each event's time as "12 minutes ago", ticking along as you watch. */
export function Feed() {
    return (
        <Timeline density="compact" aria-label="Activity" style={{ width: 460, maxWidth: "100%" }}>
            {events.map((event) => (
                <TimelineItem
                    key={event.what}
                    avatar={<Avatar name={event.who} size="sm" />}
                    title={
                        <>
                            <strong>{event.who}</strong> {event.what}
                        </>
                    }
                    time={<RelativeTime date={event.when} />}
                />
            ))}
        </Timeline>
    );
}
Feed.layout = { align: "start" as const };

/** Past a threshold the absolute date shows instead; here anything over a week away. */
export function Threshold() {
    const rows = [
        { label: "Last sign-in", date: Date.now() - 2 * hours },
        { label: "Plan renews", date: Date.now() + 3 * days },
        { label: "Account created", date: new Date("2025-02-14T10:30:00") },
        { label: "Contract ends", date: new Date("2027-06-30T00:00:00") },
    ];
    return (
        <Stack gap="sm" style={{ width: 360, maxWidth: "100%" }}>
            {rows.map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                    <Text tone="muted">{row.label}</Text>
                    <Text>
                        <RelativeTime date={row.date} threshold={7} dateStyle="medium" />
                    </Text>
                </div>
            ))}
        </Stack>
    );
}
Threshold.layout = { align: "start" as const };

/** Narrow words for a tight column, numbers always ("1 day ago" rather than "yesterday"), and another language. */
export function Styles() {
    const when = Date.now() - 26 * hours;
    return (
        <Stack gap="sm" style={{ width: 360, maxWidth: "100%" }}>
            <Text>
                <RelativeTime date={when} /> <Text as="span" tone="muted">long, auto</Text>
            </Text>
            <Text>
                <RelativeTime date={when} numeric="always" /> <Text as="span" tone="muted">long, always</Text>
            </Text>
            <Text>
                <RelativeTime date={when} style="short" numeric="always" /> <Text as="span" tone="muted">short</Text>
            </Text>
            <Text>
                <RelativeTime date={when} style="narrow" numeric="always" /> <Text as="span" tone="muted">narrow</Text>
            </Text>
            <Text>
                <RelativeTime date={when} locale="fr" /> <Text as="span" tone="muted">locale="fr"</Text>
            </Text>
        </Stack>
    );
}
Styles.layout = { align: "start" as const };
