import { useState } from "react";

import { Pagination, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Pagination",
    category: "Navigation",
    description:
        "Moves through pages of results. It always shows seven slots, so it doesn't jump about as the page changes.",
    source: "components/Pagination/Pagination.tsx",
    imports: ["Pagination", "paginationItems"],
    keyboard: [["Tab", "Moves between the page buttons; Enter or Space goes to that page."]],
    notes: [
        'The current page has aria-current="page"; the arrows read out as “Previous page” and “Next page”.',
        "paginationItems(page, pageCount) gives you the same list of pages and gaps to build your own.",
    ],
    related: ["Table"],
};

/** Ten pages, starting on the first. */
export function Basic() {
    const [page, setPage] = useState(1);
    return <Pagination page={page} pageCount={10} onPageChange={setPage} />;
}

/** Small, with more pages either side of the current one. */
export function Small() {
    const [page, setPage] = useState(24);
    return (
        <Stack gap="sm" align="center">
            <Pagination
                size="sm"
                siblingCount={2}
                page={page}
                pageCount={48}
                onPageChange={setPage}
            />
            <span style={{ color: "var(--ow-text-muted)", fontSize: 13 }}>Page {page} of 48</span>
        </Stack>
    );
}
