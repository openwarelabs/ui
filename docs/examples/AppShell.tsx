import { useState, type CSSProperties, type ReactNode } from "react";

import {
    AppShell,
    Avatar,
    Button,
    NavItem,
    NavList,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarToggle,
    Stack,
    Text,
    useAppShell,
} from "@openwarelabs/ui";
import {
    BarChart3,
    FolderKanban,
    Inbox,
    LayoutDashboard,
    LifeBuoy,
    Search,
    Settings,
    Users,
} from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "AppShell",
    category: "Navigation",
    description:
        "An app's frame: a sidebar down the left and the page beside it. On narrow screens the sidebar folds into a drawer behind a bar at the top, and it can fold to its icons on wide ones.",
    source: "components/AppShell/AppShell.tsx",
    imports: [
        "AppShell",
        "SidebarHeader",
        "SidebarContent",
        "SidebarFooter",
        "SidebarToggle",
        "NavList",
        "NavItem",
    ],
    props: ["AppShellProps", "SidebarToggleProps"],
    keyboard: [
        ["Tab", "Moves through the sidebar, then the page."],
        ["Escape", "Closes the drawer on narrow screens."],
    ],
    notes: [
        "The sidebar is an aside named Main navigation, and the page goes in the main landmark, so there's one of each per page.",
        'It folds into the drawer when it\'s narrower than its breakpoint: 900px by default, 560px or 1200px with breakpoint="sm" or "lg". That\'s its own width, not the window\'s, so it works inside a frame too. The examples here use sm to fit the page.',
        "Choosing a NavItem in the drawer closes it. Give anything else that should close it data-closes-navigation.",
        "Folded, a NavItem shows only its icon; its label is still read out and shows as a tooltip on hover and focus. Give every NavItem an icon in a collapsible shell.",
        "For your own parts of the sidebar that should change when it's folded, read useAppShell().collapsed. Keep collapsed in your own state, or save it, with collapsed and onCollapsedChange.",
        "It's as tall as the window. Set --ow-app-shell-height to give it another height.",
    ],
    related: ["NavList", "Drawer", "Container"],
    since: "0.12.0",
};

/** The examples sit in a box, not a window: give them a height. */
const frame = { "--ow-app-shell-height": "560px" } as CSSProperties;

function Logo() {
    return (
        <span
            aria-hidden="true"
            style={{
                display: "inline-grid",
                width: 24,
                height: 24,
                flexShrink: 0,
                placeItems: "center",
                borderRadius: 7,
                background: "var(--ow-primary)",
                color: "var(--ow-on-primary)",
                fontSize: 12,
                fontWeight: 600,
            }}
        >
            A
        </span>
    );
}

/** The workspace's name, or just its logo when the sidebar is folded. */
function Workspace() {
    const collapsed = useAppShell()?.collapsed;
    return (
        <Stack
            direction="row"
            gap="sm"
            align="center"
            justify={collapsed ? "center" : "start"}
            style={{ minHeight: 32, paddingInline: collapsed ? 0 : 8 }}
        >
            <Logo />
            {collapsed ? null : (
                <Text as="span" variant="card-title">
                    Acme
                </Text>
            )}
        </Stack>
    );
}

function Account() {
    const collapsed = useAppShell()?.collapsed;
    return (
        <Stack
            direction="row"
            gap="sm"
            align="center"
            justify={collapsed ? "center" : "start"}
            style={{ paddingInline: collapsed ? 0 : 4 }}
        >
            <Avatar name="Ada Lovelace" size="sm" />
            {collapsed ? null : (
                <span style={{ display: "grid", minWidth: 0 }}>
                    <Text as="span" variant="label" truncate>
                        Ada Lovelace
                    </Text>
                    <Text variant="caption" truncate>
                        ada@acme.dev
                    </Text>
                </span>
            )}
        </Stack>
    );
}

const places = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={15} /> },
    { id: "inbox", label: "Inbox", icon: <Inbox size={15} />, count: 4 },
    { id: "projects", label: "Projects", icon: <FolderKanban size={15} /> },
    { id: "reports", label: "Reports", icon: <BarChart3 size={15} /> },
];
const team = [
    { id: "people", label: "People", icon: <Users size={15} /> },
    { id: "settings", label: "Settings", icon: <Settings size={15} /> },
];

