import { useState } from "react";

import { Badge, Button, Card, Chip, Field, Input, SegmentedControl, Stack, Switch, buttonClassName, toast } from "@openwarelabs/ui";
import { ArrowRight } from "lucide-react";

import { hrefOf, listedComponents, showBlocks, slugify } from "../app/content";
import { DocPage, Section } from "../app/Page";
import { categories } from "../app/types";
import { version } from "../app/version";

const principles = [
    {
        title: "Borders before shadows",
        text: "Cards are a surface and a hairline. Shadows are kept for things that float, like menus, or press, like buttons.",
    },
    { title: "Buttons you can feel", text: "A highlight along the top, a darker edge below and a 1px drop when pressed, so every click lands." },
    { title: "One colour, used sparingly", text: "The brand colour marks the main action and what's selected. Brass stays small: a dot, a bullet, a star." },
    {
        title: "Native first",
        text: "Dialogs are <dialog>, popovers use the browser's top layer and sliders are range inputs, so the browser does the hard parts.",
    },
    {
        title: "Every key works",
        text: "Each component's keyboard behaviour is written down on its page, focus always shows, and contrast is checked in both themes.",
    },
    { title: "Plain words", text: "Sentence case, buttons that name their action (“Delete project”, never “OK”) and errors that say what to do next." },
];

/** A small working form for the top of the page. */
function HeroDemo() {
    const [plan, setPlan] = useState("team");
    const [notify, setNotify] = useState(true);
    return (
        <Card padding="lg" className="docs-hero__demo">
            <Stack gap="xl">
                <Stack direction="row" justify="between" align="center">
                    <strong style={{ fontSize: 15, fontWeight: 600 }}>New project</strong>
                    <Badge variant="active" size="sm">
                        Draft
                    </Badge>
                </Stack>
                <Field label="Name" hint="Letters, numbers and dashes.">
                    <Input defaultValue="recipe-app" />
                </Field>
                <Field label="Plan">
                    <SegmentedControl
                        aria-label="Plan"
                        fullWidth
                        value={plan}
                        onChange={setPlan}
                        options={[
                            { value: "solo", label: "Solo" },
                            { value: "team", label: "Team" },
                            { value: "company", label: "Company" },
                        ]}
                    />
                </Field>
                <Stack direction="row" justify="between" align="center" gap="md">
                    <span style={{ fontSize: 14 }}>Email me when it ships</span>
                    <Switch checked={notify} onChange={setNotify} label="Email me when it ships" />
                </Stack>
                <Stack direction="row" gap="sm" justify="end">
                    <Button>Cancel</Button>
                    <Button variant="primary" onClick={() => toast.success("Project created", { description: "recipe-app is ready." })}>
                        Create project
                    </Button>
                </Stack>
            </Stack>
        </Card>
    );
}

function Hero() {
    return (
        <div className="docs-hero">
            <div className="docs-hero__text">
                <Chip>Openware UI {version}</Chip>
                <h1 className="docs-hero__title">Interfaces that look finished from the first commit</h1>
                <p className="docs-hero__lead">
                    A React component library with Commandr's look: deep midnight, a little brass, cool slate surfaces and buttons that press in.{" "}
                    {listedComponents.length} components, light and dark themes, and a brand colour you can swap.
                </p>
                <div className="docs-hero__actions">
                    <a className={buttonClassName({ variant: "primary", shape: "pill" })} href={hrefOf.guide("installation")}>
                        Get started
                        <ArrowRight size={16} aria-hidden="true" />
                    </a>
                    <a className={buttonClassName({ shape: "pill" })} href={hrefOf.components()}>
                        Browse components
                    </a>
                </div>
            </div>
            <HeroDemo />
        </div>
    );
}

export function Introduction() {
    const groups = categories
        .map((category) => ({ category, docs: listedComponents.filter((doc) => doc.meta.category === category) }))
        .filter((group) => group.docs.length);
    return (
        <DocPage
            hero={<Hero />}
            toc={[
                { id: "whats-inside", label: "What's inside", level: 2 },
                { id: "principles", label: "Principles", level: 2 },
                { id: "how-its-built", label: "How it's built", level: 2 },
                { id: "next-steps", label: "Next steps", level: 2 },
            ]}
        >
            <Section
                id="whats-inside"
                title="What's inside"
                description="Every component has a page with live examples, the code to copy, its keyboard behaviour and every prop."
            >
                <div className="docs-grid">
                    {groups.map((group) => (
                        <a key={group.category} className="docs-feature docs-feature--link" href={hrefOf.components(slugify(group.category))}>
                            <span className="docs-feature__title">
                                {group.category}
                                <span className="docs-feature__count">{group.docs.length}</span>
                            </span>
                            <span className="docs-feature__text">
                                {group.docs
                                    .slice(0, 4)
                                    .map((doc) => doc.meta.title)
                                    .join(", ")}
                                {group.docs.length > 4 ? ` and ${group.docs.length - 4} more` : ""}
                            </span>
                        </a>
                    ))}
                </div>
            </Section>
            <Section id="principles" title="Principles" description="The rules the components follow, and worth keeping in the screens you build with them.">
                <div className="docs-grid">
                    {principles.map((principle) => (
                        <div key={principle.title} className="docs-feature">
                            <p className="docs-feature__title">{principle.title}</p>
                            <p className="docs-feature__text">{principle.text}</p>
                        </div>
                    ))}
                </div>
            </Section>
            <Section id="how-its-built" title="How it's built">
                <ul className="docs-list">
                    <li>React 18 or 19, written in TypeScript. Every prop is typed and described, so your editor explains it on hover.</li>
                    <li>
                        One stylesheet of plain CSS with <code>ow-</code> class names. No CSS-in-JS, and nothing to configure.
                    </li>
                    <li>
                        Every colour, space, corner, shadow and weight is a CSS variable, such as <code>--ow-surface</code> or{" "}
                        <code>--ow-radius-container</code>, made from one <code>tokens.json</code>.
                    </li>
                    <li>
                        Themes are an attribute: <code>data-theme="dark"</code> on any element themes everything inside it.
                    </li>
                    <li>A Tailwind v4 preset maps the tokens to utilities, and a script build works without a bundler.</li>
                    <li>Icons are Lucide, 16px with a 2px stroke. Bring lucide-react, or any icon set drawn the same way.</li>
                </ul>
            </Section>
            <Section id="next-steps" title="Next steps">
                <div className="docs-grid docs-grid--pairs">
                    <a className="docs-feature docs-feature--link" href={hrefOf.guide("installation")}>
                        <span className="docs-feature__title">Installation</span>
                        <span className="docs-feature__text">Add the package and the styles, and render your first component.</span>
                    </a>
                    <a className="docs-feature docs-feature--link" href={hrefOf.guide("theming")}>
                        <span className="docs-feature__title">Theming</span>
                        <span className="docs-feature__text">Light, dark and system, and swapping midnight for your own brand colour.</span>
                    </a>
                    <a className="docs-feature docs-feature--link" href={hrefOf.components()}>
                        <span className="docs-feature__title">Components</span>
                        <span className="docs-feature__text">All {listedComponents.length} of them, grouped by what they're for.</span>
                    </a>
                    {showBlocks ? (
                        <a className="docs-feature docs-feature--link" href={hrefOf.blocks()}>
                            <span className="docs-feature__title">Blocks</span>
                            <span className="docs-feature__text">Whole sections of a page, from headers to settings, live at any width, to copy and change.</span>
                        </a>
                    ) : null}
                </div>
            </Section>
        </DocPage>
    );
}
