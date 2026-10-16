import { useState } from "react";

import { Badge, Button, SortableList, Stack, Switch, Text } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "SortableList",
    category: "Data display",
    description:
        "A list people put in order by dragging, or with the keyboard: column order in settings, a playlist, priorities, a short queue.",
    source: "components/SortableList/SortableList.tsx",
    imports: ["SortableList"],
    props: ["SortableListProps", "SortableListItemState", "SortableListLabels"],
    keyboard: [
        ["Tab", "Moves to each item (or, with handle, each grip)."],
        ["Space or Enter", "Picks the item up; again, drops it where it is."],
        ["Up or Down", "Moves the picked-up item one place. Left and Right in a horizontal list, mirrored in right-to-left text."],
        ["Home or End", "Moves it to the start or the end."],
        ["Escape", "Puts it back where it was."],
    ],
    notes: [
        "It's an ordered list named by label. Each item (or grip) is described by how to move it, and every step is read out in a polite live region: picked up, each new position, dropped or cancelled.",
        "A drag starts after the pointer moves a few pixels, so a click or a tap isn't one. Mouse, touch and pen all work, and Escape cancels a drag too.",
        "Near the edge of a box that scrolls (or of the window), a drag scrolls it. The others slide aside as you go, without the motion when reduced motion is asked for.",
        "Whole rows catch touches, so a long list can't be scrolled by touch over them: use handle there, and whenever rows hold their own buttons, switches or links.",
        "Items are named in what's read out by their text, or by itemLabel. Pass labels to translate the words.",
        "It sorts within one list. To move cards between columns, use Kanban.",
    ],
    related: ["Kanban", "ListBox", "Table", "Splitter"],
    since: "0.15.0",
};

/** Drag a row, or Tab to it and press Space, then the arrow keys. It keeps the order itself here. */
export function Basic() {
    return (
        <SortableList
            label="Priorities"
            defaultItems={["Fix the login bug", "Write the release notes", "Review Ana's pull request", "Plan the offsite", "Answer support email"]}
            renderItem={(item, { index }) => (
                <Stack direction="row" gap="sm" align="center">
                    <Text variant="caption" tone="muted" style={{ width: 16 }}>
                        {index + 1}
                    </Text>
                    {item}
                </Stack>
            )}
            style={{ width: 360, maxWidth: "100%" }}
        />
    );
}
Basic.layout = { align: "start" as const };

interface Column {
    id: string;
    label: string;
    visible: boolean;
}

/** handle: rows with their own switch move only by the grip. Controlled, so the order and the switches live in one state. */
export function ColumnSettings() {
    const [columns, setColumns] = useState<Column[]>([
        { id: "name", label: "Name", visible: true },
        { id: "email", label: "Email", visible: true },
        { id: "role", label: "Role", visible: false },
        { id: "team", label: "Team", visible: true },
        { id: "last-seen", label: "Last seen", visible: false },
    ]);
    return (
        <Stack gap="sm" style={{ width: 360, maxWidth: "100%" }}>
            <Text variant="label" id="column-order">
                Columns
            </Text>
            <SortableList
                aria-labelledby="column-order"
                handle
                items={columns}
                onReorder={setColumns}
                renderItem={(column) => (
                    <Stack direction="row" justify="between" align="center">
                        {column.label}
                        <Switch
                            label={`Show ${column.label}`}
                            checked={column.visible}
                            onChange={(visible) => setColumns((all) => all.map((each) => (each.id === column.id ? { ...each, visible } : each)))}
                        />
                    </Stack>
                )}
            />
        </Stack>
    );
}
ColumnSettings.layout = { align: "start" as const };

/** orientation="horizontal": a row that scrolls sideways. The arrow keys follow the text direction. */
export function Horizontal() {
    return (
        <SortableList
            label="Tab order"
            orientation="horizontal"
            handle
            defaultItems={["Overview", "Activity", "Settings", "Billing", "Members"]}
            renderItem={(item) => item}
            style={{ maxWidth: "100%" }}
        />
    );
}
Horizontal.layout = { align: "start" as const };

const songs = [
    ["Blue in Green", "5:37"],
    ["So What", "9:22"],
    ["Naima", "4:21"],
    ["Take Five", "5:24"],
    ["Round Midnight", "5:56"],
    ["Footprints", "7:29"],
    ["Autumn Leaves", "10:58"],
    ["Moanin'", "9:30"],
    ["Cantaloupe Island", "5:32"],
    ["Song for My Father", "7:17"],
    ["Maiden Voyage", "7:53"],
    ["Peace Piece", "6:42"],
].map(([title, length]) => ({ id: title!, title: title!, length: length! }));

/** In a box that scrolls: drag near its top or bottom edge and it scrolls. onReorder says what moved. */
export function Playlist() {
    const [last, setLast] = useState("Nothing moved yet.");
    return (
        <Stack gap="sm" style={{ width: 360, maxWidth: "100%" }}>
            <div style={{ maxHeight: 260, overflowY: "auto", padding: 4 }}>
                <SortableList
                    label="Up next"
                    defaultItems={songs}
                    itemLabel={(song) => song.title}
                    onReorder={(items, { from, to }) => setLast(`${items[to]!.title}: ${from + 1} → ${to + 1}`)}
                    renderItem={(song, { isDragging }) => (
                        <Stack direction="row" justify="between" align="center">
                            {song.title}
                            {isDragging ? <Badge variant="active">Moving</Badge> : <Text variant="caption" tone="muted">{song.length}</Text>}
                        </Stack>
                    )}
                />
            </div>
            <Text variant="caption" tone="muted">
                {last}
            </Text>
        </Stack>
    );
}
Playlist.layout = { align: "start" as const };

/** labels translates what's read out; disabled keeps the order still. */
export function LabelsAndDisabled() {
    const [disabled, setDisabled] = useState(false);
    return (
        <Stack gap="md" align="start" style={{ width: 360, maxWidth: "100%" }}>
            <SortableList
                label="Prioridades"
                disabled={disabled}
                handle
                defaultItems={["Correo", "Calendario", "Tareas"]}
                renderItem={(item) => item}
                labels={{
                    pickedUp: (item, position, total) => `${item} levantado. Posición ${position} de ${total}.`,
                    moved: (item, position, total) => `${item}, posición ${position} de ${total}.`,
                    dropped: (item, position, total) => `${item} soltado en la posición ${position} de ${total}.`,
                    cancelled: (item, position, total) => `Cancelado. ${item} vuelve a la posición ${position} de ${total}.`,
                    instructions: "Pulsa Espacio para levantar, las flechas para mover, Espacio para soltar y Escape para cancelar.",
                    handle: "Reordenar",
                }}
                style={{ width: "100%" }}
            />
            <Button variant="secondary" size="sm" onClick={() => setDisabled((value) => !value)}>
                {disabled ? "Enable" : "Disable"}
            </Button>
        </Stack>
    );
}
LabelsAndDisabled.layout = { align: "start" as const };
