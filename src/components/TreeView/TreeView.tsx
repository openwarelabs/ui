import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { Spinner } from "@/components/Spinner/Spinner";
import { useControllableState } from "@/hooks/useControllableState";
import { CheckIcon, ChevronRightIcon, MinusIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { TreeItem, TreeViewProps } from "./TreeView.types";

export type { TreeItem, TreeViewLabels, TreeViewProps, TreeViewSelectionMode } from "./TreeView.types";

type Checked = boolean | "mixed";

/** A visible row: an item, or the loading or error row under an item whose children are being fetched. */
interface Row {
    id: string;
    item?: TreeItem;
    status?: "loading" | "error";
    parent?: Row;
    /** Its place in the visible rows. */
    index: number;
    level: number;
    pos: number;
    size: number;
    expandable: boolean;
    open: boolean;
    kids: Row[];
}

const defaultLabels = { loading: "Loading…", error: "Couldn't load.", retry: "Retry" };

const same = (a: string[], b: string[]) => a.length === b.length && a.every((id, index) => id === b[index]);

/**
 * A tree of rows that open and close, for categories, org charts, permissions, nested settings or navigation. Rows can
 * be selected (one or many), checked with tri-state parents, activated, and their children fetched when they first open.
 * It's one tab stop: the arrow keys move and open, Home/End jump, typing finds a row, Space selects and Enter activates.
 */
export function TreeView({
    items,
    label,
    "aria-labelledby": ariaLabelledBy,
    expanded,
    defaultExpanded = [],
    onExpandedChange,
    selectionMode = "single",
    selected,
    defaultSelected = [],
    onSelectedChange,
    checkboxes = false,
    loadChildren,
    onAction,
    renderLabel,
    labels: labelsProp,
    className,
}: TreeViewProps) {
    const [open, setOpen] = useControllableState(expanded, defaultExpanded, onExpandedChange);
    const [chosen, setChosen] = useControllableState(selected, defaultSelected, onSelectedChange);
    const [loaded, setLoaded] = useState(() => new Map<string, TreeItem[]>());
    const [failed, setFailed] = useState(() => new Set<string>());
    const [focusId, setFocusId] = useState<string>();
    const inFlight = useRef(new Set<string>());
    const refs = useRef(new Map<string, HTMLLIElement>());
    const typed = useRef({ text: "", timer: 0 });
    // Where a Shift selection grows from, and what was selected before it started.
    const anchor = useRef<{ id: string; base: Set<string> } | null>(null);
    const labels = { ...defaultLabels, ...labelsProp };
    const mode = checkboxes ? "multiple" : selectionMode;
    const multiple = mode === "multiple";
    const chosenSet = new Set(chosen);
    const childrenOf = (item: TreeItem) => item.children ?? loaded.get(item.id);

    const { roots, rows } = useMemo(() => {
        const openSet = new Set(open);
        const flat: Row[] = [];
        const build = (list: TreeItem[], level: number, parent?: Row): Row[] =>
            list.map((item, index) => {
                const kids = item.children ?? loaded.get(item.id);
                const expandable = Boolean(kids ? kids.length : item.hasChildren && loadChildren);
                const row: Row = {
                    id: item.id,
                    item,
                    parent,
                    index: flat.length,
                    level,
                    pos: index + 1,
                    size: list.length,
                    expandable,
                    open: expandable && openSet.has(item.id),
                    kids: [],
                };
                flat.push(row);
                if (row.open && kids) row.kids = build(kids, level + 1, row);
                else if (row.open) {
                    const status = failed.has(item.id) ? "error" : "loading";
                    row.kids = [
                        {
                            id: `${item.id}\n`,
                            status,
                            parent: row,
                            index: flat.length,
                            level: level + 1,
                            pos: 1,
                            size: 1,
                            expandable: false,
                            open: false,
                            kids: [],
                        },
                    ];
                    flat.push(row.kids[0]!);
                }
                return row;
            });
        return { roots: build(items, 1), rows: flat };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only whether there's a loader matters, not its identity.
    }, [items, open, loaded, failed, Boolean(loadChildren)]);

    /** Each loaded item's checkbox: a leaf's own state, a parent's from its children. Keys are in the tree's order. */
    function checkStates(set: Set<string>) {
        const states = new Map<string, Checked>();
        const walk = (item: TreeItem): Checked => {
            states.set(item.id, set.has(item.id));
            const kids = childrenOf(item);
            if (kids?.length) {
                const all = kids.map(walk);
                states.set(item.id, all.every((state) => state === true) ? true : all.some((state) => state !== false) && "mixed");
            }
            return states.get(item.id)!;
        };
        items.forEach(walk);
        return states;
    }

    const checked = checkboxes ? checkStates(chosenSet) : undefined;

    function load(item: TreeItem) {
        if (!loadChildren || inFlight.current.has(item.id)) return;
        inFlight.current.add(item.id);
        // Clears a failure when trying again, so the loading row shows; records one when it fails.
        const settle = (error: boolean) =>
            setFailed((previous) => {
                const next = new Set(previous);
                if (error) next.add(item.id);
                else next.delete(item.id);
                return next;
            });
        settle(false);
        loadChildren(item).then(
            (children) => {
                inFlight.current.delete(item.id);
                setLoaded((previous) => new Map(previous).set(item.id, children));
                // Children that arrive under a checked row are checked too.
                if (checkboxes) {
                    const ids: string[] = [];
                    const collect = (list: TreeItem[]) => list.forEach((child) => (ids.push(child.id), collect(child.children ?? [])));
                    collect(children);
                    setChosen((previous) => (previous.includes(item.id) ? [...previous, ...ids] : previous));
                }
            },
            () => {
                inFlight.current.delete(item.id);
                settle(true);
            },
        );
    }

    // Fetch the children of rows that are open but not loaded yet, whether opened here or through `expanded`.
    useEffect(() => {
        for (const row of rows) if (row.status === "loading") load(row.parent!.item!);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- runs when the visible rows change.
    }, [rows]);

    useEffect(() => () => window.clearTimeout(typed.current.timer), []);

    /** Reports `next` in the tree's order, with checked parents worked out from their children. */
    function commit(next: Set<string>) {
        const states = checkStates(next);
        const ids = [...states.keys()].filter((id) => (checkboxes ? states.get(id) === true : next.has(id)));
        const result = [...ids, ...[...next].filter((id) => !states.has(id))];
        if (!same(result, chosen)) setChosen(result);
    }

    function toggleSelected(row: Row) {
        const item = row.item;
        if (!item || item.disabled || mode === "none") return;
        if (!multiple) return commit(new Set([item.id]));
        const next = new Set(chosen);
        const on = checkboxes ? checked!.get(item.id) !== true : !next.has(item.id);
        const apply = (target: TreeItem) => {
            if (target.disabled) return;
            if (on) next.add(target.id);
            else next.delete(target.id);
            if (checkboxes) childrenOf(target)?.forEach(apply);
        };
        apply(item);
        commit(next);
        anchor.current = { id: item.id, base: next };
    }

    /** Selects the rows from the anchor to `row`, on top of what was selected before the anchor was set. */
    function extendTo(row: Row, from: Row) {
        anchor.current ??= { id: from.id, base: new Set(chosen) };
        const start = rows.findIndex((entry) => entry.id === anchor.current!.id);
        const end = row.index;
        const next = new Set(anchor.current.base);
        for (const entry of rows.slice(Math.min(start < 0 ? end : start, end), Math.max(start, end) + 1)) {
            if (entry.item && !entry.item.disabled) next.add(entry.id);
        }
        commit(next);
    }

    function focusRow(row: Row | undefined) {
        if (!row) return;
        setFocusId(row.id);
        refs.current.get(row.id)?.focus();
    }

    function setRowOpen(row: Row, next: boolean) {
        if (row.expandable && row.open !== next) setOpen((previous) => (next ? [...previous, row.id] : previous.filter((id) => id !== row.id)));
    }

    function activate(row: Row) {
        if (row.status) return row.status === "error" && load(row.parent!.item!);
        if (row.item!.disabled) return;
        if (onAction) onAction(row.item!);
        else if (row.expandable) setRowOpen(row, !row.open);
        else toggleSelected(row);
    }

    function findByTyping(key: string, from: number) {
        const state = typed.current;
        window.clearTimeout(state.timer);
        state.text += key.toLowerCase();
        state.timer = window.setTimeout(() => (state.text = ""), 600);
        // A repeated single letter cycles through the matches.
        const repeated = [...state.text].every((letter) => letter === state.text[0]);
        const search = repeated ? state.text[0]! : state.text;
        for (let offset = 0; offset < rows.length; offset += 1) {
            const row = rows[(from + (repeated ? 1 : 0) + offset) % rows.length]!;
            if (row.item?.label.toLowerCase().startsWith(search)) return focusRow(row);
        }
    }

    function onKeyDown(event: KeyboardEvent<HTMLUListElement>) {
        const row = rows.find((entry) => refs.current.get(entry.id) === event.target);
        if (!row || event.altKey) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const key = rtl ? ({ ArrowRight: "ArrowLeft", ArrowLeft: "ArrowRight" }[event.key] ?? event.key) : event.key;
        const extending = multiple && !checkboxes && event.shiftKey;
        const move = (target: Row | undefined) => {
            focusRow(target);
            if (!extending) anchor.current = null;
            else if (target) extendTo(target, row);
        };
        if (key === "ArrowDown") move(rows[row.index + 1]);
        else if (key === "ArrowUp") move(rows[row.index - 1]);
        else if (key === "Home") move(rows[0]);
        else if (key === "End") move(rows[rows.length - 1]);
        else if (key === "ArrowRight") row.open ? focusRow(rows[row.index + 1]) : setRowOpen(row, true);
        else if (key === "ArrowLeft") row.open ? setRowOpen(row, false) : focusRow(row.parent);
        else if (key === "*") {
            const closed = rows.filter((entry) => entry.parent === row.parent && entry.expandable && !entry.open).map((entry) => entry.id);
            setOpen((previous) => [...previous, ...closed]);
        } else if (key === " ") {
            if (row.status || mode === "none") activate(row);
            else if (extending) extendTo(row, row);
            else toggleSelected(row);
        } else if (key === "Enter") activate(row);
        else if (key.length === 1 && !event.ctrlKey && !event.metaKey) findByTyping(key, row.index);
        else return;
        event.preventDefault();
    }

    const fallback = rows.find((row) => row.item && chosenSet.has(row.id)) ?? rows[0];
    const tabStop = rows.find((row) => row.id === focusId) ?? fallback;

    function render(list: Row[]): ReactNode {
        return list.map((row) => {
            const { item, status } = row;
            const state = item && checked?.get(item.id);
            const isSelected = Boolean(item) && mode !== "none" && !checkboxes && chosenSet.has(row.id);
            return (
                <li
                    key={row.id}
                    ref={(element) => {
                        if (element) refs.current.set(row.id, element);
                        else refs.current.delete(row.id);
                    }}
                    role="treeitem"
                    aria-level={row.level}
                    aria-setsize={row.size}
                    aria-posinset={row.pos}
                    aria-expanded={row.expandable ? row.open : undefined}
                    aria-selected={item && mode !== "none" && !checkboxes ? isSelected : undefined}
                    aria-checked={item && checkboxes ? state : undefined}
                    aria-disabled={item?.disabled || status === "loading" || undefined}
                    aria-busy={row.kids[0]?.status === "loading" || undefined}
                    tabIndex={row === tabStop ? 0 : -1}
                    className="ow-treeview__item"
                    onFocus={(event) => {
                        if (event.target === event.currentTarget) setFocusId(row.id);
                    }}
                >
                    <div
                        className={cx(
                            "ow-treeview__row",
                            isSelected && "ow-treeview__row--selected",
                            item?.disabled && "ow-treeview__row--disabled",
                            status && `ow-treeview__row--${status}`,
                        )}
                        onClick={(event) => {
                            if (status || mode === "none") activate(row);
                            else if (multiple && !checkboxes && event.shiftKey) extendTo(row, tabStop ?? row);
                            else toggleSelected(row);
                        }}
                        onDoubleClick={() => {
                            if (item && mode !== "none") activate(row);
                        }}
                    >
                        {row.expandable ? (
                            <span
                                className="ow-treeview__toggle"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    focusRow(row);
                                    setRowOpen(row, !row.open);
                                }}
                                onDoubleClick={(event) => event.stopPropagation()}
                            >
                                <ChevronRightIcon size={14} />
                            </span>
                        ) : (
                            <span className="ow-treeview__toggle" />
                        )}
                        {item && checkboxes ? (
                            // Looks like a Checkbox; the row itself is the checkbox for keys and screen readers.
                            <span className="ow-checkbox ow-checkbox--sm" aria-hidden="true">
                                <input
                                    ref={(element) => {
                                        if (element) element.indeterminate = state === "mixed";
                                    }}
                                    type="checkbox"
                                    className="ow-checkbox__input"
                                    tabIndex={-1}
                                    checked={state === true}
                                    disabled={item.disabled}
                                    readOnly
                                />
                                {state === "mixed" ? (
                                    <MinusIcon className="ow-checkbox__check ow-checkbox__check--dash" size={10} strokeWidth={3} />
                                ) : (
                                    <CheckIcon className="ow-checkbox__check" size={10} strokeWidth={3} />
                                )}
                            </span>
                        ) : null}
                        {status === "loading" ? <Spinner size="sm" label="" /> : null}
                        {item?.icon ? (
                            <span className="ow-treeview__icon" aria-hidden="true">
                                {item.icon}
                            </span>
                        ) : null}
                        <span className="ow-treeview__text">
                            <span className="ow-treeview__label">
                                {item ? (
                                    (renderLabel?.(item) ?? item.label)
                                ) : status === "loading" ? (
                                    labels.loading
                                ) : (
                                    <>
                                        {labels.error} <span className="ow-treeview__retry">{labels.retry}</span>
                                    </>
                                )}
                            </span>
                            {item?.description ? <span className="ow-treeview__description">{item.description}</span> : null}
                        </span>
                        {item?.end ? <span className="ow-treeview__end">{item.end}</span> : null}
                    </div>
                    {row.kids.length ? (
                        <ul role="group" className="ow-treeview__group">
                            {render(row.kids)}
                        </ul>
                    ) : null}
                </li>
            );
        });
    }

    return (
        <ul
            role="tree"
            aria-label={label}
            aria-labelledby={ariaLabelledBy}
            aria-multiselectable={multiple || undefined}
            className={cx("ow-treeview", className)}
            onKeyDown={onKeyDown}
        >
            {render(roots)}
        </ul>
    );
}
