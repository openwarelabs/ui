import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { Badge, Button, Card, Input, NavItem, NavList, NumberField, SegmentedControl, Select, SettingsRow, Switch, toast } from "@openwarelabs/ui";
import { Bell, Bot, Check, Monitor, Moon, Palette, SlidersHorizontal, Sun, UserRound } from "lucide-react";

import "./SettingsPage.css";

const sections = [
    { id: "general", label: "General", icon: SlidersHorizontal, description: "How Acme opens and behaves day to day." },
    { id: "appearance", label: "Appearance", icon: Palette, description: "How Acme looks on this device." },
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
    sounds: boolean;
    digest: string;
    productNews: boolean;
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
    sounds: false,
    digest: "daily",
    productNews: false,
    askBeforeCommands: "changes",
    autoPullRequests: true,
    parallelRuns: 3,
    branchPrefix: "agent/",
};

type Update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;

/** A titled card of rows within a section. */
function Group({ title, children }: { title?: string; children: ReactNode }) {
    return (
        <div className="settings-page__group">
            {title ? <h3 className="settings-page__group-title">{title}</h3> : null}
            <Card padding="none" className="settings-page__card">
                {children}
            </Card>
        </div>
    );
}

function SectionContent({ section, prefs, set }: { section: SectionId; prefs: Preferences; set: Update }) {
    switch (section) {
        case "general":
            return (
                <>
                    <Group title="Starting up">
                        <SettingsRow label="Start page" description="What opens when you come back to Acme.">
                            <Select
                                aria-label="Start page"
                                size="sm"
                                className="settings-page__select"
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
                                className="settings-page__select"
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
                    </Group>
                    <Group title="Links and deploys">
                        <SettingsRow label="Open links in the desktop app" description="Links to Acme from email and chat open in the app when it's installed.">
                            <Switch label="Open links in the desktop app" checked={prefs.openInApp} onChange={(value) => set("openInApp", value)} />
                        </SettingsRow>
                        <SettingsRow label="Confirm production deploys" description="One last check before a deploy goes live.">
                            <Switch label="Confirm production deploys" checked={prefs.confirmDeploys} onChange={(value) => set("confirmDeploys", value)} />
                        </SettingsRow>
                    </Group>
                </>
            );
        case "appearance":
            return (
                <Group>
                    <SettingsRow label="Theme" description="System follows your device's setting.">
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
                </Group>
            );
        case "notifications":
            return (
                <>
                    <Group title="In Acme and on your phone">
                        <SettingsRow label="Deploys" description="Which deploys tell you when they finish.">
                            <Select
                                aria-label="Deploys"
                                size="sm"
                                className="settings-page__select"
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
                        <SettingsRow label="Sounds" description="A chime when a run finishes.">
                            <Switch label="Sounds" checked={prefs.sounds} onChange={(value) => set("sounds", value)} />
                        </SettingsRow>
                    </Group>
                    <Group title="Email">
                        <SettingsRow label="Digest" description="A summary of what shipped and what's waiting for you.">
                            <Select
                                aria-label="Email digest"
                                size="sm"
                                className="settings-page__select"
                                value={prefs.digest}
                                onChange={(value) => set("digest", value)}
                                options={[
                                    { value: "daily", label: "Daily at 9:00" },
                                    { value: "weekly", label: "Mondays at 9:00" },
                                    { value: "off", label: "Off" },
                                ]}
                            />
                        </SettingsRow>
                        <SettingsRow label="Product news" description="A short email when Acme ships something new. About once a month.">
                            <Switch label="Product news" checked={prefs.productNews} onChange={(value) => set("productNews", value)} />
                        </SettingsRow>
                    </Group>
                </>
            );
        case "agents":
            return (
                <Group>
                    <SettingsRow label="Ask before running commands" description="Agents pause and wait for you before these.">
                        <Select
                            aria-label="Ask before running commands"
                            size="sm"
                            className="settings-page__select"
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
                            className="settings-page__input"
                            value={prefs.branchPrefix}
                            onChange={(event) => set("branchPrefix", event.target.value)}
                            spellCheck={false}
                        />
                    </SettingsRow>
                </Group>
            );
        case "account":
            return (
                <>
                    <Group title="Signing in">
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
                                <span className="settings-page__label-badge">
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
                                onClick={() => toast("Your backup codes were downloaded", { description: "Keep them somewhere other than this device." })}
                            >
                                Download backup codes
                            </Button>
                        </SettingsRow>
                    </Group>
                    <Group title="Devices">
                        <SettingsRow label="Sign out everywhere" description="Every computer and phone except this one. You'll stay signed in here.">
                            <Button size="sm" onClick={() => toast.success("Signed out of 3 other devices")}>
                                Sign out others
                            </Button>
                        </SettingsRow>
                    </Group>
                </>
            );
    }
}

export function SettingsPage() {
    const sectionId = useId();
    const [section, setSection] = useState<SectionId>("general");
    const [prefs, setPrefs] = useState<Preferences>(defaults);
    const [saved, setSaved] = useState(false);
    const timer = useRef(0);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    // Each change saves straight away; "Saved" shows beside the heading for a moment to say so.
    const set: Update = (key, value) => {
        setPrefs((current) => ({ ...current, [key]: value }));
        setSaved(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setSaved(false), 2000);
    };

    const current = sections.find((entry) => entry.id === section)!;
    const navItems = sections.map(({ id, label, icon: Icon }) => (
        <NavItem key={id} icon={<Icon size={15} />} active={section === id} onClick={() => setSection(id)}>
            {label}
        </NavItem>
    ));

    return (
        <div className="settings-page">
            <div className="settings-page__inner">
                <header className="settings-page__header">
                    <h1 className="settings-page__title">Settings</h1>
                    <p className="settings-page__lead">Your own preferences in Acme. They follow you to every device you sign in on.</p>
                </header>

                <div className="settings-page__layout">
                    {/* Down the left on wider screens; a sideways strip on phones. */}
                    <NavList label="Settings sections" className="settings-page__nav settings-page__nav--side">
                        {navItems}
                    </NavList>
                    <NavList label="Settings sections" orientation="horizontal" className="settings-page__nav settings-page__nav--top">
                        {navItems}
                    </NavList>

                    <section className="settings-page__section" aria-labelledby={sectionId}>
                        <div className="settings-page__section-header">
                            <div>
                                <h2 id={sectionId} className="settings-page__section-title">
                                    {current.label}
                                </h2>
                                <p className="settings-page__section-text">{current.description}</p>
                            </div>
                            <span className="settings-page__saved" data-visible={saved || undefined} role="status">
                                {saved ? (
                                    <>
                                        <Check size={14} aria-hidden="true" />
                                        Saved
                                    </>
                                ) : null}
                            </span>
                        </div>
                        <SectionContent section={section} prefs={prefs} set={set} />
                    </section>
                </div>
            </div>
        </div>
    );
}
