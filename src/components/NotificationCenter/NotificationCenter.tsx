import { Fragment, useEffect, useId, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { XIcon } from "@/icons";
import { cx } from "@/utils/cx";
import { Badge } from "@/components/Badge/Badge";
import { Button } from "@/components/Button/Button";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { Popover } from "@/components/Popover/Popover";
import { Tab, TabList, TabPanel, Tabs } from "@/components/Tabs/Tabs";
import type {
    NotificationCenterProps,
    NotificationFilter,
    NotificationGroup,
    NotificationItem,
    NotificationListProps,
    NotificationRowProps,
} from "./NotificationCenter.types";

export type {
    NotificationCenterProps,
    NotificationFilter,
    NotificationItem,
    NotificationLabels,
    NotificationListProps,
} from "./NotificationCenter.types";

/** Lucide's bell and check-check, drawn here so the shared icon set stays small. */
function Glyph({ children, size }: { children: ReactNode; size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            {children}
        </svg>
    );
}

const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
];

/** The time now, again every minute, so "5 min ago" keeps up while the list is on screen. */
function useNow() {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 60_000);
        return () => window.clearInterval(timer);
    }, []);
    return now;
}

function NotificationRow({ item, relative, full, iso, labels, onRead, onDismiss, onItemClick }: NotificationRowProps) {
    const id = useId();
    const unread = !item.read;
    const open = (event: MouseEvent<HTMLElement>) => {
        onItemClick?.(item, event);
        if (unread) onRead?.(item.id);
    };
    const content = (
        <>
            {/* The dot is for the eye; this says it in words. */}
            {unread ? <span className="ow-visually-hidden">{labels.unread ?? "Unread"}: </span> : null}
            <span id={`${id}-title`} className="ow-notification__title">
                {item.title}
            </span>
            {item.description ? <span className="ow-notification__description">{item.description}</span> : null}
            <time className="ow-notification__time" dateTime={iso} title={full}>
                {relative}
            </time>
        </>
    );
    const media = item.avatar ?? (item.icon ? <span className="ow-notification__icon">{item.icon}</span> : null);

    return (
        <li className={cx("ow-notification", unread && "ow-notification--unread")}>
            {unread ? <span className="ow-notification__dot" aria-hidden="true" /> : null}
            {media ? (
                <span className="ow-notification__media" aria-hidden="true">
                    {media}
                </span>
            ) : null}
            <div className="ow-notification__body">
                {/* The whole row opens it: the link stretches over it, under the actions. */}
                {item.href !== undefined ? (
                    <a className="ow-notification__main" href={item.href} onClick={open}>
                        {content}
                    </a>
                ) : (
                    <button type="button" className="ow-notification__main" onClick={open}>
                        {content}
                    </button>
                )}
                {item.actions ? <div className="ow-notification__actions">{item.actions}</div> : null}
            </div>
            {onDismiss ? (
                <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    className="ow-notification__dismiss"
                    aria-labelledby={`${id}-dismiss ${id}-title`}
                    onClick={(event) => {
                        // Focus moves on to the next item (or the one before) rather than falling to the page.
                        const row = event.currentTarget.closest("li");
                        const next = (row?.nextElementSibling ?? row?.previousElementSibling)?.querySelector<HTMLElement>(".ow-notification__main");
                        (next ?? row?.closest<HTMLElement>('[role="dialog"]'))?.focus();
                        onDismiss(item.id);
                    }}
                >
                    <XIcon size={14} />
                    <span id={`${id}-dismiss`} className="ow-visually-hidden">
                        {labels.dismiss ?? "Dismiss"}
                    </span>
                </Button>
            ) : null}
        </li>
    );
}

/**
 * The notifications as a list, newest first, optionally under Today, Yesterday and Earlier. NotificationCenter shows it
 * in its popover; use it on its own for a full page of them.
 */
