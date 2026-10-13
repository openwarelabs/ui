import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

import { useModalDialog } from "../../hooks/useModalDialog";
import { CornerDownLeftIcon, SearchIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { filterCommands } from "./filterCommands";

export interface Command {
    /** Unique in the list, e.g. "project.new". */
    id: string;
    title: string;
    /** Commands with the same group are listed together under its name (when nothing is typed). */
    group?: string;
    icon?: ReactNode;
    /** Extra words that should find this command, e.g. "start go" for Run. */
    keywords?: string;
    /** Shown on the right, e.g. a folder or "Running". */
    hint?: string;
    /** Shortcut shown on the right, e.g. "⌘,". */
    shortcut?: string;
    /** Why it can't run right now; the command still shows, greyed out, with this as its hint. */
    disabled?: string;
    run(): void;
}

export interface CommandPaletteProps {
    open: boolean;
    onClose(): void;
    commands: Command[];
    /** Default "Search commands…". */
    placeholder?: string;
}

/** ⌘K: search every action and run it from the keyboard. Arrow keys (or Ctrl+N and Ctrl+P) move, Enter runs. */
export function CommandPalette({ open, onClose, commands, placeholder = "Search commands…" }: CommandPaletteProps) {
    const { dialogRef, mounted } = useModalDialog(open, onClose);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef<HTMLUListElement>(null);
    const listId = useId();
    const results = useMemo(() => filterCommands(commands, query), [commands, query]);
    const active = results[Math.min(activeIndex, results.length - 1)];

    useEffect(() => setActiveIndex(0), [query]);
    useEffect(() => {
        if (open) setQuery("");
    }, [open]);
    useEffect(() => {
        listRef.current?.querySelector("[aria-selected=true]")?.scrollIntoView({ block: "nearest" });
    }, [activeIndex, results]);

    if (!mounted) return null;

    function run(command: Command | undefined) {
        if (!command || command.disabled) return;
        onClose();
        // After the palette has closed, so dialogs the command opens get focus.
        window.setTimeout(() => command.run(), 0);
    }

    function move(step: number) {
        if (!results.length) return;
        setActiveIndex((index) => (Math.min(index, results.length - 1) + step + results.length) % results.length);
    }

    return (
        <dialog ref={dialogRef} className="ow-dialog ow-palette" aria-label="Command palette">
            <div className="ow-palette__search">
                <SearchIcon size={16} className="ow-palette__search-icon" />
                <input
                    autoFocus
                    className="ow-palette__input"
                    placeholder={placeholder}
                    role="combobox"
                    aria-expanded="true"
                    aria-controls={listId}
                    aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
                    aria-autocomplete="list"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "ArrowDown" || (event.ctrlKey && event.key === "n")) {
                            event.preventDefault();
                            move(1);
                        } else if (event.key === "ArrowUp" || (event.ctrlKey && event.key === "p")) {
                            event.preventDefault();
                            move(-1);
                        } else if (event.key === "Enter") {
                            event.preventDefault();
                            run(active);
                        }
                    }}
                />
                <kbd className="ow-palette__esc">esc</kbd>
            </div>
            <ul ref={listRef} id={listId} role="listbox" aria-label="Commands" className="ow-palette__list">
                {results.length ? (
                    results.map((command, index) => {
                        const showGroup =
                            !query.trim() && command.group && command.group !== results[index - 1]?.group;
                        const isActive = command === active;
                        return (
                            <li key={command.id} role="presentation">
                                {showGroup ? <div className="ow-palette__group">{command.group}</div> : null}
                                <div
                                    id={`${listId}-${command.id}`}
                                    role="option"
                                    aria-selected={isActive}
                                    aria-disabled={Boolean(command.disabled)}
                                    title={command.disabled}
                                    className={cx("ow-palette__option", {
                                        "ow-palette__option--active": isActive,
                                        "ow-palette__option--disabled": Boolean(command.disabled),
                                    })}
                                    onMouseMove={() => setActiveIndex(index)}
                                    onClick={() => run(command)}
                                >
                                    <span className="ow-palette__icon" aria-hidden="true">
                                        {command.icon}
                                    </span>
                                    <span className="ow-palette__title">{command.title}</span>
                                    {command.disabled && isActive ? (
                                        <span className="ow-palette__hint">{command.disabled}</span>
                                    ) : command.hint ? (
                                        <span className="ow-palette__hint">{command.hint}</span>
                                    ) : null}
                                    {command.shortcut ? (
                                        <kbd className="ow-palette__shortcut">{command.shortcut}</kbd>
                                    ) : null}
                                    {isActive && !command.disabled ? (
                                        <CornerDownLeftIcon size={13} className="ow-palette__enter" />
                                    ) : null}
                                </div>
                            </li>
                        );
                    })
                ) : (
                    <li className="ow-palette__empty">No commands match &ldquo;{query}&rdquo;.</li>
                )}
            </ul>
        </dialog>
    );
}
