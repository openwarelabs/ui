import { useEffect, useId, useRef, useState } from "react";

import { Avatar, Badge, Button, cx, Menu, NavItem, ScrollShadow, SearchField, Text, Tooltip } from "@openwarelabs/ui";

import { AppWorkspaceItems } from "@blocks/shared/AppWorkspaceItems";
import { BlockMenuItems } from "@blocks/shared/BlockMenuItems";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsUpDownIcon, PanelRightIcon, PlusIcon, XIcon } from "@blocks/shared/icons";
import type { Shell03Props, Shell03View } from "./Shell03.types";

/** On phones one pane shows at a time; under 1024px the inspector takes the item's place. */

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
        const list = window.matchMedia(query);
        const update = () => setMatches(list.matches);
        update();
        list.addEventListener("change", update);
        return () => list.removeEventListener("change", update);
    }, [query]);
    return matches;
}

/**
 * Three panes: a list on the canvas, and the open item with an inspector beside it on a raised panel. Under 1024px
 * the inspector takes the item's place when asked for; on phones one pane shows at a time, each with a way back.
 */
export function Shell03({
    workspace,
    logo,
    workspaces,
    onNewWorkspace,
    listTitle,
    items,
    selected,
    defaultSelected,
    onSelect,
    newItem,
    account,
    accountMenu = [],
    children,
    inspectorTitle = "Details",
    inspector,
    defaultInspectorOpen = true,
    labels = {},
    className,
    ...props
}: Shell03Props) {
    const id = useId();
    const [ownSelected, setOwnSelected] = useState(defaultSelected ?? items[0]?.id);
    const [view, setView] = useState<Shell03View>("list");
    const [inspectorOpen, setInspectorOpen] = useState(defaultInspectorOpen);
    const [query, setQuery] = useState("");
    const wide = useMediaQuery("(min-width: 1024px)");

    const selectedId = selected ?? ownSelected;
    const item = items.find((entry) => entry.id === selectedId);
    const visible = items.filter((entry) => entry.label.toLowerCase().includes(query.trim().toLowerCase()));

    // When a narrow screen swaps panes, take focus to the new pane's heading so keyboards and screen readers follow.
    const itemRef = useRef<HTMLElement>(null);
    const inspectorRef = useRef<HTMLElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const moved = useRef(false);
    useEffect(() => {
        if (!moved.current) return;
        if (view === "item") itemRef.current?.querySelector<HTMLElement>("h1")?.focus();
        if (view === "inspector") inspectorRef.current?.querySelector<HTMLElement>("h2")?.focus();
        if (view === "list") listRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
    }, [view]);
    const go = (next: Shell03View) => {
        moved.current = true;
        setView(next);
    };

    const open = (next: string) => {
        setOwnSelected(next);
        onSelect?.(next);
        go("item");
    };
    const showDetails = () => (wide ? setInspectorOpen((current) => !current) : go("inspector"));
    const detailsLabel = wide && inspectorOpen ? (labels.hideDetails ?? "Hide details") : (labels.showDetails ?? "Show details");
    const filterLabel = labels.filter ?? "Filter";

    return (
        <div className={cx("ow-shell03", className)} data-view={view} data-inspector={inspectorOpen ? "open" : "closed"} {...props}>
            <div ref={listRef} className="ow-shell03__list">
                <Menu
                    label={labels.workspaces ?? "Workspaces"}
                    width={232}
                    trigger={
                        <Button variant="ghost" size="sm" fullWidth className="ow-shell03__workspace" endIcon={<ChevronsUpDownIcon size={15} />}>
                            {logo}
                            <Text as="span" variant="card-title" tone="default" className="ow-shell03__workspace-name">
                                {workspace}
                            </Text>
                        </Button>
                    }
                >
                    <AppWorkspaceItems
                        workspaces={workspaces ?? [{ name: workspace, current: true }]}
                        onNewWorkspace={onNewWorkspace}
                        heading={labels.workspaces ?? "Workspaces"}
                        newWorkspace={labels.newWorkspace ?? "New workspace"}
                        spacerClassName="ow-shell03__menu-spacer"
                    />
                </Menu>

                <div className="ow-shell03__list-heading">
                    <Text variant="label">
                        {listTitle}
                        <Text as="span" tone="muted" className="ow-shell03__list-count">
                            {items.length}
                        </Text>
                    </Text>
                    {newItem ? (
                        <Tooltip label={newItem.label}>
                            <Button variant="ghost" size="sm" iconOnly aria-label={newItem.label} onClick={newItem.onClick}>
                                <PlusIcon size={16} />
                            </Button>
                        </Tooltip>
                    ) : null}
                </div>

                <SearchField size="sm" className="ow-shell03__search" placeholder={filterLabel} aria-label={filterLabel} value={query} onChange={setQuery} />

                <ScrollShadow className="ow-shell03__scroll">
                    <nav aria-label={listTitle}>
                        {visible.length ? (
                            <ul className="ow-shell03__projects">
                                {visible.map((entry) => (
                                    <li key={entry.id}>
                                        <NavItem
                                            className="ow-shell03__project"
                                            icon={entry.icon}
                                            active={entry.id === selectedId}
                                            end={
                                                entry.status ? (
                                                    <Badge size="sm" variant={entry.status.tone ?? "neutral"}>
                                                        {entry.status.label}
                                                    </Badge>
                                                ) : undefined
                                            }
                                            onClick={() => open(entry.id)}
                                        >
                                            {/* The name takes the item's own type, which turns heavier on the open one. */}
                                            <span className="ow-shell03__project-text">
                                                <span className="ow-shell03__project-name">{entry.label}</span>
                                                {entry.caption !== undefined ? (
                                                    <Text variant="caption" truncate>
                                                        {entry.caption}
                                                    </Text>
                                                ) : null}
                                            </span>
                                        </NavItem>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Text variant="copy" className="ow-shell03__no-match">
                                {labels.noMatch ? labels.noMatch(query.trim()) : <>Nothing matches “{query.trim()}”.</>}
                            </Text>
                        )}
                    </nav>
                </ScrollShadow>

                <Menu
                    label={labels.account ?? "Account"}
                    above
                    width={232}
                    trigger={
                        <Button variant="ghost" fullWidth className="ow-shell03__user" endIcon={<ChevronsUpDownIcon size={15} />}>
                            <Avatar name={account.name} src={account.avatar} size="sm" />
                            <span className="ow-shell03__user-text">
                                <Text as="span" variant="label" tone="default" truncate>
                                    {account.name}
                                </Text>
                                {account.email ? (
                                    <Text variant="caption" truncate>
                                        {account.email}
                                    </Text>
                                ) : null}
                            </span>
                        </Button>
                    }
                >
                    <BlockMenuItems items={accountMenu} />
                </Menu>
            </div>

            <div className="ow-shell03__panel">
                <main ref={itemRef} className="ow-shell03__item">
                    <div className="ow-shell03__toolbar">
                        <span className="ow-shell03__back">
                            <Button variant="ghost" size="sm" startIcon={<ChevronLeftIcon size={16} />} onClick={() => go("list")}>
                                {listTitle}
                            </Button>
                        </span>
                        <Text as="span" tone="muted" className="ow-shell03__crumbs" aria-hidden="true">
                            {listTitle}
                            <ChevronRightIcon size={14} />
                            <Text as="span" variant="label" tone="default" truncate>
                                {item?.label}
                            </Text>
                        </Text>
                        {inspector ? (
                            <Tooltip label={detailsLabel}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    iconOnly
                                    aria-label={detailsLabel}
                                    aria-expanded={wide ? inspectorOpen : undefined}
                                    onClick={showDetails}
                                >
                                    <PanelRightIcon size={16} />
                                </Button>
                            </Tooltip>
                        ) : null}
                    </div>

                    <div className="ow-shell03__content">{children}</div>
                </main>

                {inspector ? (
                    <aside ref={inspectorRef} className="ow-shell03__inspector" aria-labelledby={`${id}-details`}>
                        <div className="ow-shell03__inspector-header">
                            <span className="ow-shell03__inspector-back">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    iconOnly
                                    aria-label={labels.backTo?.(item?.label ?? listTitle) ?? `Back to ${item?.label ?? listTitle}`}
                                    onClick={() => go("item")}
                                >
                                    <ChevronLeftIcon size={16} />
                                </Button>
                            </span>
                            <Text as="h2" variant="card-title" id={`${id}-details`} tabIndex={-1} className="ow-shell03__inspector-title">
                                {inspectorTitle}
                            </Text>
                            <span className="ow-shell03__inspector-close">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    iconOnly
                                    aria-label={labels.hideDetails ?? "Hide details"}
                                    onClick={() => setInspectorOpen(false)}
                                >
                                    <XIcon size={16} />
                                </Button>
                            </span>
                        </div>

                        <div className="ow-shell03__inspector-body">{inspector}</div>
                    </aside>
                ) : null}
            </div>
        </div>
    );
}
