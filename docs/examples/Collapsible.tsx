import { useState } from "react";

import { Button, Checkbox, Collapsible, CollapsibleContent, CollapsibleTrigger, Field, Select, Stack, Text } from "@openwarelabs/ui";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Collapsible",
    category: "Layout",
    description:
        "Shows and hides content under a trigger you bring yourself: \"Show more\" under a long text, a filter panel behind a button, the extra fields of a form.",
    source: "components/Collapsible/Collapsible.tsx",
    imports: ["Collapsible", "CollapsibleTrigger", "CollapsibleContent"],
    props: ["CollapsibleProps", "CollapsibleTriggerProps", "CollapsibleContentProps", "CollapsibleState"],
    keyboard: [["Enter or Space", "On the trigger, opens or closes the content."]],
    notes: [
        "The trigger gets aria-expanded and aria-controls pointing at the content. With asChild they go on your element, so a Button, a Link or your own component works; without it, a bare button is rendered for you to style.",
        "Closed content is inert, so nothing in it can be tabbed to or read out, and it leaves the DOM once the closing animation ends. forceMount keeps it there, hidden, when fields in it must keep their values.",
        "The height animates with a grid row from 0fr to 1fr, so the content needs no fixed height. It respects prefers-reduced-motion.",
        "It brings no heading, chevron or card. For a titled section that opens and closes, use Disclosure, which has them; for several in a row, Accordion.",
    ],
    related: ["Disclosure", "Accordion"],
    since: "0.18.0",
};

/** A long text cut short, with a ghost Button as the trigger. The render-prop form changes its label. */
export function ShowMore() {
    return (
        <div style={{ width: 480, maxWidth: "100%" }}>
            <Collapsible>
                {({ open }) => (
                    <>
                        <Text variant="body">
                            Aoife joined the team in March to lead the mobile rewrite. Before that she spent four years at a
                            payments company in Cork, where she took its checkout from a web view to native screens.
                        </Text>
                        <CollapsibleContent>
                            <Text variant="body" style={{ paddingTop: "var(--ow-space-sm)" }}>
                                She writes most of the team's RFCs, runs the Thursday design review and is the person to ask
                                about anything to do with accessibility on iOS. Outside work she rows with a club on the Lee
                                and is slowly restoring a 1970s bicycle.
                            </Text>
                        </CollapsibleContent>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                endIcon={
                                    <ChevronDown
                                        size={16}
                                        style={{
                                            transform: open ? "rotate(180deg)" : undefined,
                                            transition: "transform var(--ow-duration-slow) var(--ow-ease-emphasized)",
                                        }}
                                    />
                                }
                            >
                                {open ? "Show less" : "Show more"}
                            </Button>
                        </CollapsibleTrigger>
                    </>
                )}
            </Collapsible>
        </div>
    );
}
ShowMore.layout = { align: "start" as const };

/** A filter panel behind a Button with an icon. The content stays mounted (forceMount), so the fields keep their values while it's closed. */
export function Filters() {
    const [owner, setOwner] = useState("anyone");
    return (
        <div style={{ width: 480, maxWidth: "100%" }}>
            <Collapsible>
                <Stack direction="row" gap="sm" align="center" justify="between">
                    <Text variant="body" style={{ margin: 0 }}>
                        48 pull requests
                    </Text>
                    <CollapsibleTrigger asChild>
                        <Button size="sm" startIcon={<SlidersHorizontal size={16} />}>
                            Filters
                        </Button>
                    </CollapsibleTrigger>
                </Stack>
                <CollapsibleContent forceMount>
                    <Stack
                        gap="md"
                        style={{
                            marginTop: "var(--ow-space-md)",
                            padding: "var(--ow-space-lg)",
                            border: "1px solid var(--ow-border)",
                            borderRadius: "var(--ow-radius-container)",
                        }}
                    >
                        <Field label="Owner">
                            <Select
                                value={owner}
                                onChange={setOwner}
                                options={[
                                    { value: "anyone", label: "Anyone" },
                                    { value: "cian", label: "Cian Murphy" },
                                    { value: "niamh", label: "Niamh Byrne" },
                                    { value: "oisin", label: "Oisín Kelly" },
                                ]}
                            />
                        </Field>
                        <Checkbox defaultChecked>Only ones that need my review</Checkbox>
                        <Checkbox>Include drafts</Checkbox>
                    </Stack>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
Filters.layout = { align: "start" as const };

/** Controlled with `open` and `onOpenChange`: a trigger outside the content opens it and one inside closes it. */
export function Controlled() {
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState("editor");
    return (
        <div style={{ width: 480, maxWidth: "100%" }}>
            <Collapsible open={open} onOpenChange={setOpen}>
                <Stack direction="row" gap="sm" align="center" justify="between">
                    <div>
                        <Text variant="body" style={{ margin: 0 }}>
                            Saoirse Nolan
                        </Text>
                        <Text variant="caption" style={{ margin: 0 }}>
                            saoirse@example.ie · Editor
                        </Text>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button size="sm" variant="secondary">
                            {open ? "Cancel" : "Change role"}
                        </Button>
                    </CollapsibleTrigger>
                </Stack>
                <CollapsibleContent>
                    <Stack gap="md" style={{ marginTop: "var(--ow-space-md)" }}>
                        <Field label="Role" hint="Editors can change pages but not members.">
                            <Select
                                value={role}
                                onChange={setRole}
                                options={[
                                    { value: "viewer", label: "Viewer" },
                                    { value: "editor", label: "Editor" },
                                    { value: "admin", label: "Admin" },
                                ]}
                            />
                        </Field>
                        <div>
                            <CollapsibleTrigger asChild>
                                <Button size="sm" variant="primary">
                                    Save role
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </Stack>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
Controlled.layout = { align: "start" as const };
