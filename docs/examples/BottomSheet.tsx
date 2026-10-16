import { useState } from "react";

import { Avatar, Badge, BottomSheet, Button, Stack, Switch, Text } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "BottomSheet",
    category: "Overlays",
    description:
        "A sheet that slides up from the bottom of the screen and rests at one or more heights, for filters, a share menu or a place's details on a phone. Drag it between its snap points or flick it down to close.",
    source: "components/BottomSheet/BottomSheet.tsx",
    imports: ["BottomSheet"],
    props: ["BottomSheetProps", "BottomSheetLabels"],
    keyboard: [
        ["Escape", "Closes it."],
        ["Up or Down", "On the handle, moves to the next snap point up or down; Home and End go to the lowest and highest."],
        ["Tab", "Moves between its controls; in a modal sheet, focus stays inside while it's open."],
    ],
    notes: [
        "For touch-first layouts: the handle and the header follow a finger or a pointer, and a flick past the lowest snap point closes it. For a side panel on a desktop, use Drawer.",
        "It's a modal dialog underneath, named by its title and described by its description, with the same focus trap and backdrop as Dialog. modal={false} shows it without a backdrop and leaves the page behind it usable.",
        "The handle is a button named \"Resize sheet\"; each move to another snap point is read out in a polite live region (\"Sheet height 2 of 2, 90% of the screen\").",
        "Scrolling in the body scrolls the content; only the handle and the header move the sheet.",
        "Snap points are given lowest first as pixels, percentages of the screen or \"content\" (as tall as what's in it, up to 90% of the screen). Moving between them slides the sheet; with reduced motion it jumps.",
    ],
    related: ["Drawer", "Dialog"],
    since: "0.18.0",
};

/** As tall as its content, with a footer. */
export function Basic() {
    const [open, setOpen] = useState(false);
    const [notify, setNotify] = useState(true);
    const [digest, setDigest] = useState(false);
    return (
        <>
            <Button variant="primary" onClick={() => setOpen(true)}>
                Notification settings
            </Button>
            <BottomSheet
                open={open}
                onClose={() => setOpen(false)}
                title="Notifications"
                description="How the Dublin office hears about deployments."
                footer={
                    <>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={() => setOpen(false)}>
                            Save
                        </Button>
                    </>
                }
            >
                <Stack gap="lg">
                    <Stack direction="row" justify="between" align="center" gap="md">
                        <Text id="bottom-sheet-deploys">Tell me when a deploy finishes</Text>
                        <Switch checked={notify} onChange={setNotify} aria-labelledby="bottom-sheet-deploys" />
                    </Stack>
                    <Stack direction="row" justify="between" align="center" gap="md">
                        <Text id="bottom-sheet-digest">A daily digest instead of one message each</Text>
                        <Switch checked={digest} onChange={setDigest} aria-labelledby="bottom-sheet-digest" />
                    </Stack>
                </Stack>
            </BottomSheet>
        </>
    );
}

const people = [
    { name: "Aoife Brennan", role: "Flight software", status: "Online" },
    { name: "Cian Murphy", role: "Web platform", status: "Away" },
    { name: "Niamh Byrne", role: "Compilers", status: "Online" },
    { name: "Saoirse Kelly", role: "Design", status: "Offline" },
    { name: "Oisín Walsh", role: "Infrastructure", status: "Online" },
    { name: "Eoin Doyle", role: "Support", status: "Away" },
    { name: "Clodagh Nolan", role: "Data", status: "Online" },
    { name: "Orla MacNamara", role: "Network", status: "Offline" },
    { name: "Fionn Gallagher", role: "Mobile", status: "Online" },
    { name: "Róisín Daly", role: "Security", status: "Away" },
    { name: "Darragh Quinn", role: "Documentation", status: "Online" },
    { name: "Gráinne Byrne", role: "Finance", status: "Offline" },
];

/** Two snap points: it opens at 40% of the screen and drags up to 90%, with a long list inside. */
export function SnapPoints() {
    const [open, setOpen] = useState(false);
    const [snap, setSnap] = useState(0);
    return (
        <>
            <Button onClick={() => setOpen(true)}>Who's on call</Button>
            <BottomSheet
                open={open}
                onClose={() => setOpen(false)}
                title="On call this week"
                description={`${people.length} people, ${snap === 0 ? "drag up for everyone" : "drag down for less"}`}
                snapPoints={["40%", "90%"]}
                snap={snap}
                onSnapChange={setSnap}
            >
                <Stack gap="md">
                    {people.map((person) => (
                        <Stack key={person.name} direction="row" gap="sm" align="center">
                            <Avatar name={person.name} size="md" />
                            <Stack gap="3xs" style={{ flex: 1 }}>
                                <Text>{person.name}</Text>
                                <Text variant="caption" tone="muted">
                                    {person.role}
                                </Text>
                            </Stack>
                            <Badge variant={person.status === "Online" ? "success" : person.status === "Away" ? "warning" : "neutral"}>
                                {person.status}
                            </Badge>
                        </Stack>
                    ))}
                </Stack>
            </BottomSheet>
        </>
    );
}

/** Without a backdrop: the page stays usable while the sheet is up, like a map's place details. */
export function NonModal() {
    const [open, setOpen] = useState(false);
    const [saved, setSaved] = useState(false);
    return (
        <Stack direction="row" gap="sm" align="center">
            <Button onClick={() => setOpen((current) => !current)}>{open ? "Hide details" : "Show details"}</Button>
            <Button variant="ghost" onClick={() => setSaved((current) => !current)}>
                {saved ? "Saved" : "Save place"}
            </Button>
            <BottomSheet
                open={open}
                onClose={() => setOpen(false)}
                modal={false}
                snapPoints={[120, "content"]}
                title="The Long Hall"
                description="51 South Great George's Street, Dublin 2"
            >
                <Stack gap="sm">
                    <Text>A Victorian pub with a long bar and a longer history. Open until half eleven on weeknights.</Text>
                    <Text variant="caption" tone="muted">
                        Buttons behind the sheet still work: try Save place.
                    </Text>
                </Stack>
            </BottomSheet>
        </Stack>
    );
}
