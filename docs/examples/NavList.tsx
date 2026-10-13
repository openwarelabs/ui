import { useState } from "react";

import { Badge, NavItem, NavList } from "@openwarelabs/ui";
import { Bell, Bot, KeyRound, Palette, User } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "NavList",
    category: "Navigation",
    description:
        "A list of sections for a sidebar, like the left of a settings dialog. The current one is raised.",
    source: "components/NavList/NavList.tsx",
    imports: ["NavList", "NavItem"],
    props: ["NavListProps", "NavItemProps"],
    notes: [
        'The active item has aria-current="page".',
        "Pass href to make items links; otherwise they're buttons.",
        'On narrow screens, switch to orientation="horizontal" and it scrolls sideways.',
    ],
    related: ["Tabs", "Breadcrumbs", "SettingsRow"],
};

const sections = [
    { id: "account", label: "Account", icon: <User size={15} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={15} /> },
    { id: "agents", label: "Agents", icon: <Bot size={15} />, end: <Badge size="sm">13</Badge> },
    { id: "keys", label: "API keys", icon: <KeyRound size={15} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={15} /> },
];

/** A sidebar with a heading and counts. */
export function Sidebar() {
    const [active, setActive] = useState("appearance");
    return (
        <div style={{ width: 220, maxWidth: "100%" }}>
            <NavList label="Settings" heading="Settings">
                {sections.map((section) => (
                    <NavItem
                        key={section.id}
                        icon={section.icon}
                        end={section.end}
                        active={active === section.id}
                        onClick={() => setActive(section.id)}
                    >
                        {section.label}
                    </NavItem>
                ))}
            </NavList>
        </div>
    );
}
Sidebar.layout = { align: "start" as const };

/** Horizontal, for the top of a page on a phone. */
export function Horizontal() {
    const [active, setActive] = useState("account");
    return (
        <div style={{ width: 340, maxWidth: "100%" }}>
            <NavList label="Settings" orientation="horizontal">
                {sections.map((section) => (
                    <NavItem
                        key={section.id}
                        icon={section.icon}
                        active={active === section.id}
                        onClick={() => setActive(section.id)}
                    >
                        {section.label}
                    </NavItem>
                ))}
            </NavList>
        </div>
    );
}