function Sidebar({
    current,
    onNavigate,
    toggle = false,
}: {
    current: string;
    onNavigate(id: string): void;
    toggle?: boolean;
}) {
    const item = (place: { id: string; label: string; icon: ReactNode; count?: number }) => (
        <NavItem
            key={place.id}
            icon={place.icon}
            active={current === place.id}
            end={place.count}
            onClick={() => onNavigate(place.id)}
        >
            {place.label}
        </NavItem>
    );
    return (
        <>
            <SidebarHeader>
                <Workspace />
            </SidebarHeader>
            <SidebarContent>
                <NavList label="Workspace">{places.map(item)}</NavList>
                <NavList label="Team" heading="Team">
                    {team.map(item)}
                </NavList>
            </SidebarContent>
            <SidebarFooter>
                <NavList label="Help">
                    <NavItem icon={<LifeBuoy size={15} />}>Help and support</NavItem>
                </NavList>
                <Account />
                {toggle ? <SidebarToggle /> : null}
            </SidebarFooter>
        </>
    );
}

function Page({ current }: { current: string }) {
    const place = [...places, ...team].find((entry) => entry.id === current)!;
    return (
        <Stack gap="md" style={{ padding: "28px 32px" }}>
            <Text as="h1" variant="section-title">
                {place.label}
            </Text>
            <Text variant="copy" tone="muted">
                The page goes here, on its own panel beside the sidebar.
            </Text>
        </Stack>
    );
}

function Topbar() {
    return (
        <>
            <Logo />
            <Text as="span" variant="card-title">
                Acme
            </Text>
        </>
    );
}

/** The page on a raised panel beside the sidebar. The button at the bottom folds the sidebar to its icons. */
export function Inset() {
    const [current, setCurrent] = useState("overview");
    return (
        <AppShell
            style={frame}
            breakpoint="sm"
            collapsible
            sidebar={<Sidebar current={current} onNavigate={setCurrent} toggle />}
            topbar={<Topbar />}
            topbarActions={
                <Button variant="ghost" iconOnly aria-label="Search">
                    <Search size={18} />
                </Button>
            }
        >
            <Page current={current} />
        </AppShell>
    );
}
Inset.layout = { fill: true, ground: "canvas", align: "start" };

/** The page straight on the surface, with a line between it and the sidebar. */
export function Flat() {
    const [current, setCurrent] = useState("inbox");
    return (
        <AppShell
            variant="flat"
            style={frame}
            breakpoint="sm"
            sidebar={<Sidebar current={current} onNavigate={setCurrent} />}
            topbar={<Topbar />}
        >
            <Page current={current} />
        </AppShell>
    );
}
Flat.layout = { fill: true, ground: "canvas", align: "start" };

/** Folded to its icons from the start; hover or focus an icon for its label. */
export function Collapsed() {
    const [current, setCurrent] = useState("projects");
    const [collapsed, setCollapsed] = useState(true);
    return (
        <AppShell
            style={frame}
            breakpoint="sm"
            collapsible
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            sidebar={<Sidebar current={current} onNavigate={setCurrent} toggle />}
            topbar={<Topbar />}
        >
            <Page current={current} />
        </AppShell>
    );
}
Collapsed.layout = { fill: true, ground: "canvas", align: "start" };

/** In a narrow frame, as on a phone: the sidebar is behind the menu button, in a drawer. */
export function Narrow() {
    const [current, setCurrent] = useState("overview");
    return (
        <div
            style={{
                width: "100%",
                maxWidth: 390,
                marginInline: "auto",
                border: "1px solid var(--ow-border)",
                borderRadius: 16,
                overflow: "hidden",
            }}
        >
            <AppShell
                style={{ "--ow-app-shell-height": "520px" } as CSSProperties}
                sidebar={<Sidebar current={current} onNavigate={setCurrent} />}
                topbar={<Topbar />}
            >
                <Page current={current} />
            </AppShell>
        </div>
    );
}
Narrow.layout = { fill: true, ground: "surface" };
