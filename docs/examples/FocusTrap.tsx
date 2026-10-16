import { useId, useRef, useState } from "react";

import { Button, Field, FocusTrap, Input, Stack, Switch, Text, useFocusTrap } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "FocusTrap",
    category: "Layout",
    description:
        "Keeps keyboard focus inside a piece of your own UI while it's active, and gives it back when it isn't: a custom side panel, an inline edit mode, a toolbar that takes over for a moment. The library's Dialog and Drawer already trap focus through the native dialog, so this is for overlays that aren't one.",
    source: "components/FocusTrap/FocusTrap.tsx",
    imports: ["FocusTrap", "useFocusTrap"],
    props: ["FocusTrapProps", "UseFocusTrapOptions"],
    keyboard: [
        ["Tab", "Moves to the next element inside. From the last, to the first (unless loop is off)."],
        ["Shift+Tab", "Moves to the previous element inside. From the first, to the last."],
        ["Escape", "Calls onEscape; with escapeDeactivates, lets go of the trap too."],
    ],
    notes: [
        "A <dialog> opened with showModal() traps focus by itself, and Dialog, Drawer and ConfirmDialog use one. Reach for FocusTrap only for something that isn't a dialog: an inline panel that stays in the page, a custom overlay built with Portal.",
        "When it activates, focus goes to the first tabbable element inside (or wherever initialFocus says). When it lets go, focus returns to the element that had it before, so the person lands back on the button that opened it. Keep that button mounted while the trap is open: if it has gone, focus has nowhere to go back to.",
        "Focus that leaves the container (a click on something focusable outside, a browser extension) is pulled back to the first element. A press on something outside is swallowed unless clickOutsideDeactivates is on, which lets the press through and releases the trap.",
        "Traps nest: only the innermost one acts. A Dialog opened from inside a trap keeps its focus, as the trap leaves open dialogs alone.",
        "It renders a div with tabIndex -1 by default. Pass as=\"section\" with aria-labelledby, or asChild to make your own element the container, so screen readers hear what they've landed in.",
        "useFocusTrap(ref, options) is the same behaviour for an element you render yourself. The hooks useModalDialog, useFloating, useDismiss and usePresence cover the rest of an overlay.",
    ],
    related: ["Dialog", "Popover", "VisuallyHidden"],
    since: "0.18.0",
};

const panelStyle = {
    padding: "var(--ow-space-lg)",
    border: "1px solid var(--ow-border)",
    borderRadius: "var(--ow-radius-container)",
    background: "var(--ow-surface)",
    width: 360,
    maxWidth: "100%",
};

/** An inline edit mode: the button opens a panel, Tab loops through its fields and buttons, Escape or Cancel closes it and focus goes back to the button. */
export function Basic() {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("Aoife Byrne");
    const [role, setRole] = useState("Finance lead");
    const headingId = useId();

    return (
        <Stack gap="md" style={{ width: 360, maxWidth: "100%" }}>
            <Stack direction="row" align="center" justify="between" gap="md">
                <Stack gap="3xs">
                    <Text as="h3" variant="card-title">
                        {name}
                    </Text>
                    <Text variant="caption" tone="muted">
                        {role}
                    </Text>
                </Stack>
                {/* The button stays mounted while the panel is open, so focus has somewhere to come back to. */}
                <Button variant="secondary" size="sm" aria-expanded={editing} onClick={() => setEditing(true)}>
                    Edit profile
                </Button>
            </Stack>
            {editing && (
                <FocusTrap as="section" aria-labelledby={headingId} escapeDeactivates onDeactivate={() => setEditing(false)} style={panelStyle}>
                    <Stack gap="md">
                        <Text as="h3" id={headingId} variant="card-title">
                            Edit profile
                        </Text>
                        <Field label="Name">
                            <Input value={name} onChange={(event) => setName(event.target.value)} />
                        </Field>
                        <Field label="Role">
                            <Input value={role} onChange={(event) => setRole(event.target.value)} />
                        </Field>
                        <Stack direction="row" gap="sm" justify="end">
                            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => setEditing(false)}>
                                Save
                            </Button>
                        </Stack>
                    </Stack>
                </FocusTrap>
            )}
        </Stack>
    );
}
Basic.layout = { align: "start" as const, minHeight: 320 };

