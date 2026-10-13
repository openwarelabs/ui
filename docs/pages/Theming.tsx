import { useState, type ReactNode } from "react";

import {
    Badge,
    Button,
    Checkbox,
    CodeBlock,
    Field,
    Input,
    ProgressBar,
    SegmentedControl,
    Stack,
    Switch,
    Table,
    brandCss,
    type TableColumn,
} from "@openwarelabs/ui";
import { Monitor, Moon, Sun } from "lucide-react";

import { BrandPicker } from "../app/BrandPicker";
import { brandPresets, brandSteps, useBrand } from "../app/brands";
import { SnippetBlock, ThemePane } from "../app/Guide";
import { useTheme, type ThemeChoice } from "../app/hooks";
import { DocPage, Section } from "../app/Page";
import brandSnippet from "../snippets/brand.tsx?highlight";
import scoped from "../snippets/scoped.tsx?highlight";
import themeSwitch from "../snippets/theme-switch.tsx?highlight";
import tokenCss from "../snippets/tokens.css?highlight";
import typeClasses from "../snippets/type-classes.tsx?highlight";

/** The same small screen in each pane, so the themes and brands compare like for like. */
function Sample() {
    const [notify, setNotify] = useState(true);
    const [agree, setAgree] = useState(true);
    return (
        <div className="docs-sample">
            <Stack direction="row" justify="between" align="center">
                <strong className="docs-sample__title">Deploy recipe-app</strong>
                <Badge variant="active" size="sm">
                    Ready
                </Badge>
            </Stack>
            <Field label="Domain">
                <Input defaultValue="recipe-app.openware.dev" />
            </Field>
            <ProgressBar label="Build" value={72} size="sm" showValue />
            <Stack direction="row" justify="between" align="center" gap="md">
                <Checkbox checked={agree} onChange={(event) => setAgree(event.target.checked)}>
                    Run the tests first
                </Checkbox>
                <Switch checked={notify} onChange={setNotify} label="Notify me" />
            </Stack>
            <Stack direction="row" gap="sm" justify="end">
                <Button size="sm">Cancel</Button>
                <Button size="sm" variant="primary">
                    Deploy
                </Button>
            </Stack>
        </div>
    );
}

const themeOptions: Array<{ value: ThemeChoice; label: string; icon: ReactNode }> = [
    { value: "light", label: "Light", icon: <Sun size={15} /> },
    { value: "dark", label: "Dark", icon: <Moon size={15} /> },
    { value: "system", label: "System", icon: <Monitor size={15} /> },
];

interface ThemeRow {
    id: string;
    value: string;
    meaning: string;
}

const themeRows: ThemeRow[] = [
    { id: "light", value: "light", meaning: "White surfaces on a cool slate canvas. The default when there's no attribute." },
    { id: "dark", value: "dark", meaning: "Charcoal surfaces, brighter brand steps for text and focus, and deeper shadows." },
    { id: "system", value: "system", meaning: "Light or dark to match the computer's setting, switching live when it changes." },
];

const themeColumns: Array<TableColumn<ThemeRow>> = [
    { key: "value", header: "data-theme", width: 140, render: (row) => <code className="docs-inline-code">{row.value}</code> },
    { key: "meaning", header: "What it does" },
];

const stepUse: Array<[string, string]> = [
    ["50–200", "Tints: the selected row, the recommended choice, soft fills and tinted borders in the light theme."],
    ["300–400", "Text, focus rings and progress on dark surfaces, where the brand colour has to be lighter to read."],
    ["500", "The primary button in the dark theme, and the focus ring in the light one."],
    ["600", "The primary button, checked boxes and switches in the light theme."],
    ["700", "The primary button's hover and pressed states."],
    ["800–950", "Deep grounds for marketing panels and the app icon."],
];

/** The picker drives the whole docs; the panes, the scale and the CSS show what it made. */
function BrandSection() {
    const brand = useBrand();
    const name = brand.id === "custom" ? brand.color : brandPresets.find((preset) => preset.id === brand.id)?.name;
    return (
        <div className="docs-stack">
            <BrandPicker />
            <div className="docs-themes">
                <ThemePane theme="light" label="Light">
                    <Sample />
                </ThemePane>
                <ThemePane theme="dark" label="Dark">
                    <Sample />
                </ThemePane>
            </div>
            <div className="docs-scale" role="list" aria-label={`${name} scale`}>
                {brandSteps.map((step) => (
                    <div key={step} className="docs-scale__step" role="listitem">
                        <span className="docs-scale__chip" style={{ background: brand.scale[step] }} />
                        <span className="docs-scale__label">{step}</span>
                        <span className="docs-scale__value">{brand.scale[step]}</span>
                    </div>
                ))}
            </div>
            <CodeBlock title="brand.css" language="css" code={brandCss(brand.scale)} />
        </div>
    );
}

