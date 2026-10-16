import { hrefOf, listedComponents, slugify } from "../app/content";
import { DocPage, Section } from "../app/Page";
import { Thumbnail } from "../app/Thumbnail";
import { categories } from "../app/types";

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