/** The options, switched live: loop, returnFocus and clickOutsideDeactivates. Turn one off, open the panel and try Tab past the end, Close, or a click outside. */
export function Options() {
    const [open, setOpen] = useState(false);
    const [loop, setLoop] = useState(true);
    const [returnFocus, setReturnFocus] = useState(true);
    const [clickOutside, setClickOutside] = useState(false);
    const headingId = useId();
    const id = useId();

    const option = (label: string, checked: boolean, onChange: (value: boolean) => void, key: string) => (
        <Stack direction="row" align="center" gap="sm">
            <Switch checked={checked} onChange={onChange} aria-labelledby={`${id}-${key}-label`} />
            <Text id={`${id}-${key}-label`} variant="label">
                {label}
            </Text>
        </Stack>
    );

    return (
        <Stack gap="lg" style={{ width: 360, maxWidth: "100%" }}>
            <Stack gap="sm">
                {option("loop", loop, setLoop, "loop")}
                {option("returnFocus", returnFocus, setReturnFocus, "return")}
                {option("clickOutsideDeactivates", clickOutside, setClickOutside, "outside")}
            </Stack>
            <div>
                <Button variant="secondary" onClick={() => setOpen(true)} aria-expanded={open}>
                    Open panel
                </Button>
            </div>
            {open && (
                <FocusTrap
                    as="section"
                    aria-labelledby={headingId}
                    loop={loop}
                    returnFocus={returnFocus}
                    clickOutsideDeactivates={clickOutside}
                    escapeDeactivates
                    onDeactivate={() => setOpen(false)}
                    style={panelStyle}
                >
                    <Stack gap="md">
                        <Text as="h3" id={headingId} variant="card-title">
                            Invite someone
                        </Text>
                        <Field label="Email">
                            <Input type="email" placeholder="cian@brightwater.ie" />
                        </Field>
                        <Stack direction="row" gap="sm" justify="end">
                            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                                Close
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => setOpen(false)}>
                                Send invite
                            </Button>
                        </Stack>
                    </Stack>
                </FocusTrap>
            )}
        </Stack>
    );
}
Options.layout = { align: "start" as const, minHeight: 360 };

/** The hook on an element of your own: useFocusTrap(ref, options) with initialFocus on the container, so a screen reader reads its name first. */
export function WithTheHook() {
    const [active, setActive] = useState(false);
    const panel = useRef<HTMLDivElement>(null);
    const headingId = useId();
    useFocusTrap(panel, {
        active,
        initialFocus: "container",
        escapeDeactivates: true,
        onDeactivate: () => setActive(false),
    });

    return (
        <Stack gap="md" style={{ width: 360, maxWidth: "100%" }}>
            <div>
                <Button variant="secondary" onClick={() => setActive(true)} aria-expanded={active}>
                    Review changes
                </Button>
            </div>
            {active && (
                <div ref={panel} role="region" tabIndex={-1} aria-labelledby={headingId} style={panelStyle}>
                    <Stack gap="md">
                        <Text as="h3" id={headingId} variant="card-title">
                            3 changes by Oisín
                        </Text>
                        <Text variant="caption" tone="muted">
                            Renamed the project, moved two files and updated the licence year.
                        </Text>
                        <Stack direction="row" gap="sm">
                            <Button variant="primary" size="sm" onClick={() => setActive(false)}>
                                Approve
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setActive(false)}>
                                Request changes
                            </Button>
                        </Stack>
                    </Stack>
                </div>
            )}
        </Stack>
    );
}
WithTheHook.layout = { align: "start" as const, minHeight: 280 };
