import tokens from "docs:tokens";

import { hrefOf, slugify } from "../app/content";
import { SnippetBlock } from "../app/Guide";
import { DocPage, Section } from "../app/Page";
import type { TypeStyle } from "../app/types";
import textComponent from "../snippets/text.tsx?highlight";
import typeClasses from "../snippets/type-classes.tsx?highlight";

const { families, groups } = tokens.type;

const fonts = [
    {
        name: "Inter",
        family: families.sans,
        role: "Every word in the interface, and the display type on marketing pages.",
        weights: [400, 500, 600, 700],
        sample: "Aa",
    },
    { name: "Geist Mono", family: families.mono, role: "Code, file paths, keys and token names.", weights: [400, 500, 600], sample: "{ }" },
];

function spec(style: TypeStyle) {
    return [style.fontSize, `${style.lineHeight} leading`, `weight ${style.fontWeight}`, style.letterSpacing ? `${style.letterSpacing} tracking` : null]
        .filter(Boolean)
        .join(" · ");
}

export function Typography() {
    return (
        <DocPage
            title="Typography"
            description="Inter for the interface and Geist Mono for code, both variable fonts, self-hosted with fonts.css. Each text style is a class with its size, leading, weight and tracking."
            toc={[
                { id: "fonts", label: "Fonts", level: 2 },
                ...groups.map((group) => ({ id: slugify(group.name), label: group.name, level: 2 as const })),
                { id: "using-the-styles", label: "Using the styles", level: 2 },
            ]}
        >
            <Section id="fonts" title="Fonts">
                <div className="docs-fonts">
                    {fonts.map((font) => (
                        <div key={font.name} className="docs-font">
                            <span className="docs-font__sample" style={{ fontFamily: font.family }} aria-hidden="true">
                                {font.sample}
                            </span>
                            <span className="docs-font__name">{font.name}</span>
                            <span className="docs-font__role">{font.role}</span>
                            <span className="docs-font__weights" style={{ fontFamily: font.family }}>
                                {font.weights.map((weight) => (
                                    <span key={weight} style={{ fontWeight: weight }}>
                                        {weight}
                                    </span>
                                ))}
                            </span>
                        </div>
                    ))}
                </div>
            </Section>
            {groups.map((group) => (
                <Section key={group.name} id={slugify(group.name)} title={group.name} description={group.note}>
                    <div className="docs-type-list">
                        {group.styles.map((style) => (
                            <div key={style.name} className="docs-type-row">
                                <span className={`docs-type-row__sample ${style.name}`}>{style.sample ?? "The quick brown fox"}</span>
                                <span className="docs-type-row__meta">
                                    <code>{`<Text variant="${style.name.replace(/^ow-type-/, "")}">`}</code>
                                    <span>{spec(style)}</span>
                                    {style.usage ? <span className="docs-type-row__usage">{style.usage}</span> : null}
                                </span>
                            </div>
                        ))}
                    </div>
                </Section>
            ))}
            <Section
                id="using-the-styles"
                title="Using the styles"
                description={
                    <>
                        In React, use the <a href={hrefOf.component("text")}>Text</a> component: its variants are these styles, by the same names. It picks a
                        sensible element, mutes the styles that should be muted and shrinks the display styles on phones; set <code>as</code> to keep the
                        page's outline right.
                    </>
                }
            >
                <SnippetBlock snippet={textComponent} />
                <p className="docs-text">Anywhere else, put the class on any element. Choose the element for the outline (h1, h2, p) and the class for the look.</p>
                <SnippetBlock snippet={typeClasses} />
            </Section>
        </DocPage>
    );
}
