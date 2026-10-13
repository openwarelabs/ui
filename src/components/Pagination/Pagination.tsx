import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import { cx } from "../../utils/cx";

export interface PaginationProps {
    /** The current page, starting at 1. */
    page: number;
    pageCount: number;
    onPageChange(page: number): void;
    /** Pages shown either side of the current one.
     * @default 1 */
    siblingCount?: number;
    /** Pages always shown at each end.
     * @default 1 */
    boundaryCount?: number;
    /** @default "md" */
    size?: "sm" | "md";
    /** Names the control for screen readers.
     * @default "Pagination" */
    label?: string;
    className?: string;
}

type Item = number | "start-gap" | "end-gap";

/** The page numbers to show, with gaps where pages are skipped. */
export function paginationItems(page: number, pageCount: number, siblingCount = 1, boundaryCount = 1): Item[] {
    const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
    const startPages = range(1, Math.min(boundaryCount, pageCount));
    const endPages = range(Math.max(pageCount - boundaryCount + 1, boundaryCount + 1), pageCount);
    const siblingsStart = Math.max(
        Math.min(page - siblingCount, pageCount - boundaryCount - siblingCount * 2 - 1),
        boundaryCount + 2,
    );
    const siblingsEnd = Math.min(
        Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
        endPages.length > 0 ? endPages[0]! - 2 : pageCount - 1,
    );
    return [
        ...startPages,
        ...(siblingsStart > boundaryCount + 2
            ? (["start-gap"] as Item[])
            : boundaryCount + 1 < pageCount - boundaryCount
              ? [boundaryCount + 1]
              : []),
        ...range(siblingsStart, siblingsEnd),
        ...(siblingsEnd < pageCount - boundaryCount - 1
            ? (["end-gap"] as Item[])
            : pageCount - boundaryCount > boundaryCount
              ? [pageCount - boundaryCount]
              : []),
        ...endPages,
    ];
}

/** Moves through pages of results: previous, numbered pages with gaps, next. */
export function Pagination({
    page,
    pageCount,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1,
    size = "md",
    label = "Pagination",
    className,
}: PaginationProps) {
    const items = paginationItems(page, pageCount, siblingCount, boundaryCount);
    const go = (next: number) => onPageChange(Math.min(Math.max(1, next), pageCount));
    return (
        <nav aria-label={label} className={cx("ow-pagination", `ow-pagination--${size}`, className)}>
            <ul className="ow-pagination__list">
                <li>
                    <button
                        type="button"
                        className="ow-pagination__button ow-pagination__step"
                        aria-label="Previous page"
                        disabled={page <= 1}
                        onClick={() => go(page - 1)}
                    >
                        <ChevronLeftIcon size={16} />
                    </button>
                </li>
                {items.map((item) =>
                    typeof item === "number" ? (
                        <li key={item}>
                            <button
                                type="button"
                                className="ow-pagination__button"
                                aria-current={item === page ? "page" : undefined}
                                aria-label={`Page ${item}`}
                                onClick={() => go(item)}
                            >
                                {item}
                            </button>
                        </li>
                    ) : (
                        <li key={item} className="ow-pagination__gap" aria-hidden="true">
                            …
                        </li>
                    ),
                )}
                <li>
                    <button
                        type="button"
                        className="ow-pagination__button ow-pagination__step"
                        aria-label="Next page"
                        disabled={page >= pageCount}
                        onClick={() => go(page + 1)}
                    >
                        <ChevronRightIcon size={16} />
                    </button>
                </li>
            </ul>
        </nav>
    );
}
