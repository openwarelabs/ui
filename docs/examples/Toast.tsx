import { Button, Stack, toast } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Toast",
    category: "Feedback",
    description:
        "Short notifications at the bottom of the screen, shown with toast() and stacked by sonner. Render one <Toaster /> near the root.",
    source: "components/Toast/Toast.tsx",
    imports: ["Toaster", "toast"],
    props: ["ToasterProps"],
    keyboard: [
        ["Alt + T", "Moves focus to the toasts, which opens the stack."],
        ["Tab", "Moves through a toast's buttons; focus pauses the timer."],
    ],
    notes: [
        "New toasts stack in front of older ones. Hovering or focusing the stack fans it out; a swipe dismisses one.",
        "Toasts go after six seconds, and pause while the stack is open so there's time to read them.",
        "They're read out politely. Pass important: true for one that must interrupt.",
        "The Toaster keeps itself above modal dialogs, so a toast fired from a dialog shows over it.",
        "An error that blocks the person's work belongs next to the work too, not only in a toast.",
        "toast is sonner's: everything in sonner's docs works, from toast.custom to toast.getToasts.",
    ],
    related: ["Alert", "Spinner"],
};

/** Name the result in two or three words; put the detail in description. These docs already render a Toaster. */
export function Kinds() {
    return (
        <Stack direction="row" gap="sm" wrap>
            <Button onClick={() => toast("Link copied")}>Neutral</Button>
            <Button
                onClick={() => toast.success("Saved", { description: "Checkpoint 14 is ready." })}
            >
                Success
            </Button>
            <Button
                onClick={() =>
                    toast.info("Update ready", { description: "Restart to install 0.2.0." })
                }
            >
                Info
            </Button>
            <Button
                onClick={() =>
                    toast.warning("Budget almost used", { description: "$92 of $100 this month." })
                }
            >
                Warning
            </Button>
            <Button
                onClick={() =>
                    toast.error("Couldn't save", {
                        description: "Check your connection and try again.",
                    })
                }
            >
                Error
            </Button>
        </Stack>
    );
}

/** Several at once stack up, the newest in front. Point at the stack to fan it out. */
export function Stacking() {
    function sendFour() {
        const messages = [
            "Planner finished",
            "Designer finished",
            "Developer finished",
            "Reviewer finished",
        ];
        messages.forEach((message, index) => {
            setTimeout(
                () => toast.success(message, { description: `Step ${index + 1} of 4` }),
                index * 350,
            );
        });
    }
    return (
        <Button variant="primary" onClick={sendFour}>
            Finish four steps
        </Button>
    );
}

/** An action button, for undo. Keep it to one short verb. */
export function WithAnAction() {
    return (
        <Button
            onClick={() =>
                toast("Project archived", {
                    description: "recipe-app is out of the list.",
                    action: { label: "Undo", onClick: () => toast.success("Project restored") },
                })
            }
        >
            Archive project
        </Button>
    );
}

/** toast.promise follows a promise: a spinner while it runs, then the result. */
export function FollowingAPromise() {
    function deploy() {
        const work = new Promise<{ url: string }>((resolve, reject) =>
            setTimeout(
                () =>
                    Math.random() > 0.25 ? resolve({ url: "recipe-app.openware.dev" }) : reject(),
                1600,
            ),
        );
        toast.promise(work, {
            loading: "Deploying…",
            success: (result) => `Live at ${result.url}`,
            error: "The deploy failed. Try again.",
        });
    }
    return (
        <Button variant="primary" onClick={deploy}>
            Deploy
        </Button>
    );
}

/** Reuse an id to replace a toast in place: a loading toast becomes the result. */
export function Replacing() {
    function sync() {
        toast.loading("Syncing to GitHub…", { id: "sync" });
        setTimeout(
            () => toast.success("Synced", { id: "sync", description: "3 commits pushed." }),
            1800,
        );
    }
    return <Button onClick={sync}>Sync</Button>;
}
