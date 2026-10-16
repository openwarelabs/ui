import { ChatSource, ChatSources, Code, Text } from "@openwarelabs/ui";
import { FileCode, GitPullRequest, Globe, LifeBuoy } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ChatSource",
    category: "AI",
    description:
        "Where an answer came from: a numbered citation in the text that previews its source on hover, focus or a tap, and ChatSources, the list under the answer.",
    source: "components/ChatSource/ChatSource.tsx",
    imports: ["ChatSource", "ChatSources"],
    props: ["ChatSourceProps", "ChatSourcesProps", "ChatSourceItem"],
    keyboard: [
        ["Tab", "Moves to a citation and shows its preview; moving on hides it."],
        ["Enter", "Follows the citation's link, or presses it when it's a button."],
        ["Escape", "Hides the preview and leaves focus on the citation."],
        ["Enter or Space", "On the ChatSources toggle, opens or closes the list."],
    ],
    notes: [
        "The preview is the citation's description (aria-describedby): screen readers hear the title, the source line and the snippet, and focus never moves into it.",
        "With an href the chip is a link to the source; without one it's a button. Its name is “Source 1”, or its label.",
        "On touch, the first tap shows the preview and the next one follows the link.",
        "The preview sits in the top layer like Popover and Tooltip, so scroll areas and dialogs don't clip it, and it flips above the line when there's no room below.",
    ],
    related: ["ChatTool", "Popover", "Link"],
    since: "0.5.0",
};

const repo = "https://github.com/acme/billing-api";

const invoiceSource = {
    index: 1,
    title: "formatInvoiceDate",
    source: "src/billing/invoice.ts · lines 40–72",
    href: `${repo}/blob/main/src/billing/invoice.ts#L40-L72`,
    external: true,
    icon: <FileCode />,
    snippet:
        "export function formatInvoiceDate(issuedAt: Date) {\n" +
        '    return new Intl.DateTimeFormat("en-GB", {\n' +
        '        dateStyle: "long",\n' +
        '        timeZone: "UTC",\n' +
        "    }).format(issuedAt);\n" +
        "}",
};

const pdfSource = {
    index: 2,
    title: "renderInvoicePdf",
    source: "src/billing/pdf.ts · lines 24–38",
    href: `${repo}/blob/main/src/billing/pdf.ts#L24-L38`,
    external: true,
    icon: <FileCode />,
    snippet: "// Its own formatter, also in UTC\nconst issued = formatDate(invoice.issuedAt);",
};

const pullRequestSource = {
    index: 3,
    title: "#482 Fix invoice dates in the EU",
    source: "Pull request · billing-api · Siobhan Murphy",
    href: `${repo}/pull/482`,
    external: true,
    icon: <GitPullRequest />,
    snippet:
        "Formats invoice dates in the customer's time zone, on the web and in the PDF, and adds a test for a customer in Europe/Dublin.",
};

const mdnSource = {
    index: 4,
    title: "Intl.DateTimeFormat: the timeZone option",
    source: "developer.mozilla.org",
    href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#timezone",
    external: true,
    icon: <Globe />,
};

/** Citations in an answer. Hover or focus a number to preview where it came from; the chip links to it. */
export function InlineCitations() {
    return (
        <Text variant="copy" tone="default" style={{ width: 560, maxWidth: "100%" }}>
            Invoices for customers in Ireland are dated the day before because{" "}
            <Code>formatInvoiceDate</Code> formats in the server's time zone, UTC{" "}
            <ChatSource {...invoiceSource} snippetFormat="code" />. The PDF invoice has its own copy
            of the formatter, so it needs the same fix{" "}
            <ChatSource {...pdfSource} snippetFormat="code" />
            . Pull request #482 changes both and adds a test for a customer in Dublin billed at
            23:30 UTC <ChatSource {...pullRequestSource} />.
        </Text>
    );
}
InlineCitations.layout = { minHeight: 320 };

/** A short label in place of a number. Without an href the chip is a button that only previews. */
export function ShortLabels() {
    return (
        <Text variant="copy" tone="default" style={{ width: 560, maxWidth: "100%" }}>
            A customer in Dublin reported it first{" "}
            <ChatSource
                label="Ticket 1093"
                icon={<LifeBuoy />}
                title="Our July invoice is dated 14 July"
                source="Support · Niamh Byrne, Dublin · 15 July"
                snippet="We were billed just after midnight on 15 July, but the invoice says 14 July. Our accountant needs the right date."
            />
            , and the fix is waiting for Ciarán Kelly to review it{" "}
            <ChatSource
                label="#482"
                icon={<GitPullRequest />}
                title="Fix invoice dates in the EU"
                source="Pull request · billing-api · waiting for review"
                href={`${repo}/pull/482`}
                external
            />
            .
        </Text>
    );
}
ShortLabels.layout = { minHeight: 260 };

/** The sources under an answer: a toggle that opens to a card for each. It starts closed; this one opens with defaultExpanded. */
export function SourcesList() {
    return (
        <div style={{ width: 560, maxWidth: "100%" }}>
            <ChatSources
                defaultExpanded
                sources={[invoiceSource, pdfSource, pullRequestSource, mdnSource]}
            />
        </div>
    );
}
SourcesList.layout = { align: "start" as const };
