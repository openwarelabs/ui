// Builds dist/: ESM and CJS for bundlers, an IIFE for script tags (window.OpenwareUI), and the CSS files.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { readStyles } from "./css.mjs";
import { mergeImports } from "./merge-imports.mjs";
import { pureCalls } from "./pure-calls.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const external = ["react", "react-dom", "react/jsx-runtime", "sonner", "react-colorful"];
const shared = {
    entryPoints: [path.join(root, "src/index.ts")],
    bundle: true,
    target: "es2020",
    jsx: "automatic",
    logLevel: "warning",
    plugins: [pureCalls],
};

await build({ ...shared, format: "esm", outfile: path.join(dist, "index.js"), external, sourcemap: true });
const esm = path.join(dist, "index.js");
fs.writeFileSync(esm, mergeImports(fs.readFileSync(esm, "utf8")));
await build({ ...shared, format: "cjs", outfile: path.join(dist, "index.cjs"), external, sourcemap: true });

// The script-tag build reads React from window.React, like the design system's previews.
const reactGlobals = {
    name: "react-globals",
    setup(builder) {
        builder.onResolve({ filter: /^react(-dom)?(\/jsx-runtime)?$/ }, (args) => ({
            path: args.path,
            namespace: "react-globals",
        }));
        builder.onLoad({ filter: /.*/, namespace: "react-globals" }, (args) => {
            if (args.path === "react-dom") return { contents: "module.exports = window.ReactDOM;", loader: "js" };
            if (args.path === "react") return { contents: "module.exports = window.React;", loader: "js" };
            return {
                loader: "js",
                contents: `
const R = window.React;
export const Fragment = R.Fragment;
export function jsx(type, props, key) {
    const { children, ...rest } = props;
    if (key !== undefined) rest.key = key;
    return children === undefined ? R.createElement(type, rest) : R.createElement(type, rest, children);
}
export function jsxs(type, props, key) {
    const { children, ...rest } = props;
    if (key !== undefined) rest.key = key;
    return R.createElement(type, rest, ...children);
}`,
            };
        });
    },
};

// Components with a card in the design system, in the order the docs list them.
export const catalogue = [
    "Button",
    "ButtonGroup",
    "ChoiceCard",
    "CloseButton",
    "CopyButton",
    "SegmentedControl",
    "ToggleButton",
    "Checkbox",
    "CheckboxGroup",
    "Combobox",
    "UploadList",
    "Field",
    "Fieldset",
    "FileDropZone",
    "ImageCropper",
    "InlineEdit",
    "Input",
    "InputOTP",
    "NumberField",
    "PasswordInput",
    "RadioGroup",
    "SearchField",
    "Select",
    "Slider",
    "SignaturePad",
    "Rating",
    "Switch",
    "TagInput",
    "MentionInput",
    "Textarea",
    "MarkdownEditor",
    "Calendar",
    "DatePicker",
    "ColorPicker",
    "ColorField",
    "Alert",
    "Banner",
    "Callout",
    "Badge",
    "ProgressBar",
    "ProgressCircle",
    "Skeleton",
    "Spinner",
    "Toaster",
    "Tooltip",
    "CommandPalette",
    "ConfirmDialog",
    "ContextMenu",
    "Dialog",
    "Drawer",
    "BottomSheet",
    "Menu",
    "Popover",
    "NotificationCenter",
    "Tour",
    "HoverCard",
    "Accordion",
    "Breadcrumbs",
    "Disclosure",
    "Link",
    "NavList",
    "NavigationMenu",
    "AppShell",
    "Pagination",
    "Steps",
    "Wizard",
    "Tabs",
    "TableOfContents",
    "Avatar",
    "AvatarGroup",
    "Carousel",
    "MediaPlayer",
    "CodeBlock",
    "DiffViewer",
    "ColorSwatch",
    "EmptyState",
    "FileTree",
    "TreeView",
    "JsonViewer",
    "Image",
    "Lightbox",
    "Kbd",
    "Truncate",
    "QRCode",
    "Snippet",
    "SortableList",
    "Kanban",
    "Gantt",
    "Stat",
    "Countdown",
    "RelativeTime",
    "DescriptionList",
    "LineChart",
    "AreaChart",
    "BarChart",
    "DonutChart",
    "PieChart",
    "ScatterChart",
    "Sparkline",
    "ActivityHeatmap",
    "Table",
    "DataGrid",
    "Tag",
    "TransferList",
    "Timeline",
    "CommentThread",
    "User",
    "Card",
    "ScrollShadow",
    "ScrollArea",
    "Separator",
    "SettingsRow",
    "Stack",
    "Container",
    "Section",
    "Splitter",
    "Collapsible",
    "AspectRatio",
    "Affix",
    "Watermark",
    "VisuallyHidden",
    "VirtualList",
    "Portal",
    "FocusTrap",
    "LogViewer",
    "Chip",
    "DotGrid",
    "SectionHeading",
    "SiteHeader",
    "Marquee",
];

const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: "OpenwareUI", components: catalogue.map((name) => ({ name })) })} */\n`;
const iife = await build({
    ...shared,
    format: "iife",
    globalName: "OpenwareUI",
    minify: true,
    write: false,
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [reactGlobals],
});
let iifeCode = iife.outputFiles[0].text;
if (/<\/script|<!--/i.test(iifeCode))
    iifeCode = iifeCode.replace(/<\/script/gi, "<\\/script").replace(/<!--/g, "\\x3C!--");
fs.writeFileSync(path.join(dist, "openware-ui.iife.js"), header + iifeCode);

// CSS: tokens, then base, then each component (order in scripts/css.mjs).
const { tokens: tokensCss, components: componentsCss } = readStyles();

fs.writeFileSync(path.join(dist, "tokens.css"), tokensCss);
fs.writeFileSync(path.join(dist, "components.css"), componentsCss);
fs.writeFileSync(path.join(dist, "styles.css"), `${tokensCss}\n${componentsCss}`);
fs.copyFileSync(path.join(root, "src/styles/tailwind.css"), path.join(dist, "tailwind.css"));
// The published tokens leave out "meta", which records where they were synced from.
const { meta, ...publishedTokens } = JSON.parse(fs.readFileSync(path.join(root, "tokens/tokens.json"), "utf8"));
fs.writeFileSync(path.join(dist, "tokens.json"), `${JSON.stringify(publishedTokens, null, 2)}\n`);
fs.writeFileSync(
    path.join(dist, "fonts.css"),
    `/* Inter and Geist Mono, self-hosted variable fonts (SIL Open Font License 1.1). */\n@import "@fontsource-variable/inter";\n@import "@fontsource-variable/geist-mono";\n`,
);

const size = (file) => `${(fs.statSync(path.join(dist, file)).size / 1024).toFixed(1)} KB`;
console.log(
    `dist: index.js ${size("index.js")}, openware-ui.iife.js ${size("openware-ui.iife.js")}, styles.css ${size("styles.css")}`,
);
