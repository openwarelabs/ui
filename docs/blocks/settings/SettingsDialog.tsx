import { useEffect, useId, useRef, useState } from "react";

import {
    Badge,
    Button,
    CloseButton,
    Dialog,
    Input,
    NavItem,
    NavList,
    NumberField,
    SegmentedControl,
    Select,
    SettingsRow,
    Switch,
    Text,
    toast,
} from "@openwarelabs/ui";
import { Bell, Bot, FolderKanban, Gauge, Inbox, Monitor, Moon, Palette, Rocket, Settings, SlidersHorizontal, Sun, UserRound } from "lucide-react";

import "./SettingsDialog.css";

const sections = [
    { id: "general", label: "General", icon: SlidersHorizontal, description: "How Acme opens and behaves day to day." },
    { id: "appearance", label: "Appearance", icon: Palette, description: "How Acme looks on this computer." },
    { id: "notifications", label: "Notifications", icon: Bell, description: "What reaches you, and how." },
    { id: "agents", label: "Agents", icon: Bot, description: "How agents work when you start a run." },
    { id: "account", label: "Account", icon: UserRound, description: "Your sign-in and the devices you use." },
] as const;

type SectionId = (typeof sections)[number]["id"];

interface Preferences {
    startPage: string;
    language: string;
    openInApp: boolean;
    confirmDeploys: boolean;
    theme: string;
    density: string;
    projectColours: boolean;
    deploys: string;
    reviews: boolean;
    agentsNeedMe: boolean;
    digest: string;
    sounds: boolean;
    askBeforeCommands: string;
    autoPullRequests: boolean;
    parallelRuns: number | null;
    branchPrefix: string;
}

const defaults: Preferences = {
    startPage: "overview",
    language: "en-GB",
    openInApp: true,
    confirmDeploys: true,
    theme: "system",
    density: "comfortable",
    projectColours: true,
    deploys: "failed",
    reviews: true,
    agentsNeedMe: true,
    digest: "daily",
    sounds: false,
    askBeforeCommands: "changes",
    autoPullRequests: true,
    parallelRuns: 3,
    branchPrefix: "agent/",
};

const projects = [
    { name: "marketing-site", detail: "Pricing page copy · Maya Chen", when: "4 min ago", status: "Live" },
    { name: "billing-api", detail: "Fix invoice dates in the EU · agent", when: "26 min ago", status: "Building" },
    { name: "mobile-app", detail: "Release 2.4 · Clara Novak", when: "2 h ago", status: "Live" },
    { name: "docs", detail: "New API reference · Jonas Berg", when: "Yesterday", status: "Live" },
    { name: "design-system", detail: "Tokens for dark mode · agent", when: "2 days ago", status: "Failed" },
] as const;

const statusTone = { Live: "success", Building: "active", Failed: "danger" } as const;

