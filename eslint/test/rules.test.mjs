// The plugin's rules, each on a few right and wrong snippets, with ESLint's RuleTester. Run `npm run eslint:build`
// first: they test the built plugin, as an app gets it.
import { describe, it } from "node:test";

import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";

import plugin from "../dist/index.js";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});

const ui = (body) => `import { Button, Field, Input, Select, Stack, Text, Badge, Image } from "@openwarelabs/ui";\n${body}`;
const rule = (name) => plugin.rules[name];
const id = (messageId) => ({ messageId });

tester.run("no-raw-controls", rule("no-raw-controls"), {
    valid: [
        ui(`<Button>Save</Button>`),
        ui(`<input type="hidden" name="token" />`),
        ui(`<div role="button" />`),
        { code: ui(`<button>Save</button>`), options: [{ elements: { button: false } }] },
    ],
    invalid: [
        { code: ui(`<button onClick={save}>Save</button>`), errors: [id("raw")] },
        { code: ui(`<input type="checkbox" />`), errors: [{ messageId: "rawTyped", data: { component: "Checkbox", type: "checkbox", package: "@openwarelabs/ui" } }] },
        { code: ui(`<input placeholder="Email" />`), errors: [id("raw")] },
        { code: ui(`<select><option>One</option></select>`), errors: [id("raw")] },
        { code: ui(`<textarea />`), errors: [id("raw")] },
        { code: ui(`<h2>Title</h2>`), options: [{ elements: { h2: "Text" } }], errors: [{ messageId: "raw", data: { component: "Text", element: "h2", package: "@openwarelabs/ui" } }] },
    ],
});

tester.run("no-inline-colour", rule("no-inline-colour"), {
    valid: [
        ui(`<div style={{ color: "var(--ow-text-muted)", background: "transparent" }} />`),
        ui(`<div style={{ width: 320, margin: 0 }} />`),
        ui(`<div style={{ color: "currentColor" }} />`),
        ui(`<div style={styles.box} />`),
    ],
    invalid: [
        {
            code: ui(`<div style={{ color: "#f2f3fc" }} />`),
            output: ui(`<div style={{ color: "var(--ow-brand-50)" }} />`),
            errors: [{ messageId: "token", data: { colour: "#f2f3fc", property: "color", token: "--ow-brand-50" } }],
        },
        { code: ui(`<div style={{ background: "#123456" }} />`), errors: [id("colour")] },
        { code: ui(`<div style={{ borderColor: "red" }} />`), errors: [id("colour")] },
        { code: ui(`<div style={{ boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1)" }} />`), errors: [{ messageId: "colour", data: { colour: "rgba(0, 0, 0, 0.1)", property: "boxShadow" } }] },
    ],
});

tester.run("input-needs-field", rule("input-needs-field"), {
    valid: [
        ui(`<Field label="Name"><Input /></Field>`),
        ui(`<Field label="Name"><Stack><Input /></Stack></Field>`),
        ui(`<Input aria-label="Search" />`),
        ui(`<Input aria-labelledby="name-label" />`),
        ui(`<Input id="name" />`),
        ui(`<Input {...props} />`),
        ui(`<Input type="hidden" name="username" />`),
        ui(`<Input hidden name="username" />`),
        `import { Input } from "./Input";\n<Input />`,
    ],
    invalid: [
        { code: ui(`<Input placeholder="Email" />`), errors: [{ messageId: "unlabelled", data: { component: "Input" } }] },
        { code: ui(`<Select><option>One</option></Select>`), errors: [id("unlabelled")] },
        { code: `import * as UI from "@openwarelabs/ui";\n<UI.Input />`, errors: [id("unlabelled")] },
    ],
});

tester.run("valid-props", rule("valid-props"), {
    valid: [
        ui(`<Button variant="primary" size="sm" loading onClick={go} className="x" data-id="1" aria-label="Go" key="k" ref={ref} type="submit">Go</Button>`),
        ui(`<Stack gap="md" direction="column" style={{ width: 1 }} />`),
        ui(`<Image src="/a.png" alt="" width={1} height={1} />`),
        ui(`<Button {...props} variant="ghost" />`),
        `import { Button } from "./Button";\n<Button variant="outline" />`,
    ],
    invalid: [
        { code: ui(`<Button sze="sm">Go</Button>`), errors: [{ messageId: "unknownNear", data: { prop: "sze", component: "Button", near: "size" } }] },
        { code: ui(`<Button variant="outline">Go</Button>`), errors: [{ messageId: "value", data: { value: "outline", component: "Button", prop: "variant", values: '"primary", "danger", "secondary" or "ghost"' } }] },
        { code: ui(`<Stack direction="colum" />`), errors: [{ messageId: "valueNear", data: { value: "colum", component: "Stack", prop: "direction", near: "column", values: '"row" or "column"' } }] },
        { code: ui(`<Stack direction={"colum"} />`), errors: [id("valueNear")] },
        { code: ui(`<Field label="x" bogus><Input /></Field>`), errors: [id("unknown")] },
    ],
});

