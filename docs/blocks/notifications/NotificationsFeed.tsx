import { useEffect, useRef, useState, type ReactNode } from "react";

import { Avatar, AvatarGroup, Badge, Button, Link, SegmentedControl } from "@openwarelabs/ui";
import { Bot, Rocket } from "lucide-react";

import "./NotificationsFeed.css";

type Kind = "deploy" | "review" | "agent" | "team";

interface FeedEvent {
    id: string;
    kind: Kind;
    /** A person's name, "agent", or "deploy-failed" for events Acme records itself. */
    by: string;
    at: string;
    line: ReactNode;
    detail?: ReactNode;
}

interface Day {
    id: string;
    label: string;
    date: string;
    events: FeedEvent[];
}

const Who = ({ children }: { children: ReactNode }) => <span className="notifications-feed__who">{children}</span>;
const To = ({ children }: { children: ReactNode }) => (
    <Link href="#" variant="standalone">
        {children}
    </Link>
);

const recent: Day[] = [
    {
        id: "2026-10-13",
        label: "Today",
        date: "Tuesday 13 October",
        events: [
            {
                id: "e1",
                kind: "deploy",
                by: "Maya Chen",
                at: "14:32",
                line: (
                    <>
                        <Who>Maya Chen</Who> deployed <To>marketing-site</To> to production
                    </>
                ),
                detail: (
                    <>
                        <Badge size="sm" variant="success">
                            Live
                        </Badge>
                        <span className="notifications-feed__mono">main · 3f9c2a1</span>
                        <span>Built in 48 s</span>
                    </>
                ),
            },
            {
                id: "e2",
                kind: "agent",
                by: "agent",
                at: "13:05",
                line: (
                    <>
                        <Who>Agent</Who> opened <To>#482 Add VAT to EU invoices</To> in <To>billing-api</To>
                    </>
                ),
                detail: (
                    <>
                        <span className="notifications-feed__added">+124</span>
                        <span className="notifications-feed__removed">−38</span>
                        <span>6 files · asked Tomás Reyes to review</span>
                    </>
                ),
            },
            {
                id: "e3",
                kind: "review",
                by: "Clara Novak",
                at: "11:47",
                line: (
                    <>
                        <Who>Clara Novak</Who> commented on <To>Fix invoice dates in the EU</To>
                    </>
                ),
                detail: <p className="notifications-feed__quote">The rounding looks right now. Can we add a test for a customer in Dublin at 23:30 UTC?</p>,
            },
            {
                id: "e4",
                kind: "review",
                by: "Tomás Reyes",
                at: "09:20",
                line: (
                    <>
                        <Who>Tomás Reyes</Who> approved <To>#479 Pricing page copy</To>
                    </>
                ),
            },
        ],
    },
    {
        id: "2026-10-12",
        label: "Yesterday",
        date: "Monday 12 October",
        events: [
            {
                id: "e5",
                kind: "deploy",
                by: "deploy-failed",
                at: "18:10",
                line: (
                    <>
                        <To>mobile-app</To> failed to deploy from <span className="notifications-feed__mono">release/2.4</span>
                    </>
                ),
                detail: (
                    <>
                        <Badge size="sm" variant="danger">
                            Failed
                        </Badge>
                        <span>Tests failed in checkout.spec.ts · started by Clara Novak</span>
                    </>
                ),
            },
            {
                id: "e6",
                kind: "team",
                by: "Jonas Berg",
                at: "16:44",
                line: (
                    <>
                        <Who>Jonas Berg</Who> created the project <To>design-system</To>
                    </>
                ),
            },
            {
                id: "e7",
                kind: "team",
                by: "Aiko Tanaka",
                at: "10:02",
                line: (
                    <>
                        <Who>Aiko Tanaka</Who> invited Sam Okafor and Lena Fischer to Acme
                    </>
                ),
                detail: (
                    <>
                        <AvatarGroup size="sm" label="Sam Okafor and Lena Fischer">
                            <Avatar name="Sam Okafor" />
                            <Avatar name="Lena Fischer" />
                        </AvatarGroup>
                        <span>Both joined within the hour</span>
                    </>
                ),
            },
        ],
    },
];