/** The rows of one section. Each control saves as soon as it changes. */
function SectionRows({
    section,
    prefs,
    set,
}: {
    section: SectionId;
    prefs: Preferences;
    set: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
}) {
    switch (section) {
        case "general":
            return (
                <>
                    <SettingsRow label="Start page" description="What opens when you come back to Acme.">
                        <Select
                            aria-label="Start page"
                            size="sm"
                            className="settings-dialog__select"
                            value={prefs.startPage}
                            onChange={(value) => set("startPage", value)}
                            options={[
                                { value: "overview", label: "Overview" },
                                { value: "projects", label: "Projects" },
                                { value: "inbox", label: "Inbox" },
                                { value: "last", label: "Where I left off" },
                            ]}
                        />
                    </SettingsRow>
                    <SettingsRow label="Language" description="Dates and numbers follow it too.">
                        <Select
                            aria-label="Language"
                            size="sm"
                            className="settings-dialog__select"
                            value={prefs.language}
                            onChange={(value) => set("language", value)}
                            options={[
                                { value: "en-GB", label: "English (UK)" },
                                { value: "en-US", label: "English (US)" },
                                { value: "de", label: "Deutsch" },
                                { value: "es", label: "Español" },
                                { value: "fr", label: "Français" },
                                { value: "ja", label: "日本語" },
                            ]}
                        />
                    </SettingsRow>
                    <SettingsRow label="Open links in the desktop app" description="Links to Acme from email and chat open in the app when it's installed.">
                        <Switch label="Open links in the desktop app" checked={prefs.openInApp} onChange={(value) => set("openInApp", value)} />
                    </SettingsRow>
                    <SettingsRow label="Confirm production deploys" description="One last check before a deploy goes live.">
                        <Switch label="Confirm production deploys" checked={prefs.confirmDeploys} onChange={(value) => set("confirmDeploys", value)} />
                    </SettingsRow>
                </>
            );
        case "appearance":
            return (
                <>
                    <SettingsRow label="Theme" description="System follows your computer's setting.">
                        <SegmentedControl
                            aria-label="Theme"
                            size="sm"
                            value={prefs.theme}
                            onChange={(value) => set("theme", value)}
                            options={[
                                { value: "light", label: "Light", icon: <Sun size={14} /> },
                                { value: "dark", label: "Dark", icon: <Moon size={14} /> },
                                { value: "system", label: "System", icon: <Monitor size={14} /> },
                            ]}
                        />
                    </SettingsRow>
                    <SettingsRow label="Density" description="Compact fits more rows into lists and tables.">
                        <SegmentedControl
                            aria-label="Density"
                            size="sm"
                            value={prefs.density}
                            onChange={(value) => set("density", value)}
                            options={[
                                { value: "comfortable", label: "Comfortable" },
                                { value: "compact", label: "Compact" },
                            ]}
                        />
                    </SettingsRow>
                    <SettingsRow label="Project colours" description="A coloured dot beside each project in the sidebar.">
                        <Switch label="Project colours" checked={prefs.projectColours} onChange={(value) => set("projectColours", value)} />
                    </SettingsRow>
                </>
            );
        case "notifications":
            return (
                <>
                    <SettingsRow label="Deploys" description="Which deploys tell you when they finish.">
                        <Select
                            aria-label="Deploys"
                            size="sm"
                            className="settings-dialog__select"
                            value={prefs.deploys}
                            onChange={(value) => set("deploys", value)}
                            options={[
                                { value: "all", label: "Every deploy" },
                                { value: "mine", label: "Mine" },
                                { value: "failed", label: "Failed ones only" },
                                { value: "off", label: "None" },
                            ]}
                        />
                    </SettingsRow>
                    <SettingsRow label="Review requests" description="When someone asks you to review a change.">
                        <Switch label="Review requests" checked={prefs.reviews} onChange={(value) => set("reviews", value)} />
                    </SettingsRow>
                    <SettingsRow label="Agents waiting for you" description="When a run is stuck, or needs your approval to go on.">
                        <Switch label="Agents waiting for you" checked={prefs.agentsNeedMe} onChange={(value) => set("agentsNeedMe", value)} />
                    </SettingsRow>
                    <SettingsRow label="Email digest" description="A summary of what shipped and what's waiting.">
                        <Select
                            aria-label="Email digest"
                            size="sm"
                            className="settings-dialog__select"
                            value={prefs.digest}
                            onChange={(value) => set("digest", value)}
                            options={[
                                { value: "daily", label: "Daily at 9:00" },
                                { value: "weekly", label: "Mondays at 9:00" },
                                { value: "off", label: "Off" },
                            ]}
                        />
                    </SettingsRow>
                    <SettingsRow label="Sounds" description="A chime when a run finishes.">
                        <Switch label="Sounds" checked={prefs.sounds} onChange={(value) => set("sounds", value)} />
                    </SettingsRow>
                </>
            );
        case "agents":
            return (
                <>
                    <SettingsRow label="Ask before running commands" description="Agents pause and wait for you before these.">
                        <Select
                            aria-label="Ask before running commands"
                            size="sm"
                            className="settings-dialog__select"
                            value={prefs.askBeforeCommands}
                            onChange={(value) => set("askBeforeCommands", value)}
                            options={[
                                { value: "all", label: "Every command" },
                                { value: "changes", label: "Ones that change things" },
                                { value: "never", label: "Never" },
                            ]}
                        />
                    </SettingsRow>
                    <SettingsRow label="Open pull requests" description="When a run finishes and its checks pass, open a pull request for review.">
                        <Switch label="Open pull requests" checked={prefs.autoPullRequests} onChange={(value) => set("autoPullRequests", value)} />
                    </SettingsRow>
                    <SettingsRow label="Runs at once" description="More runs finish sooner, and use more of your plan.">
                        <NumberField
                            aria-label="Runs at once"
                            size="sm"
                            min={1}
                            max={10}
                            value={prefs.parallelRuns}
                            onChange={(value) => set("parallelRuns", value)}
                        />
                    </SettingsRow>
                    <SettingsRow
                        label="Branch prefix"
                        description={`Agents name their branches with it, like ${prefs.branchPrefix || "agent/"}fix-invoice-dates.`}
                    >
                        <Input
                            aria-label="Branch prefix"
                            size="sm"
                            className="settings-dialog__input"
                            value={prefs.branchPrefix}
                            onChange={(event) => set("branchPrefix", event.target.value)}
                            spellCheck={false}
                        />
                    </SettingsRow>
                </>
            );
        case "account":
            return (
                <>
                    <SettingsRow label="Email" description="maya@example.com">
                        <Button
                            size="sm"
                            onClick={() => toast("Check your inbox", { description: "We sent a link to maya@example.com to confirm the change." })}
                        >
                            Change email
                        </Button>
                    </SettingsRow>
                    <SettingsRow label="Password" description="Last changed in March.">
                        <Button
                            size="sm"
                            onClick={() => toast("Check your inbox", { description: "We sent a link to maya@example.com to set a new password." })}
                        >
                            Change password
                        </Button>
                    </SettingsRow>
                    <SettingsRow
                        label={
                            <span className="settings-dialog__label-badge">
                                Two-factor authentication
                                <Badge size="sm" variant="success">
                                    On
                                </Badge>
                            </span>
                        }
                        description="Codes from an authenticator app. 8 backup codes left."
                    >
                        <Button
                            size="sm"
                            onClick={() => toast("Your backup codes were downloaded", { description: "Keep them somewhere other than this computer." })}
                        >
                            Download backup codes
                        </Button>
                    </SettingsRow>
                    <SettingsRow label="Sign out everywhere" description="Every computer and phone except this one. You'll stay signed in here.">
                        <Button size="sm" onClick={() => toast.success("Signed out of 3 other devices")}>
                            Sign out others
                        </Button>
                    </SettingsRow>
                </>
            );
    }
}

