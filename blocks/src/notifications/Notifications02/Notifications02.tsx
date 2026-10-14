import { useEffect, useId, useRef, useState } from "react";

import { Avatar, Button, cx, SegmentedControl, Text } from "@openwarelabs/ui";

import type { Notifications02Day, Notifications02Event, Notifications02Props } from "./Notifications02.types";

function Node({ event }: { event: Notifications02Event }) {
    if (event.icon) {
        return (
            <span
                className={cx("ow-notifications02__node", event.tone && event.tone !== "default" && `ow-notifications02__node--${event.tone}`)}
                aria-hidden="true"
            >
                {event.icon}
            </span>
        );
    }
    return <Avatar name={event.by ?? ""} />;
}

/** An activity page: days down the page, each day's events on a thin rail, with a filter and a way to load older days. */
export function Notifications02({ title, description, days, kinds, onLoadEarlier, labels = {}, className, ...props }: Notifications02Props) {
    const id = useId();
    const [filter, setFilter] = useState("all");
    const [earlier, setEarlier] = useState<Notifications02Day[] | null>(null);
    const [loading, setLoading] = useState(false);
    const panel = useRef<HTMLDivElement>(null);

    // The button goes once the older days are in; move focus to the first of them.
    useEffect(() => {
        if (earlier) panel.current?.querySelector<HTMLElement>("[data-earlier] h3")?.focus();
    }, [earlier]);

    const loadEarlier = async () => {
        if (!onLoadEarlier) return;
        setLoading(true);
        try {
            setEarlier(await onLoadEarlier());
        } catch {
            // Didn't load: the button stays, to try again.
        }
        setLoading(false);
    };

    const shown = [...days.map((day) => ({ day, older: false })), ...(earlier ?? []).map((day) => ({ day, older: true }))]
        .map(({ day, older }) => ({ day, older, events: day.events.filter((event) => filter === "all" || event.kind === filter) }))
        .filter((entry) => entry.events.length > 0);

    return (
        <section className={cx("ow-notifications02", className)} aria-labelledby={`${id}-title`} {...props}>
            <div ref={panel} className="ow-notifications02__panel">
                <header className="ow-notifications02__header">
                    <div>
                        <Text variant="heading" as="h2" id={`${id}-title`}>
                            {title}
                        </Text>
                        {description ? (
                            <Text variant="copy" className="ow-notifications02__subtitle">
                                {description}
                            </Text>
                        ) : null}
                    </div>
                    {kinds?.length ? (
                        <SegmentedControl
                            className="ow-notifications02__filter"
                            size="sm"
                            options={[{ value: "all", label: labels.all ?? "All" }, ...kinds]}
                            value={filter}
                            onChange={setFilter}
                            aria-label={labels.filter ?? "Show"}
                        />
                    ) : null}
                </header>

                {shown.length ? (
                    shown.map(({ day, older, events }, index) => (
                        <section
                            key={`${day.dateTime}-${older}`}
                            className="ow-notifications02__day"
                            aria-labelledby={`${id}-day-${index}`}
                            data-earlier={older || undefined}
                        >
                            <Text variant="label" as="h3" id={`${id}-day-${index}`} className="ow-notifications02__day-title" tabIndex={-1}>
                                {day.label}
                                {day.date ? (
                                    <Text as="span" tone="muted">
                                        {day.date}
                                    </Text>
                                ) : null}
                            </Text>
                            <ol className="ow-notifications02__events">
                                {events.map((event) => (
                                    <li key={event.id} className="ow-notifications02__event">
                                        <Node event={event} />
                                        <div className="ow-notifications02__body">
                                            <Text variant="copy" className="ow-notifications02__line">
                                                {event.line}
                                            </Text>
                                            {event.detail ? (
                                                <Text as="div" variant="caption" className="ow-notifications02__detail">
                                                    {event.detail}
                                                </Text>
                                            ) : null}
                                        </div>
                                        <Text variant="caption" className="ow-notifications02__time">
                                            <time dateTime={`${day.dateTime}T${event.time}`}>{event.time}</time>
                                        </Text>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    ))
                ) : (
                    <Text tone="muted" align="center" className="ow-notifications02__empty">
                        {labels.empty ?? "Nothing of this kind yet."}
                    </Text>
                )}

                <div className="ow-notifications02__more">
                    {onLoadEarlier && !earlier ? (
                        <Button loading={loading} onClick={loadEarlier}>
                            {labels.loadEarlier ?? "Show earlier activity"}
                        </Button>
                    ) : (
                        <Text variant="caption" as="p">
                            {labels.end ?? "That's everything."}
                        </Text>
                    )}
                </div>
            </div>
        </section>
    );
}
