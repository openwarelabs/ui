import { useState, useSyncExternalStore, type ReactNode } from "react";

import { CloseButton } from "@/components/Button/ButtonGroup";
import { Container } from "@/components/Container/Container";
import { usePresence } from "@/hooks/usePresence";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { BannerProps, BannerTone } from "./Banner.types";
export type { BannerProps, BannerTone } from "./Banner.types";

const icons: Record<BannerTone, ReactNode> = {
    brand: <InfoIcon size={16} />,
    neutral: <InfoIcon size={16} />,
    info: <InfoIcon size={16} />,
    success: <CircleCheckIcon size={16} />,
    warning: <TriangleAlertIcon size={16} />,
    danger: <CircleAlertIcon size={16} />,
};

const storagePrefix = "ow-banner:";
/** Fired on the window when a bar with a dismissKey is dismissed, so others with the same key hide too. */
const dismissEvent = "ow-banner-dismiss";

function readDismissed(key: string | undefined): boolean {
    if (!key) return false;
    try {
        return window.localStorage.getItem(storagePrefix + key) === "1";
    } catch {
        return false;
    }
}

function subscribe(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener(dismissEvent, onChange);
    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(dismissEvent, onChange);
    };
}

const shownOnServer = () => false;

/**
 * A bar across the top of a page or app for news and notices that concern all of it: a launch, being offline, a
 * trial running out. It's a named region, not an alert, unless you make it `live`.
 */
export function Banner({
    tone = "brand",
    icon,
    action,
    dismissible = false,
    onDismiss,
    dismissKey,
    sticky = false,
    align = "center",
    contained = false,
    live,
    label = "Announcement",
    dismissLabel = "Dismiss",
    className,
    children,
    ...props
}: BannerProps) {
    // Read in render rather than in an effect, so a bar dismissed on an earlier visit never shows, not even for a frame.
    const remembered = useSyncExternalStore(subscribe, () => readDismissed(dismissKey), shownOnServer);
    const [dismissed, setDismissed] = useState(false);
    const { mounted, state } = usePresence(!dismissed && !remembered);
    if (!mounted) return null;

    const dismiss = () => {
        setDismissed(true);
        if (dismissKey) {
            try {
                window.localStorage.setItem(storagePrefix + dismissKey, "1");
                window.dispatchEvent(new Event(dismissEvent));
            } catch {
                // Storage is blocked or full: the bar still hides, it just comes back on the next visit.
            }
        }
        onDismiss?.();
    };

    const size = contained === true ? "page" : contained || undefined;
    const content = (
        <>
            <div className="ow-banner__content">
                {icon === false ? null : <span className="ow-banner__icon">{icon ?? icons[tone]}</span>}
                <div className="ow-banner__text">
                    <div className="ow-banner__message">{children}</div>
                    {action ? <div className="ow-banner__action">{action}</div> : null}
                </div>
            </div>
            {dismissible ? <CloseButton size="sm" label={dismissLabel} className="ow-banner__close" onClick={dismiss} /> : null}
        </>
    );

    return (
        <div
            role={live === "assertive" ? "alert" : live === "polite" ? "status" : "region"}
            aria-label={live ? undefined : label}
            aria-hidden={state === "closed" || undefined}
            data-state={state}
            className={cx(
                "ow-banner",
                `ow-banner--${tone}`,
                `ow-banner--${align}`,
                dismissible && "ow-banner--dismissible",
                sticky && "ow-banner--sticky",
                className,
            )}
            {...props}
        >
            <div className="ow-banner__clip">
                {size ? (
                    <Container size={size} className="ow-banner__inner">
                        {content}
                    </Container>
                ) : (
                    <div className="ow-banner__inner">{content}</div>
                )}
            </div>
        </div>
    );
}
