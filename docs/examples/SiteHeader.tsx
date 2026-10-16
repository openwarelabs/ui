import { Button, Link, SiteHeader } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "SiteHeader",
    category: "Marketing",
    description:
        "A marketing site's header: a floating pill over a blur, with a hairline border and a soft shadow.",
    source: "components/Marketing/Marketing.tsx",
    notes: [
        "The nav links hide under 760px wide; put them in a Drawer for phones.",
        "Make it sticky with position: sticky and a top offset on a wrapper.",
    ],
    related: ["SectionHeading", "DotGrid", "Chip"],
};

function Brand() {
    return (
        <a
            href="#/components/site-header"
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "inherit",
                textDecoration: "none",
                fontWeight: "var(--ow-weight-emphasis)",
            }}
        >
            <span
                aria-hidden="true"
                style={{ width: 22, height: 22, borderRadius: 6, background: "var(--ow-primary)" }}
            />
            Acme
        </a>
    );
}

/** Brand, links and one call to action. */
export function Basic() {
    return (
        <div style={{ width: "100%" }}>
            <SiteHeader
                brand={<Brand />}
                nav={
                    <>
                        <Link variant="standalone" href="#/components/site-header">
                            Product
                        </Link>
                        <Link variant="standalone" href="#/components/site-header">
                            Pricing
                        </Link>
                        <Link variant="standalone" href="#/components/site-header">
                            Changelog
                        </Link>
                    </>
                }
                actions={
                    <Button variant="primary" shape="pill" size="sm">
                        Download
                    </Button>
                }
            />
        </div>
    );
}
Basic.layout = { fill: true, ground: "paper" as const };
