import type { BlockTableColumn } from "@blocks/shared/shared.types";

/**
 * The data attributes that hide a table's columns on smaller screens: the positions of the columns to hide under
 * 1024px and under 760px, counted as the cells are (from 1, after `offset` cells of its own such as checkboxes).
 * Each block's stylesheet turns them into `display: none` for those cells.
 */
export function hiddenColumns<Row>(columns: Array<BlockTableColumn<Row>>, offset = 0) {
    const at = (size: "tablet" | "phone") =>
        columns
            .map((column, index) => (column.hideBelow === size ? String(index + 1 + offset) : null))
            .filter(Boolean)
            .join(" ") || undefined;
    return { "data-hide-tablet": at("tablet"), "data-hide-phone": at("phone") };
}