tester.run("import-from-package", rule("import-from-package"), {
    valid: [
        ui(`<Button>Go</Button>`),
        `import "@openwarelabs/ui/styles.css";\nimport { Hero01 } from "@openwarelabs/blocks";\nimport "@openwarelabs/blocks/styles.css";`,
        `import type { ButtonProps } from "@openwarelabs/ui";`,
        `import { Button, type ButtonProps } from "@openwarelabs/ui";`,
        `function Button() { return null; }\nconst a = <Button />;`,
        `import { Button } from "./Button";\nconst a = <Button />;`,
        { code: `import { LineChart } from "recharts";`, options: [{ allow: ["recharts"] }] },
        `import { useState } from "react";\nimport { clsx } from "clsx";`,
    ],
    invalid: [
        {
            code: `import { Button } from "@openwarelabs/ui/dist/index.js";`,
            output: `import { Button } from "@openwarelabs/ui";`,
            errors: [id("deep")],
        },
        {
            code: `import { Hero01 } from "@openwarelabs/blocks/dist/index.js";`,
            output: `import { Hero01 } from "@openwarelabs/blocks";`,
            errors: [id("deep")],
        },
        {
            code: `import { Buton } from "@openwarelabs/ui";`,
            output: `import { Button } from "@openwarelabs/ui";`,
            errors: [{ messageId: "unknownNear", data: { name: "Buton", package: "@openwarelabs/ui", near: "Button" } }],
        },
        { code: `import { DataTable } from "@openwarelabs/ui";`, output: `import { DataGrid } from "@openwarelabs/ui";`, errors: [id("unknownNear")] },
        { code: `import { Dialog } from "@radix-ui/react-dialog";`, errors: [{ messageId: "alternative", data: { source: "@radix-ui/react-dialog", package: "@openwarelabs/ui", components: "Dialog" } }] },
        { code: `import { Button } from "@mui/material";`, errors: [id("alternativeGeneric")] },
        { code: `import { toast } from "sonner";`, errors: [id("alternative")] },
        { code: `import { Card } from "@/components/ui/card";`, errors: [{ messageId: "shadcn", data: { source: "@/components/ui/card", package: "@openwarelabs/ui", components: "Card" } }] },
        {
            code: `import { Button } from "@openwarelabs/ui";\nconst a = <Badge>New</Badge>;`,
            output: `import { Button, Badge } from "@openwarelabs/ui";\nconst a = <Badge>New</Badge>;`,
            errors: [{ messageId: "missing", data: { name: "Badge", package: "@openwarelabs/ui" } }],
        },
        {
            code: `import { useState } from "react";\nconst a = <Button>Go</Button>;`,
            output: `import { useState } from "react";\nimport { Button } from "@openwarelabs/ui";\nconst a = <Button>Go</Button>;`,
            errors: [id("missing")],
        },
        {
            code: `const a = <Hero01 title="x" />;`,
            output: `import { Hero01 } from "@openwarelabs/blocks";\nconst a = <Hero01 title="x" />;`,
            errors: [{ messageId: "missing", data: { name: "Hero01", package: "@openwarelabs/blocks" } }],
        },
    ],
});

tester.run("valid-tokens", rule("valid-tokens"), {
    valid: [
        ui(`<div style={{ color: "var(--ow-text-muted)", "--ow-brand-500": "#000" }} />`),
        ui(`<div className="ow-app ow-type-lead" />`),
        ui(`<div className={\`ow-type-\${variant} ow-hero01\`} />`),
        ui(`<div className={cx("ow-type-caption", active && "ow-app")} />`),
        "const slot = `--ow-chart-${index}`;",
        { code: ui(`<div className="ow-app-sidebar" />`), options: [{ allow: ["ow-app-*"] }] },
        ui(`<div className="my-card is-active" />`),
    ],
    invalid: [
        {
            code: ui(`<div style={{ background: "var(--ow-surfase)" }} />`),
            errors: [
                {
                    messageId: "propertyNear",
                    data: { name: "--ow-surfase", near: "--ow-surface" },
                    suggestions: [{ messageId: "replace", data: { near: "--ow-surface" }, output: ui(`<div style={{ background: "var(--ow-surface)" }} />`) }],
                },
            ],
        },
        { code: `const css = "color: var(--ow-zebra)";`, errors: [id("property")] },
        {
            code: ui(`<div className="ow-type-sectoin-title" />`),
            errors: [
                {
                    messageId: "classNear",
                    data: { name: "ow-type-sectoin-title", near: "ow-type-section-title" },
                    suggestions: [{ messageId: "replace", data: { near: "ow-type-section-title" }, output: ui(`<div className="ow-type-section-title" />`) }],
                },
            ],
        },
        { code: ui(`<div className="ow-button" />`), errors: [{ messageId: "internal", data: { name: "ow-button", component: "Button" } }] },
        { code: ui(`<div className={\`ow-nothing-like-this \${x}\`} />`), errors: [id("class")] },
    ],
});
