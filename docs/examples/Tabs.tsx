import { Badge, Tab, TabList, TabPanel, Tabs } from "@openwarelabs/ui";
import { FileText, GitBranch, MessageSquare } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Tabs",
    category: "Navigation",
    description:
        "Switches between views of the same thing. Each tab shows its own panel, and only one panel is visible at a time.",
    source: "components/Tabs/Tabs.tsx",
    imports: ["Tabs", "TabList", "Tab", "TabPanel"],
    props: ["TabsProps", "TabProps", "TabPanelProps"],
    keyboard: [
        ["Left or Right", "Moves to the previous or next tab and shows it."],
        ["Home or End", "Goes to the first or last tab."],
        ["Tab", "Moves from the tabs into the panel."],
    ],
    notes: [
        "Tabs and panels are paired by value, and wired up with aria-controls and aria-labelledby.",
        "Panels unmount when hidden. Pass keepMounted to a panel whose state should survive switching, such as a half-filled form.",
        "For choosing a value in a form rather than a view, use a SegmentedControl.",
    ],
    related: ["SegmentedControl", "NavList"],
};

/** The segmented style raises the chosen tab in a well. */
export function Segmented() {
    return (
        <Tabs defaultValue="chat" style={{ width: 420, maxWidth: "100%" }}>
            <TabList aria-label="Project">
                <Tab value="chat" icon={<MessageSquare size={15} />}>
                    Chat
                </Tab>
                <Tab value="spec" icon={<FileText size={15} />}>
                    Spec
                </Tab>
                <Tab value="history" icon={<GitBranch size={15} />}>
                    History
                </Tab>
            </TabList>
            <TabPanel value="chat">The conversation with the agents.</TabPanel>
            <TabPanel value="spec">What the team agreed to build.</TabPanel>
            <TabPanel value="history">Every checkpoint, newest first.</TabPanel>
        </Tabs>
    );
}
Segmented.layout = { align: "start" as const };

/** The line style underlines the chosen tab, for the top of a page. */
export function Line() {
    return (
        <Tabs defaultValue="overview" variant="line" style={{ width: 460, maxWidth: "100%" }}>
            <TabList aria-label="Settings">
                <Tab value="overview">Overview</Tab>
                <Tab value="runs">
                    Runs <Badge size="sm">12</Badge>
                </Tab>
                <Tab value="settings">Settings</Tab>
                <Tab value="billing" disabled>
                    Billing
                </Tab>
            </TabList>
            <TabPanel value="overview">Costs, recent runs and what's in progress.</TabPanel>
            <TabPanel value="runs">Twelve runs this week.</TabPanel>
            <TabPanel value="settings">Models, budgets and keys.</TabPanel>
        </Tabs>
    );
}
Line.layout = { align: "start" as const };
