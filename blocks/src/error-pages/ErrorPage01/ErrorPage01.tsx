import { useState } from "react";

import { cx, DotGrid, Link, SearchField, Text } from "@openwarelabs/ui";

import type { ErrorPage01Props } from "./ErrorPage01.types";

/** A 404 on the dot grid: the zero drawn as an empty orbit, a search field, and links to the main places. */
export function ErrorPage01({ brand, helpLink, title, description, places, maxPlaces = 4, onSearch, labels = {}, className, ...props }: ErrorPage01Props) {
    const [query, setQuery] = useState("");
    const words = query.trim().toLowerCase();
    const matches = places
        .filter((place) => !words || `${place.name} ${place.description ?? ""} ${place.keywords ?? ""}`.toLowerCase().includes(words))
        .slice(0, maxPlaces);

    return (
        <div className={cx("ow-error-page01", className)} {...props}>
            <DotGrid fade interactive className="ow-error-page01__ground">
                <header className="ow-error-page01__bar">
                    <Link href={brand.href} variant="standalone" className="ow-error-page01__logo" aria-label={labels.home}>
                        {brand.logo}
                        <Text variant="card-title" as="span">
                            {brand.name}
                        </Text>
                    </Link>
                    {helpLink ? (
                        <Link href={helpLink.href} variant="standalone">
                            {helpLink.label}
                        </Link>
                    ) : null}
                </header>

                <main className="ow-error-page01__main">
                    <div className="ow-error-page01__code" role="img" aria-label={labels.code ?? "Error 404"}>
                        <span aria-hidden="true">4</span>
                        <span className="ow-error-page01__zero" aria-hidden="true" />
                        <span aria-hidden="true">4</span>
                    </div>
                    <Text variant="heading" as="h1" className="ow-error-page01__title">
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="copy" className="ow-error-page01__text">
                            {description}
                        </Text>
                    ) : null}

                    <div className="ow-error-page01__search">
                        <SearchField
                            aria-label={labels.search ?? "Search"}
                            placeholder={labels.placeholder ?? "Search"}
                            value={query}
                            onChange={setQuery}
                            onSubmit={(text) => {
                                if (text.trim()) onSearch?.(text.trim());
                            }}
                        />
                    </div>

                    <ul className="ow-error-page01__places" aria-label={labels.places ?? "Places to go"}>
                        {matches.map((place) => (
                            <li key={place.name}>
                                <Link href={place.href} variant="standalone" className="ow-error-page01__place">
                                    <span className="ow-error-page01__place-icon" aria-hidden="true">
                                        {place.icon}
                                    </span>
                                    <span className="ow-error-page01__place-text">
                                        <Text variant="label">{place.name}</Text>
                                        {place.description ? (
                                            <Text variant="caption" truncate className="ow-error-page01__place-description">
                                                {place.description}
                                            </Text>
                                        ) : null}
                                    </span>
                                </Link>
                            </li>
                        ))}
                        {matches.length === 0 ? (
                            <Text as="li" variant="body" tone="muted" align="center" className="ow-error-page01__none" role="status">
                                {labels.noMatches ? labels.noMatches(query.trim()) : `Nothing here matches “${query.trim()}”. Press Enter to search.`}
                            </Text>
                        ) : null}
                    </ul>
                </main>
            </DotGrid>
        </div>
    );
}