/** A quiet bit of the app behind the dialog: the sidebar and the projects page. */
function AppBehind({ onOpenSettings }: { onOpenSettings: () => void }) {
    return (
        <>
            <aside className="settings-dialog__aside" aria-label="Main navigation">
                <Text variant="card-title" as="span" className="settings-dialog__brand">
                    <span className="settings-dialog__mark" aria-hidden="true" />
                    Acme
                </Text>
                <NavList label="Workspace">
                    <NavItem icon={<Gauge size={15} />}>Overview</NavItem>
                    <NavItem icon={<FolderKanban size={15} />} active end={12}>
                        Projects
                    </NavItem>
                    <NavItem icon={<Rocket size={15} />}>Deploys</NavItem>
                    <NavItem icon={<Bot size={15} />} end={3}>
                        Agents
                    </NavItem>
                    <NavItem icon={<Inbox size={15} />} end={5}>
                        Inbox
                    </NavItem>
                </NavList>
                <NavList label="Account" className="settings-dialog__aside-end">
                    <NavItem icon={<Settings size={15} />} onClick={onOpenSettings}>
                        Settings
                    </NavItem>
                </NavList>
            </aside>
            <main className="settings-dialog__page">
                <div className="settings-dialog__page-header">
                    <div>
                        <Text variant="heading" as="h1">
                            Projects
                        </Text>
                        <Text variant="copy" className="settings-dialog__page-text">
                            12 projects, 3 deploying today.
                        </Text>
                    </div>
                    <Button startIcon={<Settings size={16} />} shortcut="⌘," onClick={onOpenSettings}>
                        Settings
                    </Button>
                </div>
                <ul className="settings-dialog__projects">
                    {projects.map((project) => (
                        <li key={project.name} className="settings-dialog__project">
                            <span className="settings-dialog__project-text">
                                <Text variant="label">{project.name}</Text>
                                <Text variant="caption" truncate className="settings-dialog__project-detail">
                                    {project.detail} · {project.when}
                                </Text>
                            </span>
                            <Badge size="sm" variant={statusTone[project.status]}>
                                {project.status}
                            </Badge>
                        </li>
                    ))}
                </ul>
            </main>
        </>
    );
}

