import { Badge, CodeBlock, Kbd, Link, Stack } from "@openwarelabs/ui";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { componentDocs, hrefOf, kebab, slugify } from "./content";
import { Example } from "./Example";
import { DocPage, Section, type TocItem } from "./Page";
import { hasProps, PropsTable } from "./PropsTable";
import type { ComponentDoc } from "./types";

export const repository = "https://github.com/openwarelabs/ui";

/** `import { A, B } from "@openwarelabs/ui";`, highlighted in the code block's colours. */
export function importSnippet(names: string[]) {
    const code = `import { ${names.join(", ")} } from "@openwarelabs/ui";`;
    const html =
        `<span style="color:#FF7B72">import</span><span style="color:#E6EDF3"> { ${names.join(", ")} } </span>` +
        `<span style="color:#FF7B72">from</span><span style="color:#A5D6FF"> "@openwarelabs/ui"</span><span style="color:#E6EDF3">;</span>`;
    return { code, html };
}

/** Writes "Shift + PageUp" with each key in a Kbd. */
function Keys({ keys }: { keys: string }) {
    return (
        <span className="docs-keys">
            {keys.split(/\s*\+\s*|\s+or\s+/).map((key, index, all) => (
                <span key={index} className="docs-keys__item">
                    <Kbd>{key}</Kbd>
                    {index < all.length - 1 ? <span className="docs-keys__join">{keys.includes(" or ") ? "or" : "+"}</span> : null}
                </span>
            ))}
        </span>
    );
}

export function ComponentPage({ doc }: { doc: ComponentDoc }) {
    const { meta, examples } = doc;
    const propNames = (meta.props ?? [`${meta.title}Props`]).filter(hasProps);
    const index = componentDocs.indexOf(doc);
    const previous = componentDocs[index - 1];
    const next = componentDocs[index + 1];
    const snippet = importSnippet(meta.imports ?? [meta.title]);
    const hasAccessibility = Boolean(meta.keyboard?.length || meta.notes?.length);

    const toc: TocItem[] = [
        { id: "import", label: "Import", level: 2 },
        { id: "examples", label: "Examples", level: 2 },
        ...examples.map((example) => ({ id: slugify(example.title), label: example.title, level: 3 as const })),
        ...(hasAccessibility ? [{ id: "accessibility", label: "Accessibility", level: 2 as const }] : []),
        ...(propNames.length ? [{ id: "api", label: "API reference", level: 2 as const }] : []),
        ...propNames.map((name) => ({ id: slugify(name), label: name, level: 3 as const })),
    ];

    return (
        <DocPage
            breadcrumbs={[
                { label: "Components", href: hrefOf.components() },
                { label: meta.category, href: hrefOf.components(slugify(meta.category)) },
                { label: meta.title },
            ]}
            title={meta.title}
            description={meta.description}
            meta={
                <Stack direction="row" gap="md" align="center" wrap>
                    <Badge size="sm">{meta.category}</Badge>
                    <Link href={`${repository}/blob/main/src/${meta.source}`} external variant="muted">
                        Source
                    </Link>
                </Stack>
            }
            toc={toc}
        >
            <Section id="import" title="Import">
                <CodeBlock code={snippet.code} html={snippet.html} />
            </Section>

            <Section id="examples" title="Examples">
                <div className="docs-examples">
                    {examples.map((example) => (
                        <Section key={example.name} id={slugify(example.title)} title={example.title} level={3} description={example.description || undefined}>
                            <Example example={example} />
                        </Section>
                    ))}
                </div>
            </Section>

            {hasAccessibility ? (
                <Section id="accessibility" title="Accessibility">
                    {meta.keyboard?.length ? (
                        <div className="docs-keyboard">
                            <table>
                                <caption className="ow-visually-hidden">Keyboard</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Key</th>
                                        <th scope="col">What it does</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meta.keyboard.map(([keys, action]) => (
                                        <tr key={keys}>
                                            <td>
                                                <Keys keys={keys} />
                                            </td>
                                            <td>{action}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : null}
                    {meta.notes?.length ? (
                        <ul className="docs-list">
                            {meta.notes.map((note) => (
                                <li key={note}>{note}</li>
                            ))}
                        </ul>
                    ) : null}
                </Section>
            ) : null}

            {propNames.length ? (
                <Section id="api" title="API reference">
                    {propNames.map((name) => (
                        <Section key={name} id={slugify(name)} title={<code className="docs-h3__code">{name}</code>} level={3}>
                            <PropsTable name={name} />
                        </Section>
                    ))}
                </Section>
            ) : null}

            {meta.related?.length ? (
                <Section id="related" title="Related">
                    <div className="docs-related">
                        {meta.related.map((name) => {
                            const related = componentDocs.find((entry) => entry.slug === kebab(name));
                            if (!related) return null;
                            return (
                                <a key={name} className="docs-related__card" href={hrefOf.component(related.slug)}>
                                    <span className="docs-related__name">{related.meta.title}</span>
                                    <span className="docs-related__description">{related.meta.description}</span>
                                </a>
                            );
                        })}
                    </div>
                </Section>
            ) : null}

            <nav className="docs-pager" aria-label="Previous and next">
                {previous ? (
                    <a className="docs-pager__link" href={hrefOf.component(previous.slug)}>
                        <span className="docs-pager__label">
                            <ArrowLeft size={14} aria-hidden="true" /> Previous
                        </span>
                        <span className="docs-pager__title">{previous.meta.title}</span>
                    </a>
                ) : (
                    <span />
                )}
                {next ? (
                    <a className="docs-pager__link docs-pager__link--next" href={hrefOf.component(next.slug)}>
                        <span className="docs-pager__label">
                            Next <ArrowRight size={14} aria-hidden="true" />
                        </span>
                        <span className="docs-pager__title">{next.meta.title}</span>
                    </a>
                ) : null}
            </nav>
        </DocPage>
    );
}
