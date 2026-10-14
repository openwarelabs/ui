import { useEffect, useId, useState } from "react";

import { Button, buttonClassName, Chip, cx, Link, Text } from "@openwarelabs/ui";

import { DownloadIcon } from "@blocks/shared/icons";
import type { Hero06Platform, Hero06PlatformId, Hero06Props } from "./Hero06.types";

/** The computer this page is open on, or null for phones, tablets and anything unknown. */
function detectPlatform(): Hero06PlatformId | null {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const name = `${nav.userAgentData?.platform ?? ""} ${navigator.platform} ${navigator.userAgent}`.toLowerCase();
    if (/android|iphone|ipad|ipod/.test(name) || (name.includes("mac") && navigator.maxTouchPoints > 1)) return null;
    if (name.includes("mac")) return "mac";
    if (name.includes("win")) return "windows";
    if (name.includes("linux") || name.includes("x11")) return "linux";
    return null;
}

const defaultLabel = (name: string) => `Download for ${name}`;

/** A hero for a desktop app: a download button for each system, with the visitor's own first, and the app beside it. */
export function Hero06({
    eyebrow,
    title,
    description,
    platforms,
    version,
    otherDownloads,
    downloadLabel = defaultLabel,
    visual,
    className,
    ...props
}: Hero06Props) {
    const titleId = useId();
    // Until the page knows which computer it's on (after it mounts), the first platform leads.
    const [detected, setDetected] = useState<Hero06PlatformId | null>(null);
    useEffect(() => setDetected(detectPlatform()), []);

    const current = platforms.find((platform) => platform.id === detected) ?? platforms[0];
    const order = current ? [current, ...platforms.filter((platform) => platform !== current)] : [];

    const button = (platform: Hero06Platform, primary: boolean) => {
        const label = downloadLabel(platform.name);
        const content = primary ? label : platform.name;
        const icon = primary ? <DownloadIcon size={16} /> : null;
        if (platform.href !== undefined) {
            return (
                <a
                    key={platform.id}
                    className={buttonClassName({ variant: primary ? "primary" : "secondary", size: "lg", shape: "pill" })}
                    href={platform.href}
                    aria-label={primary ? undefined : label}
                    onClick={platform.onDownload}
                >
                    {icon ? <span className="ow-button__icon">{icon}</span> : null}
                    {content}
                </a>
            );
        }
        return (
            <Button
                key={platform.id}
                variant={primary ? "primary" : "secondary"}
                shape="pill"
                size="lg"
                startIcon={icon}
                aria-label={primary ? undefined : label}
                onClick={platform.onDownload}
            >
                {content}
            </Button>
        );
    };

    return (
        <section className={cx("ow-hero06", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-hero06__inner">
                <div className="ow-hero06__text">
                    {eyebrow ? <Chip>{eyebrow}</Chip> : null}
                    <Text variant="page-title" id={titleId} className="ow-hero06__title">
                        {title}
                    </Text>
                    <Text variant="lead" className="ow-hero06__lead">
                        {description}
                    </Text>
                    <div className="ow-hero06__buttons">{order.map((platform, index) => button(platform, index === 0))}</div>
                    {version || current?.requirement || otherDownloads ? (
                        <Text variant="caption" as="p" className="ow-hero06__meta">
                            {version ? <span>{version}</span> : null}
                            {current?.requirement ? <span>{current.requirement}</span> : null}
                            {otherDownloads ? (
                                <span className="ow-hero06__other">
                                    <Link href={otherDownloads.href} variant="muted">
                                        {otherDownloads.label}
                                    </Link>
                                </span>
                            ) : null}
                        </Text>
                    ) : null}
                </div>
                {visual}
            </div>
        </section>
    );
}
