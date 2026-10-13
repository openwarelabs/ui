import { Button, Disclosure } from "@openwarelabs/ui";
import { Pencil, Terminal } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Disclosure",
    category: "Navigation",
    description:
        "One section that opens and closes: advanced settings, a log, the details behind a summary.",
    source: "components/Accordion/Accordion.tsx",
    keyboard: [["Enter or Space", "Opens or closes it."]],
    notes: [
        "Actions sit outside the toggle, so pressing one doesn't open or close the section.",
        "Several in a row belong in an Accordion.",
    ],
    related: ["Accordion"],
};

/** A card with a subtitle and an action. */
export function Card() {
    return (
        <div style={{ width: 460, maxWidth: "100%" }}>
            <Disclosure
                title="Build log"
                subtitle="Finished in 42s"
                icon={<Terminal size={15} />}
                actions={
                    <Button size="sm" variant="ghost">
                        Copy
                    </Button>
                }
            >
                <code style={{ fontFamily: "var(--ow-font-mono)", fontSize: 12.5 }}>
                    ✓ 214 modules transformed in 3.1s
                </code>
            </Disclosure>
        </div>
    );
}
Card.layout = { align: "start" as const };

/** variant="plain" is just the toggle, for “Show details” under something else. */
export function Plain() {
    return (
        <div style={{ width: 460, maxWidth: "100%" }}>
            <p style={{ margin: "0 0 8px" }}>The pipeline stopped at the Review step.</p>
            <Disclosure variant="plain" title="Show details" icon={<Pencil size={14} />}>
                The reviewer found two failing tests in src/cart.test.ts and sent the work back to
                the developer.
            </Disclosure>
        </div>
    );
}
Plain.layout = { align: "start" as const };