export function Theming() {
    const [theme, setTheme] = useTheme();
    return (
        <DocPage
            title="Theming"
            description="Light, dark or the computer's setting, on the whole page or one part of it. And one brand colour to swap for your own."
            toc={[
                { id: "themes", label: "Themes", level: 2 },
                { id: "switching", label: "Switching themes", level: 2 },
                { id: "part-of-a-page", label: "Part of a page", level: 2 },
                { id: "brand-colour", label: "Brand colour", level: 2 },
                { id: "brand-in-your-app", label: "In your app", level: 3 },
                { id: "brand-steps", label: "What each step does", level: 3 },
                { id: "your-own-css", label: "Tokens in your CSS", level: 2 },
            ]}
        >
            <Section
                id="themes"
                title="Themes"
                description="The theme is the data-theme attribute. Every component reads its colours from CSS variables, and each theme sets them."
            >
                <Table caption="Themes" hideCaption columns={themeColumns} rows={themeRows} density="compact" />
                <div className="docs-themes">
                    <ThemePane theme="light" label='data-theme="light"'>
                        <Sample />
                    </ThemePane>
                    <ThemePane theme="dark" label='data-theme="dark"'>
                        <Sample />
                    </ThemePane>
                </div>
            </Section>

            <Section
                id="switching"
                title="Switching themes"
                description="Change the attribute on <html> and remember the choice. Set it in <head> before the page paints, so a dark page never flashes white."
            >
                <Stack direction="row" gap="md" align="center" wrap className="docs-controls">
                    <SegmentedControl
                        aria-label="Theme of these docs"
                        value={theme}
                        onChange={(value) => setTheme(value as ThemeChoice)}
                        options={themeOptions.map((option) => ({ value: option.value, label: option.label, icon: option.icon }))}
                    />
                    <span className="docs-muted">Switches these docs, the same way.</span>
                </Stack>
                <SnippetBlock snippet={themeSwitch} title="theme.ts" />
            </Section>

            <Section
                id="part-of-a-page"
                title="Part of a page"
                description="Put data-theme on any element and everything inside follows it: a dark sidebar in a light app, or a light preview in a dark editor. The panes on this page work this way."
            >
                <SnippetBlock snippet={scoped} />
            </Section>

            <Section
                id="brand-colour"
                title="Brand colour"
                description="Midnight is eleven steps, --ow-brand-50 to --ow-brand-950. Override them and the primary button, focus rings, checkboxes, switches, progress and tints all follow, in both themes. Pick a preset or any colour: these docs change with it, and remember it in this browser. The swatch in the header does the same from any page."
            >
                <BrandSection />
                <Section
                    id="brand-in-your-app"
                    title="In your app"
                    level={3}
                    description="brandScale turns any colour into the eleven steps, keeping its hue and colourfulness on Openware's lightness curve, so white text and focus rings keep their contrast. applyBrand puts it on the page."
                >
                    <SnippetBlock snippet={brandSnippet} title="theme-colour.ts" />
                </Section>
                <Section id="brand-steps" title="What each step does" level={3}>
                    <div className="docs-steps-table">
                        {stepUse.map(([steps, use]) => (
                            <div key={steps} className="docs-token-row docs-token-row--two">
                                <code>brand-{steps}</code>
                                <span className="docs-token-row__usage">{use}</span>
                            </div>
                        ))}
                    </div>
                    <p className="docs-text">
                        Keep the lightness of each step close to midnight's and the contrast holds: white text on step 600 needs at least 4.5:1, and the focus
                        ring 3:1 against every surface. In this repository, change <code>tokens/tokens.json</code> and run <code>npm run contrast</code> to
                        check all 55 pairs in both themes.
                    </p>
                </Section>
            </Section>

            <Section
                id="your-own-css"
                title="Tokens in your CSS"
                description="Use the same variables in your own styles, and your screens change theme and brand with the components."
            >
                <SnippetBlock snippet={tokenCss} title="release-card.css" />
                <p className="docs-text">Each text style is a class too, with its size, line height, weight and tracking:</p>
                <SnippetBlock snippet={typeClasses} />
            </Section>
        </DocPage>
    );
}
