import { useState } from "react";

import { Banner, Button, Container, Link, Stack, Text } from "@openwarelabs/ui";
import { ArrowRight, WifiOff } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Banner",
    category: "Feedback",
    description:
        "A bar across the top of a page or app for news and notices that concern all of it: a launch, being offline, a trial running out.",
    source: "components/Banner/Banner.tsx",
    imports: ["Banner", "Link"],
    notes: [
        'It\'s a region named Announcement (set label to change it), so people can find it, but it isn\'t read out when the page loads. For a notice that appears while someone works, such as going offline, set live="polite", or live="assertive" if it can\'t wait.',
        "Give each banner on a page its own label, so their regions can be told apart.",
        "Every tone has an icon and words as well as a colour, so it doesn't rely on colour alone.",
        "dismissKey remembers the dismissal in this browser. Change the key for the next announcement, or it stays hidden.",
        "On the brand tone, use a Link or a secondary Button for the action: a primary button would vanish into the bar.",
        "Its narrow layout follows its own width, not the window's: under 560px the action goes under the message.",
        "For a message about one part of a page, use Alert; for news about something that just happened, a toast.",
    ],
    related: ["Alert", "Toast", "Container"],
    since: "0.14.0",
};

/** Six tones. brand is for news; the others are Alert's, for notices about the app. */
export function Tones() {
    return (
        <Stack gap="md" style={{ width: "100%" }}>
            <Banner tone="brand" label="Brand">
                Version 2 is out, with agents that open their own pull requests.
            </Banner>
            <Banner tone="neutral" label="Neutral">
                We've updated our terms of service.
            </Banner>
            <Banner tone="info" label="Info">
                Scheduled maintenance on Sunday from 02:00 to 03:00 UTC.
            </Banner>
            <Banner tone="success" label="Success">
                Your workspace has moved to the new region.
            </Banner>
            <Banner tone="warning" label="Warning">
                Your trial ends in 3 days.
            </Banner>
            <Banner tone="danger" label="Danger">
                Payments are failing. We're on it.
            </Banner>
        </Stack>
    );
}
Tones.layout = { fill: true };

/** An announcement with a link, which the person can dismiss. dismissKey remembers that in this browser. */
export function Announcement() {
    const [shown, setShown] = useState(0);
    const showAgain = () => {
        try {
            window.localStorage.removeItem("ow-banner:docs-v2-launch");
        } catch {
            // Storage is blocked: the banner wasn't remembered anyway.
        }
        setShown((count) => count + 1);
    };
    return (
        <Stack gap="lg" align="center" style={{ width: "100%" }}>
            <div style={{ width: "100%" }}>
                <Banner
                    key={shown}
                    dismissible
                    dismissKey="docs-v2-launch"
                    action={
                        <Link href="#v2">
                            Read the post <ArrowRight size={14} aria-hidden="true" style={{ verticalAlign: -2 }} />
                        </Link>
                    }
                >
                    We've launched v2.
                </Banner>
            </div>
            <Button size="sm" onClick={showAgain}>
                Show it again
            </Button>
        </Stack>
    );
}
Announcement.layout = { fill: true };

/** Notices about the app, at the start of the bar: being offline is read out when it appears; the trial carries a button. */
export function Notices() {
    return (
        <Stack gap="md" style={{ width: "100%" }}>
            <Banner tone="warning" live="polite" align="start" icon={<WifiOff size={16} />}>
                You're offline. Changes are saved on this device and sync when you're back.
            </Banner>
            <Banner
                tone="neutral"
                align="start"
                label="Trial"
                dismissible
                action={
                    <Button size="sm" variant="secondary">
                        Choose a plan
                    </Button>
                }
            >
                Your trial ends in 3 days.
            </Banner>
        </Stack>
    );
}
Notices.layout = { fill: true };

/** Sticky and contained: it stays at the top as the page scrolls, and its content lines up with the page's. */
export function StickyAndContained() {
    return (
        <div
            tabIndex={0}
            aria-label="Example page"
            role="region"
            style={{ width: "100%", height: 280, overflow: "auto", background: "var(--ow-paper)" }}
        >
            <Banner
                sticky
                contained
                label="Maintenance"
                align="start"
                tone="info"
                action={<Link href="#status">Status page</Link>}
            >
                Scheduled maintenance on Sunday from 02:00 to 03:00 UTC.
            </Banner>
            <Container style={{ paddingBlock: 32 }}>
                <Stack gap="md">
                    <Text as="h2" variant="heading">
                        Projects
                    </Text>
                    {Array.from({ length: 6 }, (_, index) => (
                        <Text key={index} variant="copy">
                            Scroll the page: the banner stays at the top, and its message starts where this text does.
                        </Text>
                    ))}
                </Stack>
            </Container>
        </div>
    );
}
StickyAndContained.layout = { fill: true };

/** On a narrow screen the message wraps and the action goes underneath. */
export function Narrow() {
    return (
        <div style={{ width: 360, maxWidth: "100%", marginInline: "auto" }}>
            <Banner label="Launch" dismissible action={<Link href="#v2">Read the post</Link>}>
                We've launched v2, with agents that open their own pull requests.
            </Banner>
        </div>
    );
}
Narrow.layout = { fill: true };
