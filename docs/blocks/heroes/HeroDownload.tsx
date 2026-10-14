import { Hero06 } from "@openwarelabs/blocks";
import { Avatar, Badge, Kbd, toast } from "@openwarelabs/ui";
import { Bot, FolderKanban, Gauge, Inbox, Plus, Rocket, Search, Settings } from "lucide-react";

import "./HeroDownload.css";

const version = "3.2.0";

const platforms = [
    { id: "mac", name: "macOS", requirement: "macOS 13 or later", file: "Acme-3.2.0-universal.dmg · 118 MB" },
    { id: "windows", name: "Windows", requirement: "Windows 10 or later", file: "Acme-Setup-3.2.0.exe · 96 MB" },
    { id: "linux", name: "Linux", requirement: "Ubuntu 22.04, Fedora 39 or later", file: "acme_3.2.0_amd64.deb · 102 MB" },
] as const;

const inbox = [
    { title: "Merge the invoice fix?", project: "billing-api", who: "Agent", status: "Needs you", tone: "warning" },
    { title: "Pricing page copy", project: "marketing-site", who: "Maya Chen", status: "Approved", tone: "success" },
    { title: "Release 2.4 checklist", project: "mobile-app", who: "Clara Novak", status: "In review", tone: "active" },
    { title: "Update the API examples", project: "docs", who: "Agent", status: "Building", tone: "active" },
] as const;

const commands = [
    { icon: Bot, title: "Ask an agent to update the changelog", hint: "↵", active: true },
    { icon: Plus, title: "New ticket", hint: "C" },
    { icon: FolderKanban, title: "Go to billing-api" },
    { icon: Rocket, title: "Deploy marketing-site" },
];

/** The desktop app, drawn with Openware components. Swap it for a screenshot: <img src="…" alt="…" />. */
function AppShot() {
    return (
        <div
            className="hero-download__visual"
            role="img"
            aria-label="The Acme desktop app with its command bar open over the inbox, and a notification that an agent needs a decision."
        >
            <div className="hero-download__window">
                <div className="hero-download__titlebar">
                    <span className="hero-download__dots">
                        <span />
                        <span />
                        <span />
                    </span>
                    <span className="hero-download__window-title">Acme</span>
                </div>
                <div className="hero-download__app">
                    <div className="hero-download__rail">
                        <span className="hero-download__mark" />
                        <Gauge size={16} />
                        <Inbox size={16} />
                        <FolderKanban size={16} />
                        <Rocket size={16} />
                        <Settings size={16} />
                    </div>
                    <div className="hero-download__page">
                        <p className="hero-download__page-title">Inbox</p>
                        {inbox.map((item) => (
                            <div key={item.title} className="hero-download__row">
                                {item.who === "Agent" ? (
                                    <span className="hero-download__agent">
                                        <Bot size={13} />
                                    </span>
                                ) : (
                                    <Avatar name={item.who} size="sm" />
                                )}
                                <span className="hero-download__row-title">{item.title}</span>
                                <Badge size="sm" variant={item.tone}>
                                    {item.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                    <div className="hero-download__scrim" />
                    <div className="hero-download__palette">
                        <div className="hero-download__search">
                            <Search size={16} />
                            <span className="hero-download__query">Ask an agent to</span>
                            <Kbd>esc</Kbd>
                        </div>
                        <div className="hero-download__group">Suggestions</div>
                        <div className="hero-download__commands">
                            {commands.map(({ icon: Icon, title, hint, active }) => (
                                <div key={title} className="hero-download__command" data-active={active || undefined}>
                                    <Icon size={15} />
                                    <span className="hero-download__command-title">{title}</span>
                                    {hint ? <Kbd>{hint}</Kbd> : null}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="hero-download__notification">
                <span className="hero-download__mark" />
                <span className="hero-download__notification-text">
                    <span className="hero-download__notification-top">
                        Acme
                        <span>now</span>
                    </span>
                    <span className="hero-download__notification-title">An agent needs a decision</span>
                    <span className="hero-download__notification-body">billing-api: merge the invoice fix?</span>
                </span>
            </div>
        </div>
    );
}

export function HeroDownload() {
    // Start the real download here instead, or give each platform an href.
    const download = (name: string, file: string) => toast.success(`Downloading Acme ${version} for ${name}`, { description: file });
    return (
        <Hero06
            eyebrow="Acme for desktop"
            title="Your workspace, a keystroke away"
            description="Open Acme from anywhere with one shortcut, hear the moment an agent needs a decision, and keep working on a train with no signal."
            platforms={platforms.map((platform) => ({ ...platform, onDownload: () => download(platform.name, platform.file) }))}
            version={`Version ${version}`}
            otherDownloads={{ label: "Other downloads", href: "#downloads" }}
            visual={<AppShot />}
        />
    );
}
