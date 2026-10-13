import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon } from "../../icons";
import { cx } from "../../utils/cx";

export interface FileTreeNode {
    name: string;
    /** A folder's contents. Give folders an empty array if they're empty. */
    children?: FileTreeNode[];
    /** Replaces the file or folder icon. */
    icon?: ReactNode;
    /** Muted text at the right of the row, such as "+12 −3" or a size. */
    meta?: ReactNode;
}

export interface FileTreeProps {
    items: FileTreeNode[];
    /** The selected file's path, "src/app.tsx". */
    selected?: string;
    defaultSelected?: string;
    onSelect?(path: string): void;
    /** Folder paths open at first, or "all".
     * @default "all" */
    defaultExpanded?: string[] | "all";
    /** Names the tree for screen readers.
     * @default "Files" */
    label?: string;
    className?: string;
}

interface Row {
    node: FileTreeNode;
    path: string;
    level: number;
    parent?: string;
    isFolder: boolean;
}

function flatten(nodes: FileTreeNode[], expanded: Set<string>, parent?: string, level = 1): Row[] {
    return nodes.flatMap((node) => {
        const path = parent ? `${parent}/${node.name}` : node.name;
        const isFolder = node.children !== undefined;
        const row: Row = { node, path, level, parent, isFolder };
        return isFolder && expanded.has(path) ? [row, ...flatten(node.children!, expanded, path, level + 1)] : [row];
    });
}

function allFolders(nodes: FileTreeNode[], parent?: string): string[] {
    return nodes.flatMap((node) => {
        const path = parent ? `${parent}/${node.name}` : node.name;
        return node.children ? [path, ...allFolders(node.children, path)] : [];
    });
}

/**
 * Commandr's project structure explorer: folders open and close, files can be selected.
 * Up and Down move, Right opens a folder or goes into it, Left closes it or goes to its parent.
 */
export function FileTree({
    items,
    selected,
    defaultSelected = "",
    onSelect,
    defaultExpanded = "all",
    label = "Files",
    className,
}: FileTreeProps) {
    const [current, setCurrent] = useControllableState(selected, defaultSelected, onSelect);
    const [expanded, setExpanded] = useState(() => new Set(defaultExpanded === "all" ? allFolders(items) : defaultExpanded));
    const rows = useMemo(() => flatten(items, expanded), [items, expanded]);
    const [focusPath, setFocusPath] = useState<string | undefined>();
    const refs = useRef(new Map<string, HTMLLIElement>());
    const tabStop = rows.some((row) => row.path === focusPath) ? focusPath : (rows.find((row) => row.path === current) ?? rows[0])?.path;

    function focus(path: string | undefined) {
        if (!path) return;
        setFocusPath(path);
        refs.current.get(path)?.focus();
    }

    function toggle(path: string, open?: boolean) {
        setExpanded((previous) => {
            const next = new Set(previous);
            if (open ?? !next.has(path)) next.add(path);
            else next.delete(path);
            return next;
        });
    }

    function activate(row: Row) {
        if (row.isFolder) toggle(row.path);
        else setCurrent(row.path);
    }

    function onKeyDown(event: KeyboardEvent<HTMLLIElement>, row: Row) {
        const index = rows.indexOf(row);
        const handlers: Record<string, () => void> = {
            ArrowDown: () => focus(rows[index + 1]?.path),
            ArrowUp: () => focus(rows[index - 1]?.path),
            Home: () => focus(rows[0]?.path),
            End: () => focus(rows[rows.length - 1]?.path),
            ArrowRight: () => {
                if (!row.isFolder) return;
                if (!expanded.has(row.path)) toggle(row.path, true);
                else focus(rows[index + 1]?.level === row.level + 1 ? rows[index + 1]!.path : undefined);
            },
            ArrowLeft: () => {
                if (row.isFolder && expanded.has(row.path)) toggle(row.path, false);
                else focus(row.parent);
            },
            Enter: () => activate(row),
            " ": () => activate(row),
        };
        const handler = handlers[event.key];
        if (!handler) return;
        event.preventDefault();
        event.stopPropagation();
        handler();
    }

    function render(nodes: FileTreeNode[], parent?: string, level = 1): ReactNode {
        return nodes.map((node) => {
            const path = parent ? `${parent}/${node.name}` : node.name;
            const row = rows.find((entry) => entry.path === path);
            if (!row) return null;
            const isOpen = row.isFolder && expanded.has(path);
            const icon = node.icon ?? (row.isFolder ? isOpen ? <FolderOpenIcon size={16} /> : <FolderIcon size={16} /> : <FileIcon size={16} />);
            return (
                <li
                    key={path}
                    ref={(element) => {
                        if (element) refs.current.set(path, element);
                        else refs.current.delete(path);
                    }}
                    role="treeitem"
                    aria-level={level}
                    aria-expanded={row.isFolder ? isOpen : undefined}
                    aria-selected={row.isFolder ? undefined : current === path}
                    tabIndex={tabStop === path ? 0 : -1}
                    className="ow-tree__item"
                    onKeyDown={(event) => onKeyDown(event, row)}
                    onFocus={(event) => {
                        if (event.target === event.currentTarget) setFocusPath(path);
                    }}
                >
                    <div
                        className={cx("ow-tree__row", !row.isFolder && current === path && "ow-tree__row--selected")}
                        title={path}
                        onClick={() => {
                            focus(path);
                            activate(row);
                        }}
                    >
                        {row.isFolder ? (
                            <ChevronRightIcon size={14} className={cx("ow-tree__chevron", isOpen && "ow-tree__chevron--open")} />
                        ) : (
                            <span className="ow-tree__spacer" />
                        )}
                        <span className={cx("ow-tree__icon", row.isFolder && "ow-tree__icon--folder")}>{icon}</span>
                        <span className="ow-tree__name">{node.name}</span>
                        {node.meta ? <span className="ow-tree__meta">{node.meta}</span> : null}
                    </div>
                    {isOpen && node.children!.length > 0 ? (
                        <ul role="group" className="ow-tree__group">
                            {render(node.children!, path, level + 1)}
                        </ul>
                    ) : null}
                </li>
            );
        });
    }

    return (
        <ul role="tree" aria-label={label} className={cx("ow-tree", className)}>
            {render(items)}
        </ul>
    );
}
