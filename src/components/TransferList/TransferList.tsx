import {
    forwardRef,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type MouseEvent,
} from "react";

import { Button } from "@/components/Button/Button";
import { FormContext } from "@/components/Form/Form";
import { ListBox } from "@/components/ListBox/ListBox";
import type { ListBoxGroup, ListBoxItem, ListBoxOption } from "@/components/ListBox/ListBox.types";
import { SearchField } from "@/components/SearchField/SearchField";
import { useControllableState } from "@/hooks/useControllableState";
import { ArrowDownIcon, ArrowUpIcon, ChevronRightIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { TransferListOption, TransferListProps, TransferListSide } from "./TransferList.types";

export type { TransferListOption, TransferListProps } from "./TransferList.types";

const none: string[] = [];
const sides: TransferListSide[] = ["source", "target"];
const other = (side: TransferListSide): TransferListSide => (side === "source" ? "target" : "source");
const joinNames = (names: string[]) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);

/** Two chevrons, for the buttons that move everything. */
function ChevronsIcon() {
    return (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 17 5-5-5-5M13 17l5-5-5-5" />
        </svg>
    );
}

function matches(option: TransferListOption, query: string) {
    const text = `${option.label} ${typeof option.description === "string" ? option.description : ""}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
}

/** The options as ListBox items, under their groups' headings when asked. */
function toItems(list: TransferListOption[], grouped: boolean): ListBoxItem[] {
    const items: ListBoxItem[] = [];
    const groups = new Map<string, ListBoxGroup>();
    for (const { group, ...option } of list) {
        const item: ListBoxOption = option;
        if (!grouped || !group) {
            items.push(item);
            continue;
        }
        let heading = groups.get(group);
        if (!heading) {
            heading = { label: group, options: [] };
            groups.set(group, heading);
            items.push(heading);
        }
        heading.options.push(item);
    }
    return items;
}

/**
 * Two lists side by side, the available items and the chosen ones, with buttons between them that move the selected
 * items across: permissions, the columns a table shows, a team's members. Double-click or Enter moves an item too.
 */
export const TransferList = forwardRef<HTMLDivElement, TransferListProps>(function TransferList(
    {
        options,
        value,
        defaultValue = none,
        onChange,
        sourceLabel = "Available",
        targetLabel = "Selected",
        searchable = false,
        showMoveAll = false,
        orderable = false,
        name,
        disabled = false,
        height = 280,
        id,
        labels,
        className,
    },
    ref,
) {
    const [chosen, setChosen] = useControllableState(value, defaultValue, onChange);
    const [selection, setSelection] = useState<Record<TransferListSide, string[]>>({ source: none, target: none });
    const [query, setQuery] = useState<Record<TransferListSide, string>>({ source: "", target: "" });
    const [announcement, setAnnouncement] = useState("");
    const lists = useRef<Record<TransferListSide, HTMLDivElement | null>>({ source: null, target: null });
    const baseId = useId();

    const titles = { source: sourceLabel, target: targetLabel };
    const byValue = useMemo(() => new Map(options.map((option) => [option.value, option])), [options]);
    const nameOf = (v: string) => byValue.get(v)?.label ?? v;

    // Each side's items as the list shows them: filtered, grouped, and flattened in the order the rows appear.
    const view = useMemo(() => {
        const taken = new Set(chosen);
        const all = {
            source: options.filter((option) => !taken.has(option.value)),
            target: chosen.flatMap((v) => byValue.get(v) ?? []),
        };
        return Object.fromEntries(
            sides.map((side) => {
                const items = toItems(
                    all[side].filter((option) => matches(option, query[side])),
                    side === "source" || !orderable,
                );
                const flat = items.flatMap((item) => ("options" in item ? item.options : [item]));
                return [side, { items, flat }];
            }),
        ) as Record<TransferListSide, { items: ListBoxItem[]; flat: ListBoxOption[] }>;
    }, [options, chosen, byValue, query, orderable]);

    /** The selected items the list shows (the search may hide some), in its order. */
    const picked = (side: TransferListSide) => view[side].flat.filter((option) => !option.disabled && selection[side].includes(option.value)).map((option) => option.value);

    // Inside a Form, say when the values change: the hidden inputs that carry them fire no events of their own.
    const changed = useContext(FormContext)?.changed;
    const valuesKey = chosen.join("\n");
    const lastKey = useRef(valuesKey);
    useEffect(() => {
        if (lastKey.current === valuesKey) return;
        lastKey.current = valuesKey;
        if (name) changed?.(name);
    }, [valuesKey, changed, name]);

    function move(from: TransferListSide, values: string[], refocus = false) {
        const moving = values.filter((v) => !byValue.get(v)?.disabled);
        if (disabled || !moving.length) return;
        const to = titles[other(from)];
        setChosen(from === "source" ? [...chosen, ...moving] : chosen.filter((v) => !moving.includes(v)));
        setSelection((previous) => ({ ...previous, [from]: previous[from].filter((v) => !moving.includes(v)) }));
        const names = moving.map(nameOf);
        setAnnouncement(labels?.moved ? labels.moved(names, to) : `Moved ${names.length > 5 ? `${names.length} items` : joinNames(names)} to ${to}`);
        // The button that was pressed is now disabled, so focus goes back to the list it emptied.
        if (refocus) lists.current[from]?.focus();
    }

    function canReorder(direction: "up" | "down") {
        const step = direction === "up" ? -1 : 1;
        const set = new Set(picked("target"));
        return chosen.some((v, index) => set.has(v) && index + step >= 0 && index + step < chosen.length && !set.has(chosen[index + step]!));
    }

    function reorder(direction: "up" | "down") {
        const set = new Set(picked("target"));
        if (disabled || !canReorder(direction)) return;
        const next = [...chosen];
        const step = direction === "up" ? -1 : 1;
        const indexes = next.map((_, index) => index);
        if (direction === "down") indexes.reverse();
        // Each selected item swaps with an unselected neighbour, so a run of them moves together and stops at the end.
        for (const index of indexes) {
            const neighbour = index + step;
            if (set.has(next[index]!) && neighbour >= 0 && neighbour < next.length && !set.has(next[neighbour]!)) {
                [next[index], next[neighbour]] = [next[neighbour]!, next[index]!];
            }
        }
        setChosen(next);
        const names = [...set].map(nameOf);
        setAnnouncement(labels?.reordered ? labels.reordered(names, direction) : `Moved ${joinNames(names)} ${direction}`);
    }

    /** The option behind a row element, by its place among the list's rows. */
    function optionAt(side: TransferListSide, row: Element | null | undefined) {
        const rows = [...(lists.current[side]?.querySelectorAll(".ow-option") ?? [])];
        return row ? view[side].flat[rows.indexOf(row)] : undefined;
    }

    function onKeyDownCapture(side: TransferListSide, event: KeyboardEvent<HTMLDivElement>) {
        const list = lists.current[side];
        if (event.target !== list || disabled) return;
        if (event.key === "Enter" && !event.altKey && !event.shiftKey) {
            // Enter moves the highlighted item, or the whole selection when it's part of it. Space still selects.
            const active = optionAt(side, list.querySelector(`[id="${list.getAttribute("aria-activedescendant")}"]`));
            if (!active) return;
            event.preventDefault();
            event.stopPropagation();
            move(side, selection[side].includes(active.value) ? picked(side) : [active.value]);
        } else if (orderable && side === "target" && event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
            event.preventDefault();
            reorder(event.key === "ArrowUp" ? "up" : "down");
        }
    }

    function onDoubleClick(side: TransferListSide, event: MouseEvent<HTMLDivElement>) {
        const option = optionAt(side, (event.target as Element).closest(".ow-option"));
        if (option) move(side, [option.value]);
    }

    function moveButtons(from: TransferListSide) {
        const to = titles[other(from)];
        const selected = picked(from);
        const all = view[from].flat.filter((option) => !option.disabled).map((option) => option.value);
        const selectedLabel = labels?.moveSelected ? labels.moveSelected(selected.length, to) : `Move ${selected.length ? `${selected.length} ` : ""}selected to ${to}`;
        const allLabel = labels?.moveAll ? labels.moveAll(to) : `Move all to ${to}`;
        const flip = from === "target" && "ow-transfer-list__icon--back";
        const selectedButton = (
            <Button key="selected" size="sm" iconOnly aria-label={selectedLabel} title={selectedLabel} disabled={disabled || !selected.length} onClick={() => move(from, selected, true)}>
                <span className={cx("ow-transfer-list__icon", flip)}>
                    <ChevronRightIcon size={16} />
                </span>
            </Button>
        );
        const allButton = showMoveAll ? (
            <Button key="all" size="sm" iconOnly aria-label={allLabel} title={allLabel} disabled={disabled || !all.length} onClick={() => move(from, all, true)}>
                <span className={cx("ow-transfer-list__icon", flip)}>
                    <ChevronsIcon />
                </span>
            </Button>
        ) : null;
        // Everything going across sits at the top, everything coming back at the bottom.
        return from === "source" ? [allButton, selectedButton] : [selectedButton, allButton];
    }

    function pane(side: TransferListSide) {
        const labelId = `${baseId}-${side}-label`;
        const countId = `${baseId}-${side}-count`;
        const { items, flat } = view[side];
        const selectedCount = picked(side).length;
        return (
            <div className="ow-transfer-list__pane">
                <div className="ow-transfer-list__header">
                    <span id={labelId} className="ow-transfer-list__label">
                        {titles[side]}
                    </span>
                    <span id={countId} className="ow-transfer-list__count">
                        {labels?.count ? labels.count(selectedCount, flat.length) : `${selectedCount} of ${flat.length} selected`}
                    </span>
                </div>
                {searchable ? (
                    <SearchField
                        size="sm"
                        aria-label={labels?.search ? labels.search(titles[side]) : `Search ${titles[side]}`}
                        value={query[side]}
                        onChange={(text) => setQuery((previous) => ({ ...previous, [side]: text }))}
                        disabled={disabled}
                    />
                ) : null}
                <div onKeyDownCapture={(event) => onKeyDownCapture(side, event)} onDoubleClick={(event) => onDoubleClick(side, event)}>
                    <ListBox
                        ref={(element) => {
                            lists.current[side] = element;
                        }}
                        selectionMode="multiple"
                        options={items}
                        value={selection[side]}
                        onChange={(next) => setSelection((previous) => ({ ...previous, [side]: next }))}
                        emptyMessage={query[side].trim() ? (labels?.noMatches ?? "No matches") : (labels?.empty ?? "No items")}
                        disabled={disabled}
                        aria-labelledby={labelId}
                        aria-describedby={countId}
                        className="ow-transfer-list__list"
                    />
                </div>
                {orderable && side === "target" ? (
                    <div className="ow-transfer-list__order">
                        {(["up", "down"] as const).map((direction) => (
                            <Button
                                key={direction}
                                size="sm"
                                variant="ghost"
                                startIcon={direction === "up" ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />}
                                aria-keyshortcuts={direction === "up" ? "Alt+ArrowUp" : "Alt+ArrowDown"}
                                disabled={disabled || !canReorder(direction)}
                                onClick={() => reorder(direction)}
                            >
                                {direction === "up" ? (labels?.moveUp ?? "Move up") : (labels?.moveDown ?? "Move down")}
                            </Button>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <div
            ref={ref}
            id={id}
            className={cx("ow-transfer-list", { "ow-transfer-list--disabled": disabled }, className)}
            style={{ "--ow-transfer-list-height": typeof height === "number" ? `${height}px` : height } as CSSProperties}
        >
            <div className="ow-transfer-list__body">
                {pane("source")}
                <div className="ow-transfer-list__actions">
                    {moveButtons("source")}
                    {moveButtons("target")}
                </div>
                {pane("target")}
            </div>
            {name ? chosen.map((v, index) => <input key={index} type="hidden" name={name} value={v} disabled={disabled} />) : null}
            <span className="ow-visually-hidden" aria-live="polite">
                {announcement}
            </span>
        </div>
    );
});
