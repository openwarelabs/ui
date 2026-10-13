import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { hrefOf, listedComponents, slugify } from "../app/content";
import { DocPage, Section } from "../app/Page";
import { categories } from "../app/types";

/** The first example of a component, shrunk to fit its card. It can't be focused or clicked. */
function Thumbnail({ doc }: { doc: (typeof listedComponents)[number] }) {
    const frame = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.72);
    const example = doc.examples[0];
    const First = example?.Component;

    useEffect(() => {
        if (frame.current) frame.current.inert = true;
    }, []);

    // Fit the example inside the card, at most 72% of its real size.
    useLayoutEffect(() => {
        const outer = frame.current;
        const inner = content.current;
        if (!outer || !inner) return undefined;
        const fit = () => {
            const room = { width: outer.clientWidth - 24, height: outer.clientHeight - 20 };
            const size = { width: inner.offsetWidth, height: inner.offsetHeight };
            if (!size.width || !size.height) return;
            setScale(Math.min(0.72, room.width / size.width, room.height / size.height));
        };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(outer);
        observer.observe(inner);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={frame} className="docs-card__preview" aria-hidden="true">
            <div
                ref={content}
                className={`docs-card__scale${example?.layout.fill ? " docs-card__scale--fill" : ""}`}
                style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
            >
                {First ? <First /> : null}
            </div>
        </div>
    );
}

export function ComponentsIndex() {
    const groups = categories
        .map((category) => ({ category, docs: listedComponents.filter((doc) => doc.meta.category === category) }))
        .filter((group) => group.docs.length);
    return (
        <DocPage
            title="Components"
            description={`All ${listedComponents.length} components, grouped by what they're for. Each page has live examples, the code to copy and every prop.`}
            toc={groups.map((group) => ({ id: slugify(group.category), label: group.category, level: 2 }))}
        >
            {groups.map((group) => (
                <div key={group.category} className="docs-index-group">
                    <Section id={slugify(group.category)} title={group.category}>
                        <div className="docs-index">
                            {group.docs.map((doc) => (
                                // The card is a box and its name the link, stretched over the card, so a preview that holds
                                // a link (Link's own) doesn't end up inside another.
                                <div key={doc.slug} className="docs-card">
                                    <Thumbnail doc={doc} />
                                    <span className="docs-card__body">
                                        <a className="docs-card__name docs-card__link" href={hrefOf.component(doc.slug)}>
                                            {doc.meta.title}
                                        </a>
                                        <span className="docs-card__description">{doc.meta.description}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>
            ))}
        </DocPage>
    );
}
