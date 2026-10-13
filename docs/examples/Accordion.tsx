import { Accordion, AccordionItem } from "@openwarelabs/ui";
import { CreditCard, KeyRound, ShieldCheck } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Accordion",
    category: "Navigation",
    description: "A stack of sections that open and close, so a long page shows its outline first.",
    source: "components/Accordion/Accordion.tsx",
    imports: ["Accordion", "AccordionItem"],
    props: ["AccordionProps", "AccordionItemProps"],
    keyboard: [
        ["Enter or Space", "Opens or closes the focused section."],
        ["Tab", "Moves between section headers and into open sections."],
    ],
    notes: [
        "Each header is a real button inside a heading; set headingLevel to fit the page's outline.",
        "Closed sections are inert, so their links and fields can't be tabbed to.",
        "For a single section, use a Disclosure.",
    ],
    related: ["Disclosure", "Tabs"],
};

const faq = [
    {
        value: "cost",
        title: "What does a run cost?",
        body: "Each run shows its cost as it goes. Set a budget and agents stop before they pass it.",
    },
    {
        value: "keys",
        title: "Where are my keys kept?",
        body: "In your system keychain. They never leave your computer.",
    },
    {
        value: "offline",
        title: "Does it work offline?",
        body: "Projects open offline. Agents need a connection to reach their models.",
    },
];

/** One section open at a time. */
export function Single() {
    return (
        <Accordion defaultValue={["cost"]} style={{ width: 460, maxWidth: "100%" }}>
            {faq.map((item) => (
                <AccordionItem key={item.value} value={item.value} title={item.title}>
                    {item.body}
                </AccordionItem>
            ))}
        </Accordion>
    );
}
Single.layout = { align: "start" as const };

/** type="multiple" lets any number be open; separated gives each its own card. */
export function Separated() {
    return (
        <Accordion
            type="multiple"
            variant="separated"
            defaultValue={["security"]}
            style={{ width: 460, maxWidth: "100%" }}
        >
            <AccordionItem
                value="security"
                icon={<ShieldCheck size={15} />}
                title="Security"
                subtitle="Two-factor is on"
            >
                Sign-in needs a code from your authenticator app.
            </AccordionItem>
            <AccordionItem
                value="keys"
                icon={<KeyRound size={15} />}
                title="API keys"
                subtitle="2 keys"
            >
                One for Anthropic, one for OpenAI.
            </AccordionItem>
            <AccordionItem
                value="billing"
                icon={<CreditCard size={15} />}
                title="Billing"
                subtitle="Free plan"
                disabled
            >
                Billing isn't set up yet.
            </AccordionItem>
        </Accordion>
    );
}
Separated.layout = { align: "start" as const };
