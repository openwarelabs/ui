import {
    createContext,
    useContext,
    useId,
    useLayoutEffect,
    useRef,
    type ButtonHTMLAttributes,
    type HTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
} from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { useIndicator } from "../../hooks/useIndicator";
import { cx } from "../../utils/cx";

interface TabsContextValue {
    value: string;
    select(value: string): void;
    baseId: string;
    variant: "segmented" | "line";
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string) {
    const context = useContext(TabsContext);
    if (!context) throw new Error(`${component} must be inside <Tabs>.`);
    return context;
}

const idPart = (value: string) => value.replace(/[^\w-]/g, "_");

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
    /** The selected tab's value. Leave out to let Tabs keep its own state. */
    value?: string;
    /** The tab selected first when uncontrolled. */
    defaultValue?: string;
    onValueChange?(value: string): void;
    /** `segmented` raises the chosen tab in a well (Commandr's switcher); `line` underlines it.
     * @default "segmented" */
    variant?: "segmented" | "line";
    children: ReactNode;
}

/** Views of the same thing, one at a time: TabList with Tabs, then a TabPanel for each. */
export function Tabs({ value, defaultValue = "", onValueChange, variant = "segmented", className, children, ...props }: TabsProps) {
    const [current, select] = useControllableState(value, defaultValue, onValueChange);
    const baseId = useId();
    return (
        <TabsContext.Provider value={{ value: current, select, baseId, variant }}>
            <div className={cx("ow-tabs", `ow-tabs--${variant}`, className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
    /** Names the set of tabs for screen readers. */
    "aria-label"?: string;
}

/** The row of tabs. The arrow keys, Home and End move between them and select. */
export function TabList({ className, onKeyDown, children, ...props }: TabListProps) {
    const { value, select } = useTabs("TabList");
    const listRef = useRef<HTMLDivElement>(null);
    useIndicator(listRef, '[role="tab"][aria-selected="true"]', value);

    // No tab matches the value (no defaultValue given): select the first one.
    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list || list.querySelector('[role="tab"][aria-selected="true"]')) return;
        const first = list.querySelector<HTMLButtonElement>('[role="tab"]:not(:disabled)');
        if (first?.dataset.value) select(first.dataset.value);
    }, [value, select]);

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        onKeyDown?.(event);
        const tabs = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')];
        const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
        if (index < 0) return;
        const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
        if (!(event.key in moves)) return;
        event.preventDefault();
        const next = tabs[(moves[event.key]! + tabs.length) % tabs.length]!;
        next.focus();
        if (next.dataset.value) select(next.dataset.value);
    }

    return (
        <div ref={listRef} role="tablist" className={cx("ow-tabs__list", className)} onKeyDown={handleKeyDown} {...props}>
            {children}
            <span className="ow-indicator" aria-hidden="true" />
        </div>
    );
}

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
    value: string;
    /** A 16px icon before the label. */
    icon?: ReactNode;
}

/** One tab. Its `value` matches a TabPanel's. */
export function Tab({ value, icon, className, children, onClick, ...props }: TabProps) {
    const { value: current, select, baseId } = useTabs("Tab");
    const selected = current === value;
    return (
        <button
            type="button"
            role="tab"
            id={`${baseId}-tab-${idPart(value)}`}
            aria-selected={selected}
            aria-controls={`${baseId}-panel-${idPart(value)}`}
            tabIndex={selected ? 0 : -1}
            data-value={value}
            className={cx("ow-tab", className)}
            onClick={(event) => {
                onClick?.(event);
                if (!event.defaultPrevented) select(value);
            }}
            {...props}
        >
            {icon ? <span className="ow-tab__icon">{icon}</span> : null}
            {children}
        </button>
    );
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
    value: string;
    /** Keep the panel in the page while hidden, so its state survives switching tabs.
     * @default false */
    keepMounted?: boolean;
}

/** The content for one tab. */
export function TabPanel({ value, keepMounted = false, className, children, ...props }: TabPanelProps) {
    const { value: current, baseId } = useTabs("TabPanel");
    const selected = current === value;
    if (!selected && !keepMounted) return null;
    return (
        <div
            role="tabpanel"
            id={`${baseId}-panel-${idPart(value)}`}
            aria-labelledby={`${baseId}-tab-${idPart(value)}`}
            tabIndex={0}
            hidden={!selected}
            className={cx("ow-tabs__panel", className)}
            {...props}
        >
            {children}
        </div>
    );
}
