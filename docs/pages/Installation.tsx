import { Alert, Button, Card, Field, Input, Snippet, Stack, Tab, TabList, TabPanel, Tabs, toast } from "@openwarelabs/ui";

import { hrefOf } from "../app/content";
import { SnippetBlock, Preview } from "../app/Guide";
import { DocPage, Section } from "../app/Page";
import first from "../snippets/first.tsx?highlight";
import html from "../snippets/html.html?highlight";
import iife from "../snippets/iife.html?highlight";
import setup from "../snippets/setup.tsx?highlight";
import tailwind from "../snippets/tailwind.css?highlight";
import toaster from "../snippets/toaster.tsx?highlight";

const managers = [
    { id: "npm", command: "npm install @openwarelabs/ui" },
    { id: "pnpm", command: "pnpm add @openwarelabs/ui" },
    { id: "yarn", command: "yarn add @openwarelabs/ui" },
    { id: "bun", command: "bun add @openwarelabs/ui" },
];

function NewProject() {
    return (
        <Card padding="lg" style={{ width: 400, maxWidth: "100%" }}>
            <Stack gap="xl">
                <Field label="Project name" hint="Letters, numbers and dashes.">
                    <Input placeholder="recipe-app" />
                </Field>
                <Stack direction="row" gap="sm" justify="end">
                    <Button>Cancel</Button>
                    <Button variant="primary" onClick={() => toast.success("Project created")}>
                        Create project
                    </Button>
                </Stack>
            </Stack>
        </Card>
    );
}

export function Installation() {
    return (
        <DocPage
            title="Installation"
            description="Add the package, load its styles once, and every component is ready to use. It takes about two minutes."
            toc={[
                { id: "requirements", label: "Requirements", level: 2 },
                { id: "install", label: "Install the package", level: 2 },
                { id: "styles", label: "Load the styles", level: 2 },
                { id: "page", label: "Set up the page", level: 2 },
                { id: "first-component", label: "Your first component", level: 2 },
                { id: "toasts", label: "Toasts", level: 2 },
                { id: "tailwind", label: "Tailwind", level: 2 },
                { id: "no-bundler", label: "Without a bundler", level: 2 },
            ]}
        >
            <Section id="requirements" title="Requirements">
                <ul className="docs-list">
                    <li>React 18 or 19, and a bundler that handles CSS imports: Vite, Next.js, esbuild, Parcel or webpack.</li>
                    <li>
                        A current browser: Chrome or Edge 114, Safari 17 or Firefox 125 and later. Menus and popovers use the browser's top layer, and dialogs
                        use <code>&lt;dialog&gt;</code>.
                    </li>
                    <li>
                        <code>lucide-react</code> for icons, if you want the same ones these docs use. It's optional.
                    </li>
                </ul>
            </Section>

            <Section id="install" title="Install the package" description="It's on npm as @openwarelabs/ui, with types for every setup.">
                <Tabs defaultValue="npm" variant="line" className="docs-install-tabs">
                    <TabList aria-label="Package manager">
                        {managers.map((manager) => (
                            <Tab key={manager.id} value={manager.id}>
                                {manager.id}
                            </Tab>
                        ))}
                    </TabList>
                    {managers.map((manager) => (
                        <TabPanel key={manager.id} value={manager.id}>
                            <Snippet value={manager.command} />
                        </TabPanel>
                    ))}
                </Tabs>
            </Section>

            <Section
                id="styles"
                title="Load the styles"
                description="Import two stylesheets once, where your app starts. Every component's styles are in styles.css, so there's nothing to import per component."
            >
                <SnippetBlock snippet={setup} title="main.tsx" />
                <p className="docs-text">
                    Already loading Inter some other way? Leave out <code>fonts.css</code>. The type falls back to the system font until Inter arrives.
                </p>
            </Section>

            <Section
                id="page"
                title="Set up the page"
                description="Two attributes on the page: the theme on <html>, and ow-app on <body> for the font, text size, colours and the canvas behind everything."
            >
                <SnippetBlock snippet={html} title="index.html" />
                <p className="docs-text">
                    <a href={hrefOf.guide("theming")}>Theming</a> covers switching between themes and giving part of a page its own.
                </p>
            </Section>

            <Section id="first-component" title="Your first component" description="Import what you need from @openwarelabs/ui. Everything is a named export.">
                <Preview ground="canvas">
                    <NewProject />
                </Preview>
                <SnippetBlock snippet={first} title="NewProject.tsx" />
            </Section>

            <Section
                id="toasts"
                title="Toasts"
                description="Put one Toaster near the root of your app. Then call toast() from anywhere, including outside components."
            >
                <SnippetBlock snippet={toaster} title="App.tsx" />
                <Alert title="Above dialogs">
                    The Toaster keeps itself above modal dialogs, so a toast fired from inside one shows over it. Nothing to set up.
                </Alert>
            </Section>

            <Section id="tailwind" title="Tailwind" description="With Tailwind v4, import the preset after Tailwind to use the tokens as utilities.">
                <SnippetBlock snippet={tailwind} title="app.css" />
            </Section>

            <Section
                id="no-bundler"
                title="Without a bundler"
                description="For a prototype or a page without a build step, there's a script build. It sets window.OpenwareUI and reads React from window.React."
            >
                <SnippetBlock snippet={iife} title="index.html" />
            </Section>
        </DocPage>
    );
}
