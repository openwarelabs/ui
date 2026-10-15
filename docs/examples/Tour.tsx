import { useRef, useState } from "react";

import {
    Button,
    Coachmark,
    SearchField,
    Stack,
    Toolbar,
    ToolbarSeparator,
    Tour,
    toast,
} from "@openwarelabs/ui";
import { Plus, Share2, Sparkles } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Tour",
    category: "Overlays",
    description:
        "Shows people around: a card beside each part of the page in turn, saying what it's for, with Back and Next. It can dim the rest of the page, and a step without a target shows in the middle, for a welcome.",
    source: "components/Tour/Tour.tsx",
    imports: ["Tour", "Coachmark"],
    props: ["TourProps", "TourStep", "TourLabels", "CoachmarkProps"],
    keyboard: [
        ["Right", "Goes to the next step, while focus is in the card."],
        ["Left", "Goes back a step, while focus is in the card."],
        ["Escape", "Leaves the tour (onSkip), and focus goes back to where it was."],
        ["Tab", "Moves through the card's buttons, and on to the page: it doesn't trap focus."],
    ],
    notes: [
        'Each step\'s card is a non-modal role="dialog", named by its title and described by its text and "Step 2 of 5". Focus moves to the card on every step, so screen readers read it out.',
        "It stays non-modal with spotlight too: the dim is a cue, not a wall, so people can click what a step points at and try it.",
        "A target can be a CSS selector, a ref or a function that returns the element. The card sits in the top layer, flips when there's no room, and the target scrolls into view (smoothly, unless reduced motion is on).",
        "A step whose target isn't there shows in the middle instead, so a tour doesn't break when part of the page is hidden.",
        "Open it from a button, or once for new people, and remember that they've seen it. Keep it to a few steps: one sentence each about what a thing is for, not how the whole app works.",
        "Coachmark is one card beside one control, with a button that dismisses it, for pointing out something new. It doesn't take focus unless you pass autoFocus.",
    ],
    related: ["Popover", "Dialog", "Tooltip"],
    since: "0.14.0",
};

/** Three steps over a toolbar, each pointing at one control by its ref. */
export function Basic() {
    const [open, setOpen] = useState(false);
    const create = useRef<HTMLButtonElement>(null);
    const search = useRef<HTMLDivElement>(null);
    const share = useRef<HTMLButtonElement>(null);
    return (
        <Stack gap="lg" align="center">
            <Button variant="ghost" onClick={() => setOpen(true)}>
                Start tour
            </Button>
            <Toolbar aria-label="Projects">
                <Button ref={create} variant="primary" startIcon={<Plus size={16} />}>
                    New project
                </Button>
                <ToolbarSeparator />
                <div ref={search}>
                    <SearchField aria-label="Search projects" placeholder="Search projects" />
                </div>
                <Button ref={share} startIcon={<Share2 size={16} />}>
                    Share
                </Button>
            </Toolbar>
            <Tour
                open={open}
                onOpenChange={setOpen}
                onComplete={() => toast.success("You're all set")}
                steps={[
                    {
                        target: create,
                        title: "Start a project",
                        content:
                            "Every app you build lives in a project, with its own files and history.",
                    },
                    {
                        target: search,
                        title: "Find anything",
                        content: "Search by name, or by a word in any file.",
                    },
                    {
                        target: share,
                        title: "Bring people in",
                        content: "Invite your team to edit, or share a read-only link.",
                    },
                ]}
            />
        </Stack>
    );
}
Basic.layout = { minHeight: 360 };

/** With spotlight, the rest of the page dims and a hole is left over each target. These steps find theirs by CSS selector. */
export function Spotlight() {
    const [open, setOpen] = useState(false);
    return (
        <Stack gap="lg" align="center">
            <Button variant="ghost" onClick={() => setOpen(true)}>
                Start tour
            </Button>
            <Toolbar aria-label="Editor">
                <Button id="tour-spotlight-new" startIcon={<Plus size={16} />}>
                    Add a page
                </Button>
                <Button id="tour-spotlight-ai" startIcon={<Sparkles size={16} />}>
                    Write with AI
                </Button>
                <ToolbarSeparator />
                <Button id="tour-spotlight-publish" variant="primary">
                    Publish
                </Button>
            </Toolbar>
            <Tour
                open={open}
                onOpenChange={setOpen}
                spotlight
                steps={[
                    {
                        target: "#tour-spotlight-new",
                        title: "Pages",
                        content:
                            "Add as many as you like. Drag them in the sidebar to reorder them.",
                    },
                    {
                        target: "#tour-spotlight-ai",
                        title: "A first draft",
                        content: "Describe the page and get a draft to edit, in your site's style.",
                    },
                    {
                        target: "#tour-spotlight-publish",
                        title: "Go live",
                        content:
                            "Publishing makes your changes public. You can roll back any time.",
                        placement: "top",
                    },
                ]}
            />
        </Stack>
    );
}
Spotlight.layout = { minHeight: 360 };

/** Steps without a target show in the middle, like a dialog: a welcome first and a last word at the end. */
export function Welcome() {
    const [open, setOpen] = useState(false);
    const invite = useRef<HTMLButtonElement>(null);
    return (
        <Stack gap="lg" align="center">
            <Button variant="ghost" onClick={() => setOpen(true)}>
                Take the tour
            </Button>
            <Button ref={invite} startIcon={<Share2 size={16} />}>
                Invite people
            </Button>
            <Tour
                open={open}
                onOpenChange={setOpen}
                spotlight
                onSkip={(step) => toast(`Skipped at step ${step + 1}`)}
                steps={[
                    {
                        title: "Welcome to Openware",
                        content:
                            "A quick look round, three steps. You can leave any time with Escape.",
                    },
                    {
                        target: invite,
                        title: "Work together",
                        content: "Everyone you invite sees changes as they happen.",
                    },
                    {
                        title: "That's it",
                        content: "Find this tour again under Help whenever you like.",
                    },
                ]}
            />
        </Stack>
    );
}
Welcome.layout = { minHeight: 300 };

/** A Coachmark points out one new thing, with a button that dismisses it. */
export function Hint() {
    const [open, setOpen] = useState(false);
    const target = useRef<HTMLButtonElement>(null);
    return (
        <Stack gap="lg" align="center">
            <Button variant="ghost" onClick={() => setOpen(true)}>
                Show the hint
            </Button>
            <Button ref={target} startIcon={<Sparkles size={16} />}>
                Write with AI
            </Button>
            <Coachmark
                open={open}
                onOpenChange={setOpen}
                autoFocus
                target={target}
                title="New: write with AI"
                content="Describe what you want and get a first draft to edit."
            />
        </Stack>
    );
}
Hint.layout = { minHeight: 320 };
