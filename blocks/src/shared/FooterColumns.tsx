import { useId } from "react";

import { Link, Text } from "@openwarelabs/ui";

import type { FooterColumnsProps } from "@blocks/shared/shared.types";

/** A footer's columns of links, each a <nav> named by its heading. */
export function FooterColumns({ columns, headingClassName, listClassName, badgeClassName }: FooterColumnsProps) {
    const id = useId();
    return (
        <>
            {columns.map((column, index) => (
                <nav key={index} aria-labelledby={`${id}-${index}`}>
                    <Text variant="label" as="h2" id={`${id}-${index}`} className={headingClassName}>
                        {column.title}
                    </Text>
                    <ul className={listClassName}>
                        {column.links.map((link, linkIndex) => (
                            <li key={linkIndex}>
                                <Link href={link.href} variant="standalone">
                                    {link.label}
                                </Link>
                                {link.badge ? (
                                    <Text variant="badge" className={badgeClassName}>
                                        {link.badge}
                                    </Text>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </nav>
            ))}
        </>
    );
}
