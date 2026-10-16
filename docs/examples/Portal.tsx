import { useEffect, useId, useRef, useState, type CSSProperties, type RefObject } from "react";

import { Badge, Button, Card, Portal, Stack, Switch, Text } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Portal",
    category: "Layout",
    description:
        "Renders its children somewhere else in the document, document.body by default, so a floating piece of your own escapes a parent's overflow: hidden, transform or stacking context. The library's Dialog, Drawer and Popover don't use it: they sit in the browser's top layer.",
    source: "components/Portal/Portal.tsx",
    imports: ["Portal"],
    props: ["PortalProps"],
    notes: [
        "It's for overlays you build yourself. Dialog, Drawer, Popover, Tooltip, Menu and HoverCard already escape every parent through the native top layer (useModalDialog and useFloating), so they don't need one.",
        "On the server, and on the first render in the browser, it renders nothing, so server-rendered markup matches and nothing reads document before it exists.",
        "A portalled element is still inside the React tree: context, state and events (a click on it bubbles to React parents) work as if it were in place. Only the DOM position changes, so position it yourself, from the trigger's getBoundingClientRect.",
        "Where it renders changes the reading order: screen readers meet the children at the end of the document. Give the trigger aria-expanded and aria-controls, or move focus to the children when they open.",
        "disabled renders the children in place, for a layout where nothing clips them or to compare.",
    ],
    related: ["Dialog", "Popover", "VisuallyHidden"],
    since: "0.18.0",
};

/** Where a note goes: just under its button, in page coordinates, so it moves with the page. */
function useAnchor(ref: RefObject<HTMLElement | null>, open: boolean) {
    const [position, setPosition] = useState<CSSProperties>({});
    useEffect(() => {
        if (!open) return undefined;
        const measure = () => {
            const rect = ref.current?.getBoundingClientRect();
            if (!rect) return;
            setPosition({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX });
        };
        measure();
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", measure, true);
        return () => {
            window.removeEventListener("resize", measure);
            window.removeEventListener("scroll", measure, true);
        };
    }, [open, ref]);
    return position;
}

const noteStyle: CSSProperties = {
    position: "absolute",
    zIndex: 70,
    maxWidth: 260,
    padding: "var(--ow-space-sm) var(--ow-space-md)",
    borderRadius: "var(--ow-radius-md)",
    background: "var(--ow-tooltip)",
    color: "var(--ow-on-tooltip)",
    fontSize: 13,
    lineHeight: 1.4,
    boxShadow: "var(--ow-shadow-menu)",
};

/** A note that opens under a button inside a short card with overflow hidden. In a Portal it shows in full; in place it would be cut off. */
export function Basic() {
    const [open, setOpen] = useState(false);
    const button = useRef<HTMLButtonElement>(null);
    const position = useAnchor(button, open);
    const id = useId();
    return (
        <Card style={{ width: 360, maxWidth: "100%", height: 96, overflow: "hidden" }}>
            <Stack direction="row" align="center" justify="between" gap="md">
                <Text variant="label">Billing contact</Text>
                <Button ref={button} variant="secondary" size="sm" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen((value) => !value)}>
                    {open ? "Hide note" : "Show note"}
                </Button>
            </Stack>
            {open && (
                <Portal>
                    <div id={id} role="note" style={{ ...noteStyle, ...position }}>
                        Invoices go to Aoife Byrne (finance@brightwater.ie). Change this under Settings, Billing.
                    </div>
                </Portal>
            )}
        </Card>
    );
}

/** The same note with the Portal turned off: rendered in place, the card's overflow: hidden cuts it off. */
export function Disabled() {
    const [open, setOpen] = useState(true);
    const [inPlace, setInPlace] = useState(true);
    const button = useRef<HTMLButtonElement>(null);
    const position = useAnchor(button, open && !inPlace);
    const id = useId();
    return (
        <Stack gap="md" style={{ width: 360, maxWidth: "100%" }}>
            <Stack direction="row" align="center" gap="sm">
                <Switch checked={inPlace} onChange={setInPlace} aria-labelledby={`${id}-label`} />
                <Text id={`${id}-label`} variant="label">
                    Render in place (disabled)
                </Text>
            </Stack>
            <Card style={{ height: 96, overflow: "hidden", position: "relative" }}>
                <Stack direction="row" align="center" justify="between" gap="md">
                    <Text variant="label">Delivery</Text>
                    <Button ref={button} variant="secondary" size="sm" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen((value) => !value)}>
                        {open ? "Hide note" : "Show note"}
                    </Button>
                </Stack>
                {open && (
                    <Portal disabled={inPlace}>
                        <div id={id} role="note" style={{ ...noteStyle, ...(inPlace ? { top: 64, right: 16 } : position) }}>
                            Orders placed before noon leave the same day. Saturday deliveries go out from the Cork depot.
                        </div>
                    </Portal>
                )}
            </Card>
        </Stack>
    );
}

/** Into an element of your own: a function returns the container, looked up once the Portal has mounted. */
export function IntoAnElement() {
    const id = useId();
    const [count, setCount] = useState(2);
    return (
        <Stack gap="md" style={{ width: 360, maxWidth: "100%" }}>
            <Card>
                <Stack direction="row" align="center" justify="between" gap="md">
                    <Text variant="label">Reviewers</Text>
                    <Button variant="secondary" size="sm" onClick={() => setCount((value) => (value % 3) + 1)}>
                        Change
                    </Button>
                </Stack>
                <Portal container={() => document.getElementById(id)}>
                    {["Cian", "Niamh", "Saoirse"].slice(0, count).map((name) => (
                        <Badge key={name}>{name}</Badge>
                    ))}
                </Portal>
            </Card>
            <Stack gap="2xs">
                <Text variant="caption" tone="muted">
                    Rendered here, outside the card:
                </Text>
                <div id={id} style={{ display: "flex", gap: 8, minHeight: 24 }} />
            </Stack>
        </Stack>
    );
}
IntoAnElement.layout = { align: "start" as const };
