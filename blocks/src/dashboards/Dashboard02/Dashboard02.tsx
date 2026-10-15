import { useId, useState } from "react";

import { Button, Card, cx, SegmentedControl, Stat, Table, Text } from "@openwarelabs/ui";

import { ArrowUpIcon } from "@blocks/shared/icons";
import { hiddenColumns } from "@blocks/shared/tableColumns";
import type { Dashboard02Event, Dashboard02Props } from "./Dashboard02.types";

/** The numbers on the left, with a table under them; what just happened in a feed on the right, grouped by day. */
export function Dashboard02<Row extends object>({
    title,
    description,
    stats,
    table,
    events,
    newEvents = [],
    eventFilters,
    labels = {},
    className,
    ...props
}: Dashboard02Props<Row>) {
    const id = useId();
    const [filter, setFilter] = useState("all");
    const [shownNew, setShownNew] = useState<Dashboard02Event[]>([]);
    const [fresh, setFresh] = useState<string[]>([]);
    const [earlier, setEarlier] = useState(false);

    const waiting = newEvents.filter((event) => !shownNew.some((shown) => shown.id === event.id));
    const showWaiting = () => {
        setShownNew((current) => [...waiting, ...current]);
        setFresh(waiting.map((event) => event.id));
    };

    const feed = [...shownNew, ...events];
    const dayOrder = feed.map((event) => event.day).filter((day, index, all) => all.indexOf(day) === index);
    const firstDay = dayOrder[0];
    const shown = feed.filter((event) => (filter === "all" || event.kind === filter) && (earlier || event.day === firstDay));
    const days = dayOrder.map((day) => ({ day, items: shown.filter((event) => event.day === day) })).filter((group) => group.items.length);

    return (
        <section className={cx("ow-dashboard02", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-dashboard02__inner">
                <div className="ow-dashboard02__header">
                    <div>
                        <Text as="h1" variant="heading" id={`${id}-title`}>
                            {title}
                        </Text>
                        {description ? (
                            <Text variant="copy" className="ow-dashboard02__lead">
                                {description}
                            </Text>
                        ) : null}
                    </div>
                </div>

                <div className="ow-dashboard02__stats">
                    {stats.map((stat, index) => (
                        <Stat key={index} {...stat} />
                    ))}
                </div>

                {table ? (
                    <Card padding="none" className="ow-dashboard02__card ow-dashboard02__table-card" {...hiddenColumns(table.columns)}>
                        <div className="ow-dashboard02__card-header">
                            <Text as="h2" variant="card-title">
                                {table.title}
                            </Text>
                        </div>
                        <Table
                            variant="plain"
                            caption={table.caption}
                            hideCaption
                            density="compact"
                            columns={table.columns}
                            rows={table.rows}
                            defaultSort={table.defaultSort}
                        />
                    </Card>
                ) : null}

                <Card padding="none" className="ow-dashboard02__card ow-dashboard02__feed">
                    <section aria-labelledby={`${id}-feed`}>
                        <div className="ow-dashboard02__card-header">
                            <Text as="h2" variant="card-title" id={`${id}-feed`}>
                                {labels.feed ?? "Activity"}
                            </Text>
                            {eventFilters?.length ? (
                                <SegmentedControl
                                    size="sm"
                                    aria-label={labels.filters ?? "Show"}
                                    options={[{ value: "all", label: labels.all ?? "All" }, ...eventFilters]}
                                    value={filter}
                                    onChange={setFilter}
                                />
                            ) : null}
                        </div>

                        <div aria-live="polite">
                            {waiting.length ? (
                                <div className="ow-dashboard02__new">
                                    <Button size="sm" variant="ghost" startIcon={<ArrowUpIcon size={14} />} onClick={showWaiting}>
                                        {labels.newEvents ? labels.newEvents(waiting.length) : <>{waiting.length} new events</>}
                                    </Button>
                                </div>
                            ) : null}
                        </div>

                        {days.length ? (
                            days.map((group) => (
                                <div key={group.day}>
                                    <Text as="h3" variant="caption" className="ow-dashboard02__day">
                                        {group.day}
                                    </Text>
                                    <ol className="ow-dashboard02__events">
                                        {group.items.map((event) => (
                                            <li key={event.id} className="ow-dashboard02__event" data-fresh={fresh.includes(event.id) || undefined}>
                                                <span className="ow-dashboard02__icon" data-tone={event.tone} aria-hidden="true">
                                                    {event.icon}
                                                </span>
                                                <Text tone="soft" className="ow-dashboard02__event-text">
                                                    {event.text}
                                                    {event.meta !== undefined ? (
                                                        <Text variant="caption" className="ow-dashboard02__event-meta">
                                                            {event.meta}
                                                        </Text>
                                                    ) : null}
                                                </Text>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ))
                        ) : (
                            <Text variant="copy" align="center" className="ow-dashboard02__none">
                                {earlier
                                    ? (labels.none ?? "Nothing like this happened this week.")
                                    : (labels.noneToday ?? "Nothing like this has happened today.")}
                            </Text>
                        )}

                        {earlier || dayOrder.length < 2 ? null : (
                            <div className="ow-dashboard02__earlier">
                                <Button size="sm" variant="ghost" onClick={() => setEarlier(true)}>
                                    {labels.showEarlier ?? "Show earlier activity"}
                                </Button>
                            </div>
                        )}
                    </section>
                </Card>
            </div>
        </section>
    );
}
