import { Badge, Stack } from "@openwarelabs/ui";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { builtBlocks } from "docs:block-index";

import { BlockPreview } from "../app/BlockPreview";
import { ComponentReference } from "../app/ComponentPage";
import { Sketch, blockCategories, blockGroups, blockHref, blockId, blockVariantCount, type BlockCategory } from "../app/blocks";
import { componentDocs, hrefOf, kebab, slugify } from "../app/content";
import { DocPage, Section } from "../app/Page";

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

const built = new Set(builtBlocks);

/** The component page a block uses, by its title or by one of the names it exports. */
const docFor = (name: string) => componentDocs.find((doc) => doc.slug === kebab(name) || doc.meta.imports?.includes(name));

export function BlocksIndex() {
    return (
        <DocPage
            title="Blocks"
            description="Whole sections of a page, made from Openware components, to copy into a project and change. Each one is live, at any width, with its code beside it."
            meta={
                <Stack direction="row" gap="md" align="center" wrap>
                    <Badge size="sm">{plural(blockVariantCount, "block")}</Badge>
                    <span className="docs-muted">{plural(blockCategories.length, "category", "categories")}, a .tsx and a .css file each</span>
                </Stack>
            }
            toc={blockGroups.map((group) => ({ id: slugify(group.name), label: group.name, level: 2 }))}
        >
            {blockGroups.map((group) => {
                const categories = blockCategories.filter((category) => category.group === group.name);
                return (
                    <div key={group.name} className="docs-index-group">
                        <Section id={slugify(group.name)} title={group.name} description={group.description}>
                            <div className="docs-index">
                                {categories.map((category) => (
                                    <a key={category.slug} className="docs-card" href={blockHref(category.slug)}>
                                        <span className="docs-card__preview docs-block-thumb" aria-hidden="true">
                                            <Sketch kind={category.sketch} />
                                        </span>
                                        <span className="docs-card__body">
                                            <span className="docs-card__name">{category.title}</span>
                                            <span className="docs-card__description">{category.description}</span>
                                            <span className="docs-block-count">{plural(category.variants.length, "block")}</span>
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </Section>
                    </div>
                );
            })}
        </DocPage>
    );
}

export function BlockCategoryPage({ category }: { category: BlockCategory }) {
    const index = blockCategories.indexOf(category);
    const previous = blockCategories[index - 1];
    const next = blockCategories[index + 1];
    const component = category.component ? docFor(category.component) : undefined;
    return (
        <DocPage
            wide
            breadcrumbs={[
                { label: "Blocks", href: blockHref() },
                { label: category.group, href: `${blockHref()}/${slugify(category.group)}` },
                { label: category.title },
            ]}
            title={category.title}
            description={category.description}
            meta={
                <div className="docs-block-meta">
                    <Stack direction="row" gap="md" align="center" wrap>
                        <Badge size="sm">{category.group}</Badge>
                        <span className="docs-muted">{plural(category.variants.length, "block")}</span>
                    </Stack>
                    <div className="docs-block-uses">
                        <span className="docs-block-uses__label">Made from</span>
                        <ul className="docs-block-uses__list">
                            {category.uses.map((name) => {
                                const doc = docFor(name);
                                return (
                                    <li key={name}>
                                        {doc ? (
                                            <a className="docs-block-uses__item" href={hrefOf.component(doc.slug)}>
                                                {name}
                                            </a>
                                        ) : (
                                            <span className="docs-block-uses__item">{name}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            }
            toc={[
                ...category.variants.map((variant) => ({ id: slugify(variant.name), label: variant.name, level: 2 as const })),
                ...(component ? [{ id: component.slug, label: component.meta.title, level: 2 as const }] : []),
            ]}
        >
            {category.variants.map((variant) => {
                const id = blockId(category, variant);
                return (
                    <Section key={variant.id} id={slugify(variant.name)} title={variant.name} description={variant.description}>
                        {built.has(id) ? (
                            <BlockPreview id={id} name={variant.name} height={variant.height} />
                        ) : (
                            <figure className="docs-block-preview">
                                <span className="docs-block-preview__badge">Not built yet</span>
                                <Sketch kind={variant.sketch ?? category.sketch} size="large" />
                                <figcaption className="ow-visually-hidden">A wireframe of the block: {variant.description}</figcaption>
                            </figure>
                        )}
                    </Section>
                );
            })}

            {component ? <ComponentReference doc={component} /> : null}

            <nav className="docs-pager" aria-label="Previous and next">
                {previous ? (
                    <a className="docs-pager__link" href={blockHref(previous.slug)}>
                        <span className="docs-pager__label">
                            <ArrowLeft size={14} aria-hidden="true" /> Previous
                        </span>
                        <span className="docs-pager__title">{previous.title}</span>
                    </a>
                ) : (
                    <span />
                )}
                {next ? (
                    <a className="docs-pager__link docs-pager__link--next" href={blockHref(next.slug)}>
                        <span className="docs-pager__label">
                            Next <ArrowRight size={14} aria-hidden="true" />
                        </span>
                        <span className="docs-pager__title">{next.title}</span>
                    </a>
                ) : null}
            </nav>
        </DocPage>
    );
}