export function SettingsDialog() {
    const headingId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(true);
    const [section, setSection] = useState<SectionId>("general");
    const [prefs, setPrefs] = useState<Preferences>(defaults);

    // On opening, start on the current section in whichever list is showing, rather than the first thing that takes focus.
    useEffect(() => {
        if (!open) return undefined;
        const frame = requestAnimationFrame(() => {
            const items = rootRef.current?.querySelectorAll<HTMLElement>(".settings-dialog__nav [aria-current='page']") ?? [];
            [...items].find((item) => item.offsetParent !== null)?.focus({ preventScroll: true });
        });
        return () => cancelAnimationFrame(frame);
    }, [open]);

    // ⌘, or Ctrl+, opens settings, as in most desktop apps.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "," && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setOpen(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const set = <K extends keyof Preferences>(key: K, value: Preferences[K]) => setPrefs((current) => ({ ...current, [key]: value }));
    const current = sections.find((entry) => entry.id === section)!;

    const navItems = sections.map(({ id, label, icon: Icon }) => (
        <NavItem key={id} icon={<Icon size={15} />} active={section === id} onClick={() => setSection(id)}>
            {label}
        </NavItem>
    ));

    return (
        <div ref={rootRef} className="settings-dialog">
            <AppBehind onOpenSettings={() => setOpen(true)} />

            <Dialog open={open} onClose={() => setOpen(false)} title="Settings" width={880} className="settings-dialog__dialog">
                {/* Down the left on wider screens; a sideways strip on phones. */}
                <NavList label="Settings sections" className="settings-dialog__nav settings-dialog__nav--side">
                    {navItems}
                </NavList>
                <NavList label="Settings sections" orientation="horizontal" className="settings-dialog__nav settings-dialog__nav--top">
                    {navItems}
                </NavList>
                <Text variant="caption" as="p" className="settings-dialog__saved">
                    Changes save as you go.
                </Text>

                <CloseButton label="Close settings" className="settings-dialog__close" onClick={() => setOpen(false)} />
                <div className="settings-dialog__panel">
                    <section aria-labelledby={headingId} className="settings-dialog__section">
                        <Text variant="dialog-title" as="h3" id={headingId} className="settings-dialog__section-title">
                            {current.label}
                        </Text>
                        <Text variant="copy" className="settings-dialog__section-text">
                            {current.description}
                        </Text>
                        <div className="settings-dialog__rows">
                            <SectionRows section={section} prefs={prefs} set={set} />
                        </div>
                    </section>
                </div>
            </Dialog>
        </div>
    );
}