export function NotificationList({
    items,
    onRead,
    onDismiss,
    onItemClick,
    groupByDay = false,
    empty,
    locale,
    labels = {},
    "aria-label": ariaLabel,
    className,
}: NotificationListProps) {
    const now = useNow();
    const id = useId();
    const formats = useMemo(
        () => ({
            relative: new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" }),
            date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
            full: new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }),
        }),
        [locale],
    );

    if (!items.length) {
        return <div className={cx("ow-notification-list", className)}>{empty ?? <EmptyState title={labels.empty ?? "You're all caught up"} />}</div>;
    }

    const today = new Date(now).setHours(0, 0, 0, 0);
    const yesterday = new Date(today).setDate(new Date(today).getDate() - 1);
    const groups: NotificationGroup[] = [];
    for (const item of items) {
        const time = new Date(item.time).getTime();
        let key = item.group ?? "";
        let label = item.group;
        if (item.group === undefined && groupByDay) {
            key = time >= today ? "today" : time >= yesterday ? "yesterday" : "earlier";
            label = labels[key as "today"] ?? key[0]!.toUpperCase() + key.slice(1);
        }
        const group = groups.find((entry) => entry.key === key);
        if (group) group.items.push(item);
        else groups.push({ key, label, items: [item] });
    }

    const describe = (value: Date | string) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return { relative: String(value), full: "" };
        const seconds = (now - date.getTime()) / 1000;
        const unit = units.find(([, size]) => Math.abs(seconds) >= size);
        const relative =
            Math.abs(seconds) >= 7 * 86400
                ? formats.date.format(date)
                : unit
                  ? formats.relative.format(-Math.trunc(seconds / unit[1]), unit[0])
                  : formats.relative.format(0, "second");
        return { relative, full: formats.full.format(date), iso: date.toISOString() };
    };

    return (
        <div className={cx("ow-notification-list", className)}>
            {groups.map((group, index) => (
                <Fragment key={group.key}>
                    {group.label ? (
                        <h3 id={`${id}-${index}`} className="ow-notification-list__heading">
                            {group.label}
                        </h3>
                    ) : null}
                    <ul
                        className="ow-notification-list__items"
                        aria-labelledby={group.label ? `${id}-${index}` : undefined}
                        aria-label={group.label ? undefined : ariaLabel}
                    >
                        {group.items.map((item) => (
                            <NotificationRow
                                key={item.id}
                                item={item}
                                {...describe(item.time)}
                                labels={labels}
                                onRead={onRead}
                                onDismiss={onDismiss}
                                onItemClick={onItemClick}
                            />
                        ))}
                    </ul>
                </Fragment>
            ))}
        </div>
    );
}

/**
 * A bell with the unread count that opens the latest notifications in a popover: All and Unread tabs, "Mark all as
 * read", and a footer for a link to the full page. New ones that arrive while it's closed are announced once.
 */
