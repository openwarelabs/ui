import { forwardRef } from "react";

import { Link } from "@openwarelabs/ui";

import type { BlockBrandLinkProps } from "@blocks/shared/shared.types";

/** The product's logo and name, as a link home. */
export const BlockBrandLink = forwardRef<HTMLAnchorElement, BlockBrandLinkProps>(function BlockBrandLink({ brand, className }, ref) {
    return (
        <Link ref={ref} href={brand.href} variant="standalone" className={className}>
            {brand.logo}
            {brand.name}
        </Link>
    );
});
