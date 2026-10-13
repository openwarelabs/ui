import { useState } from "react";

import {
    Avatar,
    AvatarGroup,
    Badge,
    Breadcrumbs,
    Button,
    ProgressBar,
    SettingsRow,
    Switch,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    toast,
    type BadgeVariant,
} from "@openwarelabs/ui";
import { Rocket } from "lucide-react";

import "./PageHeadingTabs.css";

interface Row {
    title: string;
    meta: string;
    mono: string;
    status: string;
    tone: BadgeVariant;
}

const members = ["Priya Nair", "Jonas Berg", "Aiko Tanaka", "Sam Okafor", "Maya Chen"];

/** The views of the project that list things, each with a few rows to start the page. */
const lists: Array<{ id: string; label: string; rows: Row[] }> = [
    {
        id: "deploys",
        label: "Deploys",
        rows: [
            { title: "Update React Native to 0.76", mono: "agent/rn-076", meta: "Agent for Priya Nair · 1 h ago", status: "Building", tone: "active" },
            { title: "Release 2.4", mono: "release/2.4", meta: "Priya Nair · 2 h ago", status: "Live", tone: "success" },
            { title: "Dark mode for the settings screen", mono: "main", meta: "Jonas Berg · Yesterday", status: "Live", tone: "success" },
        ],
    },
    {
        id: "reviews",
        label: "Reviews",
        rows: [
            {
                title: "Update React Native to 0.76",
                mono: "#311",
                meta: "Opened by an agent for Priya Nair · 412 lines",
                status: "Needs review",
                tone: "warning",
            },
            { title: "Haptics on pull to refresh", mono: "#309", meta: "Aiko Tanaka · 38 lines", status: "Changes requested", tone: "danger" },
            { title: "Cache avatars between launches", mono: "#306", meta: "Sam Okafor · 96 lines", status: "Approved", tone: "success" },
        ],
    },
    {
        id: "runs",
        label: "Agent runs",
        rows: [
            { title: "Update React Native to 0.76", mono: "agent/rn-076", meta: "For Priya Nair · 23 min · 14 files", status: "Needs review", tone: "warning" },
            {
                title: "Translate onboarding into Japanese",
                mono: "agent/onboarding-ja",
                meta: "For Aiko Tanaka · 9 min · 6 files",
                status: "Merged",
                tone: "success",
            },
        ],
    },
];

function RowList({ rows }: { rows: Row[] }) {
    return (
        <ul className="page-heading-tabs__list">
            {rows.map((row) => (
                <li key={`${row.title}-${row.mono}`} className="page-heading-tabs__row">
                    <span className="page-heading-tabs__row-text">
                        <span className="page-heading-tabs__row-title">{row.title}</span>
                        <span className="page-heading-tabs__row-meta">
                            <span className="page-heading-tabs__mono">{row.mono}</span> · {row.meta}
                        </span>
                    </span>
                    <Badge size="sm" variant={row.tone}>
                        {row.status}
                    </Badge>
                </li>
            ))}
        </ul>
    );
}

export function PageHeadingTabs() {
    const [tab, setTab] = useState("overview");
    const [settings, setSettings] = useState({ testFlight: true, crashes: true });

    return (
        <div className="page-heading-tabs">
            <div className="page-heading-tabs__panel">
                <div className="page-heading-tabs__top">
                    <Breadcrumbs items={[{ label: "Acme", href: "#" }, { label: "Projects", href: "#" }, { label: "mobile-app" }]} />
                    <div className="page-heading-tabs__header">
                        <div>
                            <h1 className="page-heading-tabs__title">mobile-app</h1>
                            <p className="page-heading-tabs__lead">The iOS and Android app, built from one codebase.</p>
                        </div>
                        <div className="page-heading-tabs__actions">
                            <AvatarGroup size="sm" max={4} label={`${members.length} people on mobile-app`}>
                                {members.map((name) => (
                                    <Avatar key={name} name={name} label={name} />
                                ))}
                            </AvatarGroup>
                            <Button
                                variant="primary"
                                startIcon={<Rocket size={16} />}
                                onClick={() =>
                                    toast("Release 2.5 is building", { description: "It goes to TestFlight and the Play Store's internal track first." })
                                }
                            >
                                New release
                            </Button>
                        </div>
                    </div>
                </div>

                <Tabs variant="line" value={tab} onValueChange={setTab} className="page-heading-tabs__tabs">
                    <TabList aria-label="mobile-app">
                        <Tab value="overview">Overview</Tab>
                        {lists.map((list) => (
                            <Tab key={list.id} value={list.id}>
                                {list.label}
                                <span className="page-heading-tabs__count">{list.rows.length}</span>
                            </Tab>
                        ))}
                        <Tab value="settings">Settings</Tab>
                    </TabList>

                    <TabPanel value="overview" className="page-heading-tabs__tab-panel page-heading-tabs__overview">
                        <dl className="page-heading-tabs__figures">
                            <div className="page-heading-tabs__figure">
                                <dt>Deploys this week</dt>
                                <dd>9</dd>
                            </div>
                            <div className="page-heading-tabs__figure">
                                <dt>Crash-free sessions</dt>
                                <dd>99.6%</dd>
                            </div>
                            <div className="page-heading-tabs__figure">
                                <dt>Open reviews</dt>
                                <dd>3</dd>
                            </div>
                        </dl>
                        <section className="page-heading-tabs__rollout" aria-labelledby="page-heading-tabs-rollout">
                            <h2 id="page-heading-tabs-rollout" className="page-heading-tabs__rollout-title">
                                Release 2.4 rollout
                            </h2>
                            <ProgressBar label="iOS" value={100} valueLabel="All users" tone="success" />
                            <ProgressBar label="Android" value={60} valueLabel="60% of users" />
                        </section>
                    </TabPanel>

                    {lists.map((list) => (
                        <TabPanel key={list.id} value={list.id} className="page-heading-tabs__tab-panel">
                            <RowList rows={list.rows} />
                        </TabPanel>
                    ))}

                    <TabPanel value="settings" className="page-heading-tabs__tab-panel">
                        <div className="page-heading-tabs__settings">
                            <SettingsRow label="Send builds to TestFlight" description="Every release goes to internal testers before the App Store.">
                                <Switch
                                    checked={settings.testFlight}
                                    onChange={(testFlight) => setSettings({ ...settings, testFlight })}
                                    label="Send builds to TestFlight"
                                />
                            </SettingsRow>
                            <SettingsRow label="Alert on new crashes" description="Post in #mobile when a release crashes more than 0.5% of sessions.">
                                <Switch checked={settings.crashes} onChange={(crashes) => setSettings({ ...settings, crashes })} label="Alert on new crashes" />
                            </SettingsRow>
                        </div>
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    );
}
