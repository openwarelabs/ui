import { useEffect, useId, useRef, useState } from "react";

import { CloseButton, cx, Dialog, NavItem, NavList, Text } from "@openwarelabs/ui";

import type { Settings01Props } from "./Settings01.types";

/** Commandr's settings dialog: the sections down the left on the canvas, the chosen one's rows on an inset panel. */
export function Settings01({
    sections,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    shortcut = true,
    section: sectionProp,
    defaultSection,
    onSectionChange,
    labels = {},
    className,
    ...props
}: Settings01Props) {
    const headingId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const [openState, setOpenState] = useState(defaultOpen);
    const [sectionState, setSectionState] = useState(defaultSection ?? sections[0]?.id);
    const open = openProp ?? openState;
    const section = sectionProp ?? sectionState;

    const setOpen = (next: boolean) => {
        setOpenState(next);
        onOpenChange?.(next);
    };
    const latestSetOpen = useRef(setOpen);
    latestSetOpen.current = setOpen;

    // On opening, start on the current section in whichever list is showing, rather than the first thing that takes focus.
    useEffect(() => {
        if (!open) return undefined;
        const frame = requestAnimationFrame(() => {
            const items = rootRef.current?.querySelectorAll<HTMLElement>(".ow-settings01__nav [aria-current='page']") ?? [];
            [...items].find((item) => item.offsetParent !== null)?.focus({ preventScroll: true });
        });
        return () => cancelAnimationFrame(frame);
    }, [open]);

    // ⌘, or Ctrl+, opens settings, as in most desktop apps.
    useEffect(() => {
        if (!shortcut) return undefined;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "," && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                latestSetOpen.current(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [shortcut]);

    const current = sections.find((entry) => entry.id === section) ?? sections[0];
    const choose = (id: string) => {
        setSectionState(id);
        onSectionChange?.(id);
    };

    const navItems = sections.map(({ id, label, icon }) => (
        <NavItem key={id} icon={icon} active={current?.id === id} onClick={() => choose(id)}>
            {label}
        </NavItem>
    ));

    return (
        // Takes no room of its own: the dialog sits over the page it's placed in.
        <div ref={rootRef} className={cx("ow-settings01", className)} {...props}>
            <Dialog open={open} onClose={() => setOpen(false)} title={labels.title ?? "Settings"} width={880} className="ow-settings01__dialog">
                {/* Down the left on wider screens; a sideways strip on phones. */}
                <NavList label={labels.sections ?? "Settings sections"} className="ow-settings01__nav ow-settings01__nav--side">
                    {navItems}
                </NavList>
                <NavList label={labels.sections ?? "Settings sections"} orientation="horizontal" className="ow-settings01__nav ow-settings01__nav--top">
                    {navItems}
                </NavList>
                <Text variant="caption" as="p" className="ow-settings01__saved">
                    {labels.saved ?? "Changes save as you go."}
                </Text>

                <CloseButton label={labels.close ?? "Close settings"} className="ow-settings01__close" onClick={() => setOpen(false)} />
                <div className="ow-settings01__panel">
                    {current ? (
                        <section aria-labelledby={headingId} className="ow-settings01__section">
                            <Text variant="dialog-title" as="h3" id={headingId} className="ow-settings01__section-title">
                                {current.label}
                            </Text>
                            {current.description ? (
                                <Text variant="copy" className="ow-settings01__section-text">
                                    {current.description}
                                </Text>
                            ) : null}
                            <div className="ow-settings01__rows">{current.content}</div>
                        </section>
                    ) : null}
                </div>
            </Dialog>
        </div>
    );
}