export function NotificationCenter({
    items,
    onRead,
    onReadAll,
    onDismiss,
    onItemClick,
    open,
    defaultOpen = false,
    onOpenChange,
    tabs = true,
    filter,
    defaultFilter = "all",
    onFilterChange,
    footer,
    empty,
    maxCount = 9,
    trigger,
    width = 380,
    groupByDay,
    locale,
    labels = {},
    className,
}: NotificationCenterProps) {
    const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
    const [tab, setTab] = useControllableState<NotificationFilter>(filter, defaultFilter, onFilterChange);
    // Read and dismissed here, on top of what `items` says, so it works before the app's own state catches up.
    const [readIds, setReadIds] = useState<ReadonlySet<string>>(() => new Set());
    const [gone, setGone] = useState<ReadonlySet<string>>(() => new Set());
    // Opened on load, it doesn't pull focus into it; once someone opens it, focus moves in.
    const [focusOnOpen, setFocusOnOpen] = useState(!defaultOpen);
    const [announcement, setAnnouncement] = useState("");
    const rootRef = useRef<HTMLSpanElement>(null);
    const knownRef = useRef<Set<string> | null>(null);

    const shown = items.filter((item) => !gone.has(item.id)).map((item) => (readIds.has(item.id) && !item.read ? { ...item, read: true } : item));
    const unreadIds = shown.filter((item) => !item.read).map((item) => item.id);
    const unread = unreadIds.length;
    const unreadKey = unreadIds.join("\n");

    // The Unread tab keeps what was unread when it was opened, so an item read there doesn't vanish from under focus.
    const keep = useMemo(
        () => new Set(unreadIds),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- a snapshot each time it opens or the tab changes.
        [isOpen, tab],
    );

    // New unread ones that arrive while it's closed: said once, politely, then cleared.
    useEffect(() => {
        const ids = unreadKey ? unreadKey.split("\n") : [];
        const before = knownRef.current;
        knownRef.current = new Set(ids);
        const fresh = before ? ids.filter((itemId) => !before.has(itemId)).length : 0;
        if (!fresh || isOpen) return undefined;
        setAnnouncement(labels.announce ? labels.announce(fresh) : fresh === 1 ? "1 new notification" : `${fresh} new notifications`);
        const timer = window.setTimeout(() => setAnnouncement(""), 5000);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the unread ones change.
    }, [unreadKey]);

    const read = (itemId: string) => {
        setReadIds((current) => new Set(current).add(itemId));
        onRead?.(itemId);
    };
    const readAll = (event: MouseEvent<HTMLElement>) => {
        // The button turns disabled, so focus moves to the popover instead of falling to the page.
        event.currentTarget.closest<HTMLElement>('[role="dialog"]')?.focus();
        setReadIds(new Set(items.map((item) => item.id)));
        onReadAll?.();
    };
    const dismiss = onDismiss
        ? (itemId: string) => {
              setGone((current) => new Set(current).add(itemId));
              onDismiss(itemId);
          }
        : undefined;
    const clickItem = (item: NotificationItem, event: MouseEvent<HTMLElement>) => {
        onItemClick?.(item, event);
        // Opening one closes the popover, and focus goes back to the bell.
        setOpen(false);
        rootRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    };

    const title = labels.title ?? "Notifications";
    const list = (listItems: NotificationItem[], emptyTitle: string) => (
        <NotificationList
            items={listItems}
            onRead={read}
            onDismiss={dismiss}
            onItemClick={clickItem}
            groupByDay={groupByDay}
            locale={locale}
            labels={labels}
            empty={empty ?? <EmptyState title={emptyTitle} />}
            aria-label={title}
        />
    );
    const emptyAll = labels.empty ?? "You're all caught up";

    return (
        <span ref={rootRef} className={cx("ow-notification-center", className)}>
            <Popover
                open={isOpen}
                onOpenChange={(next) => {
                    setOpen(next);
                    if (!next) setFocusOnOpen(true);
                }}
                autoFocus={focusOnOpen}
                placement="bottom-end"
                width={`min(${typeof width === "number" ? `${width}px` : width}, calc(100vw - 16px))`}
                aria-label={title}
                className="ow-notification-center__popover"
                trigger={
                    trigger ?? (
                        <Button
                            variant="ghost"
                            iconOnly
                            className="ow-notification-center__bell"
                            aria-label={labels.trigger ? labels.trigger(unread) : unread ? `${title}, ${unread} unread` : title}
                        >
                            <Glyph size={18}>
                                <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                                <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                            </Glyph>
                            {unread ? (
                                <Badge size="sm" variant="active" className="ow-notification-center__count" aria-hidden="true">
                                    {unread > maxCount ? `${maxCount}+` : unread}
                                </Badge>
                            ) : null}
                        </Button>
                    )
                }
            >
                <div className="ow-notification-center__head">
                    <span className="ow-notification-center__title">{title}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!unread}
                        onClick={readAll}
                        startIcon={
                            <Glyph size={16}>
                                <path d="M18 6 7 17l-5-5" />
                                <path d="m22 10-7.5 7.5L13 16" />
                            </Glyph>
                        }
                    >
                        {labels.markAllRead ?? "Mark all as read"}
                    </Button>
                </div>
                {tabs ? (
                    <Tabs variant="line" className="ow-notification-center__tabs" value={tab} onValueChange={(value) => setTab(value as NotificationFilter)}>
                        <TabList aria-label={labels.filter ?? "Show"}>
                            <Tab value="all">{labels.all ?? "All"}</Tab>
                            <Tab value="unread">
                                {labels.unreadTab ?? "Unread"}
                                {unread ? <span className="ow-notification-center__tab-count">{unread}</span> : null}
                            </Tab>
                        </TabList>
                        <TabPanel value="all" className="ow-notification-center__body">
                            {list(shown, emptyAll)}
                        </TabPanel>
                        <TabPanel value="unread" className="ow-notification-center__body">
                            {list(
                                shown.filter((item) => !item.read || keep.has(item.id)),
                                labels.emptyUnread ?? "No unread notifications",
                            )}
                        </TabPanel>
                    </Tabs>
                ) : (
                    <div className="ow-notification-center__body">{list(shown, emptyAll)}</div>
                )}
                {footer ? <div className="ow-notification-center__foot">{footer}</div> : null}
            </Popover>
            <span className="ow-visually-hidden" aria-live="polite">
                {announcement}
            </span>
        </span>
    );
}