const earlier: Day[] = [
    {
        id: "2026-10-09",
        label: "Friday",
        date: "9 October",
        events: [
            {
                id: "e8",
                kind: "agent",
                by: "agent",
                at: "17:30",
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
                by: "Omar Haddad",
                at: "15:12",
                line: (
                    <>
                        <Who>Omar Haddad</Who> deployed <To>billing-api</To> to production
                    </>
                ),
                detail: (
                    <>
                        <Badge size="sm" variant="success">
                            Live
                        </Badge>
                        <span className="notifications-feed__mono">main · 8d41e07</span>
                        <span>Built in 1 min 6 s</span>
                    </>
                ),
            },
        ],
    },
    {
        id: "2026-10-08",
        label: "Thursday",
        date: "8 October",
        events: [
            {
                id: "e10",
                kind: "review",
                by: "Maya Chen",
                at: "16:05",
                line: (
                    <>
                        <Who>Maya Chen</Who> requested changes on <To>#471 Release 2.4</To>
                    </>
                ),
                detail: <p className="notifications-feed__quote">The changelog still lists the old Team price. It's €12 a person now.</p>,
            },
            {
                id: "e11",
                kind: "team",
                by: "Omar Haddad",
                at: "11:20",
                line: (
                    <>
                        <Who>Omar Haddad</Who> created the API key <To>production-ci</To>
                    </>
                ),
                detail: <span>Expires in 90 days · deploys only</span>,
            },
        ],
    },
];

const filters = [
    { value: "all", label: "All" },
    { value: "deploy", label: "Deploys" },
    { value: "review", label: "Reviews" },
    { value: "agent", label: "Agents" },
];

function Node({ by }: { by: string }) {
    if (by === "agent") {
        return (
            <span className="notifications-feed__node notifications-feed__node--agent" aria-hidden="true">
                <Bot size={15} />
            </span>
        );
    }
    if (by === "deploy-failed") {
        return (
            <span className="notifications-feed__node notifications-feed__node--danger" aria-hidden="true">
                <Rocket size={14} />
            </span>
        );
    }
    return <Avatar name={by} />;
}

export function NotificationsFeed() {
    const [filter, setFilter] = useState("all");
    const [showEarlier, setShowEarlier] = useState(false);
    const [loading, setLoading] = useState(false);
    const timer = useRef(0);
    const panel = useRef<HTMLDivElement>(null);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    // The button goes once the older days are in; move focus to the first of them.
    useEffect(() => {
        if (showEarlier) panel.current?.querySelector<HTMLElement>("[data-earlier] h3")?.focus();
    }, [showEarlier]);

    // In your app this fetches the next page; here the older days are already in the file.
    const loadEarlier = () => {
        setLoading(true);
        timer.current = window.setTimeout(() => {
            setLoading(false);
            setShowEarlier(true);
        }, 600);
    };

    const days = (showEarlier ? [...recent, ...earlier] : recent)
        .map((day) => ({ ...day, events: day.events.filter((event) => filter === "all" || event.kind === filter) }))
        .filter((day) => day.events.length > 0);

    return (
        <section className="notifications-feed" aria-labelledby="notifications-feed-title">
            <div ref={panel} className="notifications-feed__panel">
                <header className="notifications-feed__header">
                    <div>
                        <h2 id="notifications-feed-title" className="notifications-feed__title">
                            Activity
                        </h2>
                        <p className="notifications-feed__subtitle">What happened across Acme, newest first.</p>
                    </div>
                    <SegmentedControl
                        className="notifications-feed__filter"
                        size="sm"
                        options={filters}
                        value={filter}
                        onChange={setFilter}
                        aria-label="Show"
                    />
                </header>

                {days.length ? (
                    days.map((day) => (
                        <section
                            key={day.id}
                            className="notifications-feed__day"
                            aria-labelledby={`notifications-feed-${day.id}`}
                            data-earlier={earlier.some((older) => older.id === day.id) || undefined}
                        >
                            <h3 id={`notifications-feed-${day.id}`} className="notifications-feed__day-title" tabIndex={-1}>
                                {day.label}
                                <span className="notifications-feed__day-date">{day.date}</span>
                            </h3>
                            <ol className="notifications-feed__events">
                                {day.events.map((event) => (
                                    <li key={event.id} className="notifications-feed__event">
                                        <Node by={event.by} />
                                        <div className="notifications-feed__body">
                                            <p className="notifications-feed__line">{event.line}</p>
                                            {event.detail ? <div className="notifications-feed__detail">{event.detail}</div> : null}
                                        </div>
                                        <time className="notifications-feed__time" dateTime={`${day.id}T${event.at}`}>
                                            {event.at}
                                        </time>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    ))
                ) : (
                    <p className="notifications-feed__empty">Nothing of this kind in the last two days.</p>
                )}

                <div className="notifications-feed__more">
                    {showEarlier ? (
                        <p className="notifications-feed__end">That's everything from the past week.</p>
                    ) : (
                        <Button loading={loading} onClick={loadEarlier}>
                            Show earlier activity
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
