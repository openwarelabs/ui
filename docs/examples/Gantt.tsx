import { useState } from "react";

import { Gantt, Stack, Text, type GanttGroup, type GanttTask } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Gantt",
    category: "Data display",
    description:
        "A timeline of tasks: a bar per task across the days it covers, under months and days, with groups, progress, the dependencies between them and a line at today. For a project plan, a roadmap, a release schedule.",
    source: "components/Gantt/Gantt.tsx",
    imports: ["Gantt"],
    props: [
        "GanttProps",
        "GanttTask",
        "GanttGroup",
        "GanttChange",
        "GanttTaskState",
        "GanttLabels",
    ],
    keyboard: [
        ["Tab", "Moves to the chart's bars (one stop for all of them)."],
        ["Up, Down, Home, End", "Move between the bars."],
        ["Enter", "Follows the bar's link, or calls onTaskClick."],
        ["Space", "With onChange, picks the bar up; again, drops it where it is."],
        [
            "Left or Right while carrying",
            "Shift the task a day earlier or later. Mirrored in right-to-left text.",
        ],
        ["Shift + Left or Right while carrying", "Move its end a day: shorter or longer."],
        ["Escape", "Puts it back where it was, or hides the tooltip."],
    ],
    notes: [
        'It\'s a grid named by label, with a row per task and two columns: the title, and a cell for the bar. Each bar is the one focusable thing in its row, named in full: "Beta programme, 3 Oct to 12 Oct, 40% done".',
        "With onChange, each bar is described by how to move it, and every step is read out in a polite live region: picked up, each new range, dropped or cancelled.",
        "The tooltip shows the hovered or focused bar's title and days, so a narrow bar still tells you what it is.",
        "A drag starts after the pointer moves a few pixels, so a click isn't one. Drag a bar's body to move it, its edges to resize it; the bars catch sideways touches, so the chart scrolls by its header and titles on a phone.",
        'Dates can be Date objects or "YYYY-MM-DD" strings; onChange gives back strings. A task\'s end day is included, and a milestone is one day.',
        "Groups come from the tasks' group ids in the order they first appear, or from groups when you want their titles and order; each group's tasks share a colour unless a task sets its own.",
        "The arrows and the today line are decoration: the dependencies are not read out, so list them in the task's own page or a tooltip where they matter.",
    ],
    related: ["Kanban", "Calendar", "Timeline"],
    since: "0.18.0",
};

const groups: GanttGroup[] = [
    { id: "design", title: "Design" },
    { id: "build", title: "Build" },
    { id: "launch", title: "Launch" },
];

const plan: GanttTask[] = [
    {
        id: "brief",
        title: "Product brief",
        start: "2026-10-05",
        end: "2026-10-08",
        progress: 1,
        group: "design",
    },
    {
        id: "research",
        title: "Customer interviews",
        start: "2026-10-07",
        end: "2026-10-14",
        progress: 1,
        group: "design",
    },
    {
        id: "ux",
        title: "Flows and wireframes",
        start: "2026-10-12",
        end: "2026-10-21",
        progress: 0.6,
        group: "design",
        dependsOn: ["brief"],
    },
    {
        id: "api",
        title: "Billing API",
        start: "2026-10-15",
        end: "2026-10-28",
        progress: 0.4,
        group: "build",
        dependsOn: ["brief"],
    },
    {
        id: "app",
        title: "Checkout screens",
        start: "2026-10-22",
        end: "2026-11-06",
        progress: 0.1,
        group: "build",
        dependsOn: ["ux", "api"],
    },
    {
        id: "qa",
        title: "Test pass",
        start: "2026-11-05",
        end: "2026-11-11",
        group: "build",
        dependsOn: ["app"],
    },
    {
        id: "beta",
        title: "Beta with 20 customers",
        start: "2026-11-09",
        end: "2026-11-20",
        group: "launch",
        dependsOn: ["qa"],
    },
    {
        id: "docs",
        title: "Help pages",
        start: "2026-11-12",
        end: "2026-11-19",
        group: "launch",
        dependsOn: ["app"],
    },
    {
        id: "ga",
        title: "General availability",
        start: "2026-11-24",
        end: "2026-11-24",
        milestone: true,
        group: "launch",
        dependsOn: ["beta", "docs"],
    },
];

/** A launch plan in three groups: progress fills each bar, arrows join dependent tasks, and a line marks today. */
export function Plan() {
    return <Gantt label="Checkout launch" tasks={plan} groups={groups} today="2026-10-19" />;
}
Plan.layout = { fill: true, align: "start" as const };

/** With onChange, drag a bar or its edges, or Tab to it, press Space and use the arrow keys. The last change shows below. */
export function Editable() {
    const [tasks, setTasks] = useState(plan.filter((task) => task.group !== "launch"));
    const [last, setLast] = useState("Nothing moved yet.");
    return (
        <Stack gap="sm" style={{ width: "100%" }}>
            <Gantt
                label="Checkout launch, editable"
                tasks={tasks}
                groups={groups.slice(0, 2)}
                today="2026-10-19"
                onChange={(task, change) => {
                    setTasks((current) =>
                        current.map((item) =>
                            item.id === task.id ? { ...item, ...change } : item,
                        ),
                    );
                    setLast(`${task.title}: ${change.start} to ${change.end}.`);
                }}
                onTaskClick={(task) => setLast(`Opened “${task.title}”.`)}
            />
            <Text variant="caption" tone="muted">
                {last}
            </Text>
        </Stack>
    );
}
Editable.layout = { fill: true, align: "start" as const };

const roadmap: GanttTask[] = [
    {
        id: "q1-sso",
        title: "Single sign-on",
        start: "2027-01-11",
        end: "2027-02-26",
        progress: 0.3,
        group: "Platform",
    },
    {
        id: "q1-audit",
        title: "Audit log",
        start: "2027-02-01",
        end: "2027-03-19",
        group: "Platform",
        dependsOn: ["q1-sso"],
    },
    {
        id: "q1-mobile",
        title: "Mobile app beta",
        start: "2027-01-18",
        end: "2027-03-31",
        progress: 0.15,
        group: "Apps",
    },
    {
        id: "q1-release",
        title: "Spring release",
        start: "2027-03-31",
        end: "2027-03-31",
        milestone: true,
        group: "Apps",
    },
    {
        id: "q2-reports",
        title: "Scheduled reports",
        start: "2027-04-05",
        end: "2027-05-14",
        group: "Apps",
        dependsOn: ["q1-release"],
    },
    {
        id: "q2-eu",
        title: "EU data region",
        start: "2027-04-12",
        end: "2027-06-25",
        group: "Platform",
        dependsOn: ["q1-audit"],
    },
    {
        id: "q2-summit",
        title: "Customer summit",
        start: "2027-06-15",
        end: "2027-06-15",
        milestone: true,
        group: "Apps",
    },
];

/** scale="month" for a half-year roadmap, with the groups taken from the tasks and milestones as diamonds. */
export function Roadmap() {
    return (
        <Gantt
            label="2027 roadmap"
            tasks={roadmap}
            scale="month"
            today="2027-02-10"
            labelWidth={160}
        />
    );
}
Roadmap.layout = { fill: true, align: "start" as const };
