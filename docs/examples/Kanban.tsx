import { useState } from "react";

import { Avatar, Badge, Button, Kanban, Stack, Text, type KanbanColumn } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Kanban",
    category: "Data display",
    description:
        "A board of columns holding cards that people drag within a column or across to another, or move with the keyboard: tasks, a hiring pipeline, a content calendar.",
    source: "components/Kanban/Kanban.tsx",
    imports: ["Kanban"],
    props: ["KanbanProps", "KanbanColumn", "KanbanCardState", "KanbanMove", "KanbanLabels"],
    keyboard: [
        ["Tab", "Moves to the board's cards (one stop for all of them), then on to any buttons."],
        ["Up, Down, Home, End", "Move between the cards in a column."],
        ["Left or Right", "Move to the nearest card in the next column that has any. Mirrored in right-to-left text."],
        ["Space or Enter", "Picks the card up; again, drops it where it is."],
        ["Arrows while carrying", "Up and Down move it within the column; Left and Right move it to the next column it may go into."],
        ["Escape", "Puts it back where it was."],
    ],
    notes: [
        "Each column is a section named by its heading, with its cards in a list. Its count is read as \"3 of 5 cards\" when it has a limit.",
        "Each card is described by how to move it, and every step is read out in a polite live region: picked up, each new column and position, dropped or cancelled.",
        "A drag starts after the pointer moves a few pixels, so a click or a tap isn't one. A copy of the card follows the pointer, and a dashed slot shows where it lands. Near the board's edges, or a column's, a drag scrolls it.",
        "Buttons and links in a card keep their clicks; press anywhere else on the card to drag it.",
        "Cards catch touches to drag them, so a column full of cards scrolls by its edges rather than by a swipe over them.",
        "canMove skips the columns a card can't go into, by pointer and by keyboard. A limit only warns: the count turns amber once a column holds more.",
    ],
    related: ["SortableList", "Card", "Badge"],
    since: "0.17.0",
};

interface Task {
    id: string;
    title: string;
    tag?: string;
    owner?: string;
}

const board: Array<KanbanColumn<Task>> = [
    {
        id: "todo",
        title: "To do",
        cards: [
            { id: "t1", title: "Write the release notes", tag: "Docs", owner: "Ada Lovelace" },
            { id: "t2", title: "Add a dark map style", tag: "Design" },
            { id: "t3", title: "Rate-limit the export endpoint", tag: "API", owner: "Linus Torvalds" },
        ],
    },
    {
        id: "doing",
        title: "In progress",
        limit: 2,
        cards: [
            { id: "t4", title: "Fix the login redirect loop", tag: "Bug", owner: "Grace Hopper" },
            { id: "t5", title: "Move billing to the new plans", tag: "API", owner: "Alan Turing" },
        ],
    },
    { id: "review", title: "In review", cards: [{ id: "t6", title: "Onboarding checklist", tag: "Design", owner: "Barbara Liskov" }] },
    { id: "done", title: "Done", cards: [] },
];

const tagTone = { Bug: "danger", Docs: "neutral", Design: "active", API: "warning" } as const;

function TaskCard({ task }: { task: Task }) {
    return (
        <Stack gap="xs">
            <Text>{task.title}</Text>
            <Stack direction="row" align="center" justify="between">
                {task.tag ? <Badge variant={tagTone[task.tag as keyof typeof tagTone] ?? "neutral"}>{task.tag}</Badge> : <span />}
                {task.owner ? <Avatar name={task.owner} size="sm" /> : null}
            </Stack>
        </Stack>
    );
}

/** Drag a card to another column, or Tab to the board, press Space and use the arrow keys. In progress has a limit of 2. */
export function Board() {
    return <Kanban label="Sprint 14" defaultColumns={board} renderCard={(task) => <TaskCard task={task} />} />;
}
Board.layout = { fill: true, align: "start" as const, ground: "canvas" as const };

let added = 0;

/** Controlled, with an add button in each column's footer, and the last move shown below the board. */
export function Controlled() {
    const [columns, setColumns] = useState(board);
    const [last, setLast] = useState("Nothing moved yet.");
    return (
        <Stack gap="sm" style={{ width: "100%" }}>
            <Kanban
                label="Sprint 14, controlled"
                columns={columns}
                onChange={(next, move) => {
                    setColumns(next);
                    setLast(`Moved “${move.card.title}” from ${move.from.columnId} #${move.from.index + 1} to ${move.to.columnId} #${move.to.index + 1}.`);
                }}
                renderCard={(task) => <TaskCard task={task} />}
                columnFooter={(column) => (
                    <Button
                        size="sm"
                        variant="ghost"
                        style={{ width: "100%" }}
                        onClick={() =>
                            setColumns((current) =>
                                current.map((item) => (item.id === column.id ? { ...item, cards: [...item.cards, { id: `new-${++added}`, title: `New task ${added}` }] } : item)),
                            )
                        }
                    >
                        Add a card
                    </Button>
                )}
            />
            <Text variant="caption" tone="muted">
                {last}
            </Text>
        </Stack>
    );
}
Controlled.layout = { fill: true, align: "start" as const, ground: "canvas" as const };

interface Candidate {
    id: string;
    name: string;
    role: string;
}

const pipeline: Array<KanbanColumn<Candidate>> = [
    { id: "applied", title: "Applied", cards: [{ id: "c1", name: "Radia Perlman", role: "Network engineer" }, { id: "c2", name: "Tim Berners-Lee", role: "Web platform" }] },
    { id: "screen", title: "Phone screen", cards: [{ id: "c3", name: "Margaret Hamilton", role: "Flight software" }] },
    { id: "onsite", title: "Onsite", cards: [{ id: "c4", name: "Frances Allen", role: "Compilers" }] },
    { id: "offer", title: "Offer", cards: [] },
];
const stages = pipeline.map((column) => column.id);

/** canMove keeps candidates moving one stage at a time; a fixed height lets each column scroll. */
export function OneStageAtATime() {
    return (
        <Kanban
            label="Hiring pipeline"
            defaultColumns={pipeline}
            height={320}
            canMove={(_, from, to) => Math.abs(stages.indexOf(String(to)) - stages.indexOf(String(from))) <= 1}
            cardLabel={(candidate) => candidate.name}
            renderCard={(candidate) => (
                <Stack direction="row" gap="sm" align="center">
                    <Avatar name={candidate.name} size="md" />
                    <Stack gap="3xs">
                        <Text>{candidate.name}</Text>
                        <Text variant="caption" tone="muted">
                            {candidate.role}
                        </Text>
                    </Stack>
                </Stack>
            )}
        />
    );
}
OneStageAtATime.layout = { fill: true, align: "start" as const, ground: "canvas" as const };
