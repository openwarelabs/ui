import { useEffect, useState } from "react";

import { Avatar, Badge, Button, Chip, Kbd, Link, toast } from "@openwarelabs/ui";
import { Bot, Download, FolderKanban, Gauge, Inbox, Plus, Rocket, Search, Settings } from "lucide-react";

import "./HeroDownload.css";

type Platform = "mac" | "windows" | "linux";

const version = "3.2.0";

const platforms: Record<Platform, { name: string; requirement: string; file: string }> = {
    mac: { name: "macOS", requirement: "macOS 13 or later", file: "Acme-3.2.0-universal.dmg · 118 MB" },
    windows: { name: "Windows", requirement: "Windows 10 or later", file: "Acme-Setup-3.2.0.exe · 96 MB" },
    linux: { name: "Linux", requirement: "Ubuntu 22.04, Fedora 39 or later", file: "acme_3.2.0_amd64.deb · 102 MB" },
};

/** The computer this page is open on, or null for phones, tablets and anything unknown. */
function detectPlatform(): Platform | null {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const name = `${nav.userAgentData?.platform ?? ""} ${navigator.platform} ${navigator.userAgent}`.toLowerCase();
    if (/android|iphone|ipad|ipod/.test(name) || (name.includes("mac") && navigator.maxTouchPoints > 1)) return null;
    if (name.includes("mac")) return "mac";
    if (name.includes("win")) return "windows";
    if (name.includes("linux") || name.includes("x11")) return "linux";
    return null;
}

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
    // Until the page knows which computer it's on (after it mounts), macOS goes first.
    const [current, setCurrent] = useState<Platform>("mac");

    useEffect(() => {
        const detected = detectPlatform();
        if (detected) setCurrent(detected);
    }, []);

    const order: Platform[] = [current, ...(["mac", "windows", "linux"] as const).filter((platform) => platform !== current)];

    const download = (platform: Platform) => {
        // Start the real download here: window.location.href = "/download/…".
        toast.success(`Downloading Acme ${version} for ${platforms[platform].name}`, { description: platforms[platform].file });
    };

    return (
        <section className="hero-download" aria-labelledby="hero-download-title">
            <div className="hero-download__inner">
                <div className="hero-download__text">
                    <Chip>Acme for desktop</Chip>
                    <h1 id="hero-download-title" className="hero-download__title">
                        Your workspace, a keystroke away
                    </h1>
                    <p className="hero-download__lead">
                        Open Acme from anywhere with one shortcut, hear the moment an agent needs a decision, and keep working on a train with no signal.
                    </p>
                    <div className="hero-download__buttons">
                        {order.map((platform, index) =>
                            index === 0 ? (
                                <Button
                                    key={platform}
                                    variant="primary"
                                    shape="pill"
                                    size="lg"
                                    startIcon={<Download size={16} />}
                                    onClick={() => download(platform)}
                                >
                                    Download for {platforms[platform].name}
                                </Button>
                            ) : (
                                <Button
                                    key={platform}
                                    shape="pill"
                                    size="lg"
                                    aria-label={`Download for ${platforms[platform].name}`}
                                    onClick={() => download(platform)}
                                >
                                    {platforms[platform].name}
                                </Button>
                            ),
                        )}
                    </div>
                    <p className="hero-download__meta">
                        <span>Version {version}</span>
                        <span>{platforms[current].requirement}</span>
                        <span className="hero-download__other">
                            <Link href="#downloads" variant="muted">
                                Other downloads
                            </Link>
                        </span>
                    </p>
                </div>
                <AppShot />
            </div>
        </section>
    );
}
