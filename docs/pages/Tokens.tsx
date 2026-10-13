import type { CSSProperties, ReactNode } from "react";

import tokens from "docs:tokens";

import { DocPage, Section } from "../app/Page";
import type { TokenEntry } from "../app/types";

const shown = (token: TokenEntry) => (typeof token.value === "string" ? token.value : "Light and dark");
const short = (name: string) => name.replace(/^ow-/, "");

function Row({ token, visual }: { token: TokenEntry; visual?: ReactNode }) {
    return (
        <div className="docs-token-row">
            <code>{short(token.name)}</code>
            <span className="docs-token-row__value">{shown(token)}</span>
            <span className="docs-token-row__visual">{visual}</span>
            {token.usage ? <span className="docs-token-row__usage">{token.usage}</span> : null}
        </div>
    );
}

export function Tokens() {
    const spacing = tokens.spacing.tokens;
    const steps = spacing.filter((token) => token.name.startsWith("ow-space-"));
    const layout = spacing.filter((token) => !token.name.startsWith("ow-space-"));
    const easings = tokens.timing.tokens.filter((token) => token.name.startsWith("ow-ease-"));
    const durations = tokens.timing.tokens.filter((token) => token.name.startsWith("ow-duration-"));
    return (
        <DocPage
            title="Spacing and shape"
            description="The rest of the tokens: space, corners, shadows, weights and motion. Use them as var(--ow-…) in your own CSS so your screens match the components."
            toc={[
                { id: "spacing", label: "Spacing", level: 2 },
                { id: "layout", label: "Layout", level: 3 },
                { id: "radius", label: "Corners", level: 2 },
                { id: "shadows", label: "Shadows", level: 2 },
                { id: "weights", label: "Weights", level: 2 },
                { id: "motion", label: "Motion", level: 2 },
            ]}
        >
            <Section
                id="spacing"
                title="Spacing"
                description="Thirteen small steps, close together, because interface spacing is mostly small. Stack's gap takes the same names. The bars are drawn six times as long."
            >
                <div className="docs-token-list">
                    {steps.map((token) => (
                        <Row key={token.name} token={token} visual={<span className="docs-bar" style={{ width: `calc(var(--${token.name}) * 6)` }} />} />
                    ))}
                </div>
                <Section id="layout" title="Layout" level={3}>
                    <div className="docs-token-list">
                        {layout.map((token) => (
                            <Row key={token.name} token={token} />
                        ))}
                    </div>
                </Section>
            </Section>
            <Section id="radius" title="Corners" description="Corners grow with the size of the thing: 4px on a checkbox, 12px on a card, a pill for badges.">
                <div className="docs-token-list">
                    {tokens.radius.tokens.map((token) => (
                        <Row key={token.name} token={token} visual={<span className="docs-shape" style={{ borderRadius: `var(--${token.name})` }} />} />
                    ))}
                </div>
            </Section>
            <Section
                id="shadows"
                title="Shadows"
                description="Shadows are for things that float or press. Each is set for both themes; dark ones are deeper, because a shadow on dark needs more to show."
            >
                <div className="docs-token-list">
                    {tokens.shadow.tokens.map((token) => (
                        <Row key={token.name} token={token} visual={<span className="docs-shadow" style={{ boxShadow: `var(--${token.name})` }} />} />
                    ))}
                </div>
            </Section>
            <Section
                id="weights"
                title="Weights"
                description="Inter is variable, so the interface uses weights between the usual hundreds: 730 for a button label, 760 for a dialog title."
            >
                <div className="docs-token-list">
                    {tokens.weight.tokens.map((token) => (
                        <Row
                            key={token.name}
                            token={token}
                            visual={
                                <span className="docs-weight" style={{ fontWeight: `var(--${token.name})` } as CSSProperties}>
                                    Deploy recipe-app
                                </span>
                            }
                        />
                    ))}
                </div>
            </Section>
            <Section
                id="motion"
                title="Motion"
                description="Short and quiet. Point at a row to see it move. Everything stands still when the computer asks for reduced motion."
            >
                <div className="docs-token-list">
                    {durations.map((token) => (
                        <Row
                            key={token.name}
                            token={token}
                            visual={
                                <span
                                    className="docs-motion"
                                    style={
                                        { "--docs-motion-duration": `var(--${token.name})`, "--docs-motion-ease": "var(--ow-ease-standard)" } as CSSProperties
                                    }
                                >
                                    <span className="docs-motion__dot" />
                                </span>
                            }
                        />
                    ))}
                    {easings.map((token) => (
                        <Row
                            key={token.name}
                            token={token}
                            visual={
                                <span
                                    className="docs-motion"
                                    style={{ "--docs-motion-duration": "700ms", "--docs-motion-ease": `var(--${token.name})` } as CSSProperties}
                                >
                                    <span className="docs-motion__dot" />
                                </span>
                            }
                        />
                    ))}
                </div>
            </Section>
        </DocPage>
    );
}
