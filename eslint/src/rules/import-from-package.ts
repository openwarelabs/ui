import type { Rule } from "eslint";
import type { ImportDeclaration, Node } from "estree";
import type { JSXOpeningElement } from "estree-jsx";

import { blockSet, exportSet, manifest, packageOf } from "@plugin/manifest";
import { closest, isBound, jsxName, libraryImports } from "@plugin/util";

/** The subpaths each package exports; anything else is a deep import into dist/ or src/. */
const subpaths: Record<string, string[]> = {
    [manifest.package]: ["styles.css", "tokens.css", "fonts.css", "tailwind.css", "tokens.json", "package.json"],
    [manifest.blocksPackage]: ["styles.css", "package.json"],
};

/** Packages that duplicate something the library has, and what to use instead. */
const alternatives: Array<[pattern: string | RegExp, components: string[]]> = [
    ["sonner", ["Toaster", "toast"]],
    ["react-hot-toast", ["Toaster", "toast"]],
    ["react-toastify", ["Toaster", "toast"]],
    ["react-markdown", ["Markdown"]],
    ["react-syntax-highlighter", ["CodeBlock"]],
    ["@tanstack/react-virtual", ["VirtualList", "useVirtualizer"]],
    ["react-window", ["VirtualList"]],
    ["react-virtualized", ["VirtualList"]],
    ["react-virtuoso", ["VirtualList"]],
    ["react-infinite-scroll-component", ["VirtualList"]],
    ["recharts", ["LineChart", "AreaChart", "BarChart", "DonutChart", "PieChart", "ScatterChart", "Sparkline"]],
    ["chart.js", ["LineChart", "AreaChart", "BarChart", "DonutChart", "PieChart", "ScatterChart"]],
    ["react-chartjs-2", ["LineChart", "AreaChart", "BarChart", "DonutChart", "PieChart", "ScatterChart"]],
    ["victory", ["LineChart", "AreaChart", "BarChart", "PieChart", "ScatterChart"]],
    ["react-colorful", ["ColorPicker", "ColorField"]],
    ["react-color", ["ColorPicker", "ColorField"]],
    ["react-dropzone", ["FileDropZone"]],
    ["qrcode.react", ["QRCode"]],
    ["react-qr-code", ["QRCode"]],
    ["qrcode", ["QRCode"]],
    ["react-diff-viewer", ["DiffViewer"]],
    ["react-diff-viewer-continued", ["DiffViewer"]],
    ["diff2html", ["DiffViewer"]],
    [/^@dnd-kit\//, ["SortableList", "Kanban"]],
    ["react-beautiful-dnd", ["SortableList", "Kanban"]],
    ["@hello-pangea/dnd", ["SortableList", "Kanban"]],
    ["react-dnd", ["SortableList", "Kanban"]],
    ["react-sortablejs", ["SortableList"]],
    ["focus-trap-react", ["FocusTrap", "useFocusTrap"]],
    ["react-focus-lock", ["FocusTrap", "useFocusTrap"]],
    ["@floating-ui/react", ["Popover", "Tooltip", "useFloating"]],
    ["@floating-ui/react-dom", ["Popover", "Tooltip", "useFloating"]],
    ["react-popper", ["Popover", "Tooltip", "useFloating"]],
    ["react-day-picker", ["Calendar", "DatePicker", "DateRangePicker"]],
    ["react-datepicker", ["Calendar", "DatePicker", "DateRangePicker"]],
    ["react-calendar", ["Calendar", "DatePicker"]],
    ["cmdk", ["CommandPalette"]],
    ["input-otp", ["InputOTP"]],
    ["react-otp-input", ["InputOTP"]],
    ["react-signature-canvas", ["SignaturePad"]],
    ["react-easy-crop", ["ImageCropper"]],
    ["react-image-crop", ["ImageCropper"]],
    ["react-resizable-panels", ["Splitter"]],
    ["allotment", ["Splitter"]],
    ["react-split-pane", ["Splitter"]],
    ["embla-carousel-react", ["Carousel"]],
    ["swiper", ["Carousel"]],
    [/^swiper\//, ["Carousel"]],
    ["react-slick", ["Carousel"]],
    ["yet-another-react-lightbox", ["Lightbox"]],
    ["react-image-lightbox", ["Lightbox"]],
    ["vaul", ["BottomSheet", "Drawer"]],
    ["react-player", ["MediaPlayer"]],
    ["video.js", ["MediaPlayer"]],
    ["plyr", ["MediaPlayer"]],
    ["react-select", ["Select", "Combobox", "TagInput"]],
    ["react-tooltip", ["Tooltip"]],
    ["react-modal", ["Dialog"]],
    ["react-json-view", ["JsonViewer"]],
    ["@uiw/react-json-view", ["JsonViewer"]],
    ["react-json-tree", ["JsonViewer"]],
    ["react-mentions", ["MentionInput"]],
    ["@uiw/react-md-editor", ["MarkdownEditor"]],
    ["react-countdown", ["Countdown"]],
    ["react-timeago", ["RelativeTime"]],
    ["timeago-react", ["RelativeTime"]],
    ["react-rating", ["Rating"]],
    ["react-star-ratings", ["Rating"]],
    ["react-calendar-heatmap", ["ActivityHeatmap"]],
    ["@uiw/react-heat-map", ["ActivityHeatmap"]],
    ["frappe-gantt", ["Gantt"]],
    ["gantt-task-react", ["Gantt"]],
    ["react-joyride", ["Tour", "Coachmark"]],
    ["driver.js", ["Tour", "Coachmark"]],
    ["intro.js", ["Tour", "Coachmark"]],
    ["ag-grid-react", ["DataGrid"]],
    ["react-data-grid", ["DataGrid"]],
    ["react-textarea-autosize", ["Textarea"]],
    ["ansi-to-react", ["LogViewer"]],
    ["ansi-to-html", ["LogViewer"]],
    ["react-fast-marquee", ["Marquee"]],
    ["react-avatar", ["Avatar"]],
    ["react-loading-skeleton", ["Skeleton"]],
    ["react-spinners", ["Spinner"]],
    ["react-paginate", ["Pagination"]],
    ["react-tabs", ["Tabs"]],
    ["react-accessible-accordion", ["Accordion"]],
    ["react-collapsible", ["Collapsible"]],
    ["react-sticky", ["Affix"]],
    ["react-sticky-box", ["Affix"]],
    ["react-toggle", ["Switch"]],
    ["rc-slider", ["Slider"]],
    ["rc-tree", ["TreeView"]],
    ["react-arborist", ["TreeView"]],
    ["react-tag-input", ["TagInput"]],
    ["react-tagsinput", ["TagInput"]],
    ["react-watermark", ["Watermark"]],
    ["@headlessui/react", ["Dialog", "Menu", "Popover", "Combobox", "Switch", "Tabs", "Disclosure", "RadioGroup", "ListBox"]],
    [/^@radix-ui\/react-(?!slot|primitive|compose-refs|use-|id$|direction$|presence$|context$)/, []],
    ["@radix-ui/themes", []],
    ["@mui/material", []],
    [/^@mui\/material\//, []],
    ["@chakra-ui/react", []],
    ["@mantine/core", []],
    ["@mantine/dates", ["Calendar", "DatePicker", "DateRangePicker", "DateField", "TimeField"]],
    ["antd", []],
    ["react-bootstrap", []],
    ["@heroui/react", []],
    ["@nextui-org/react", []],
    ["@ark-ui/react", []],
    ["@base-ui-components/react", []],
    [/^@base-ui-components\/react\//, []],
];

/** Radix's package names say which component they duplicate. */
const radix: Record<string, string[]> = {
    dialog: ["Dialog"],
    "alert-dialog": ["ConfirmDialog"],
    popover: ["Popover"],
    "dropdown-menu": ["Menu", "MenuItem"],
    menubar: ["Menu"],
    "context-menu": ["ContextMenu"],
    tooltip: ["Tooltip"],
    tabs: ["Tabs"],
    accordion: ["Accordion"],
    collapsible: ["Collapsible"],
    switch: ["Switch"],
    checkbox: ["Checkbox"],
    "radio-group": ["RadioGroup"],
    select: ["Select"],
    slider: ["Slider"],
    avatar: ["Avatar"],
    progress: ["ProgressBar"],
    toast: ["Toaster"],
    "scroll-area": ["ScrollArea"],
    "hover-card": ["HoverCard"],
    "navigation-menu": ["NavigationMenu"],
    separator: ["Separator"],
    "toggle-group": ["ToggleButtonGroup"],
    toggle: ["ToggleButton"],
    portal: ["Portal"],
    "focus-scope": ["FocusTrap"],
    "visually-hidden": ["VisuallyHidden"],
    "aspect-ratio": ["AspectRatio"],
    label: ["Field"],
    form: ["Form"],
};

const shadcnPath = /(?:^|\/)components\/ui\/[^/]+$/;

function alternativeFor(source: string): string[] | null {
    for (const [pattern, components] of alternatives) {
        if (typeof pattern === "string" ? pattern === source : pattern.test(source)) {
            const radixName = /^@radix-ui\/react-(.+)$/.exec(source)?.[1];
            return radixName && radix[radixName] ? radix[radixName] : components;
        }
    }
    return null;
}

/** The names an import declaration brings in, by what they're called in the package. */
function importedNames(node: ImportDeclaration) {
    return node.specifiers.flatMap((specifier) => {
        if (specifier.type !== "ImportSpecifier") return [];
        if ((specifier as ImportDeclaration["specifiers"][number] & { importKind?: string }).importKind === "type") return [];
        return [{ specifier, name: specifier.imported.type === "Identifier" ? specifier.imported.name : String(specifier.imported.value) }];
    });
}

export const importFromPackage: Rule.RuleModule = {
    meta: {
        type: "problem",
        docs: {
            description: "Components come from @openwarelabs/ui itself: no deep imports, no misspelt names, no look-alikes from other libraries, and nothing used without its import.",
            url: "https://github.com/openwarelabs/ui/blob/main/eslint/README.md#import-from-package",
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    allow: { type: "array", items: { type: "string" }, description: "Packages the rule leaves alone, e.g. [\"recharts\"] when the app has charts the library's can't draw." },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            deep: 'Import from "{{package}}" itself, not "{{source}}": everything is a named export of the package.',
            unknownNear: '"{{name}}" isn\'t exported by {{package}}. Did you mean "{{near}}"?',
            unknown: '"{{name}}" isn\'t exported by {{package}}. Call list_components or search, or see the docs, for what is.',
            alternative: '"{{source}}" duplicates what {{package}} has: use {{components}} from it, so the app has one look and one set of behaviours.',
            alternativeGeneric: '"{{source}}" is another component library: use the components from {{package}}, so the app has one look and one set of behaviours.',
            shadcn: '"{{source}}" looks like a copied component; {{package}} exports {{components}}. Import from the package instead.',
            missing: '<{{name}}> isn\'t imported: add it to the import from "{{package}}".',
        },
    },
    create(context) {
        const options = (context.options[0] ?? {}) as { allow?: string[] };
        const allow = new Set(options.allow ?? []);
        const sourceCode = context.sourceCode;

        /** Adds a name to the file's import from a package, or writes a new import. */
        function addImport(fixer: Rule.RuleFixer, name: string, pkg: string) {
            const program = sourceCode.ast;
            const existing = program.body.find(
                (statement): statement is ImportDeclaration =>
                    statement.type === "ImportDeclaration" &&
                    statement.source.value === pkg &&
                    (statement as ImportDeclaration & { importKind?: string }).importKind !== "type" &&
                    statement.specifiers.some((specifier) => specifier.type === "ImportSpecifier"),
            );
            if (existing) {
                const specifiers = existing.specifiers.filter((specifier) => specifier.type === "ImportSpecifier");
                const last = specifiers[specifiers.length - 1]!;
                return fixer.insertTextAfter(last as Node, `, ${name}`);
            }
            const imports = program.body.filter((statement) => statement.type === "ImportDeclaration");
            const line = `import { ${name} } from "${pkg}";\n`;
            const lastImport = imports[imports.length - 1];
            return lastImport ? fixer.insertTextAfter(lastImport as Node, `\n${line.trimEnd()}`) : fixer.insertTextBeforeRange([0, 0], line);
        }

        return {
            ImportDeclaration(node) {
                const source = typeof node.source.value === "string" ? node.source.value : "";
                if (!source || allow.has(source)) return;
                if ((node as ImportDeclaration & { importKind?: string }).importKind === "type") return;

                // Deep imports into the package.
                const pkg = Object.keys(subpaths).find((name) => source.startsWith(`${name}/`));
                if (pkg) {
                    const subpath = source.slice(pkg.length + 1);
                    if (subpaths[pkg]!.includes(subpath)) return;
                    const names = importedNames(node);
                    const exports = pkg === manifest.package ? exportSet : blockSet;
                    const fixable = names.length === node.specifiers.length && names.every(({ name }) => exports.has(name));
                    context.report({
                        node: node.source,
                        messageId: "deep",
                        data: { package: pkg, source },
                        fix: fixable ? (fixer) => fixer.replaceText(node.source, JSON.stringify(pkg)) : null,
                    });
                    return;
                }

                // Names the package doesn't export.
                if (source === manifest.package || source === manifest.blocksPackage) {
                    const exports = source === manifest.package ? exportSet : blockSet;
                    for (const { specifier, name } of importedNames(node)) {
                        if (exports.has(name)) continue;
                        const near = closest(name, exports, 3);
                        context.report({
                            node: specifier,
                            messageId: near ? "unknownNear" : "unknown",
                            data: { name, package: source, near: near ?? "" },
                            fix: near && specifier.local.name === name ? (fixer) => fixer.replaceText(specifier, near) : null,
                        });
                    }
                    return;
                }

                // Other libraries that do what the library does.
                const components = alternativeFor(source);
                if (components) {
                    context.report({
                        node: node.source,
                        messageId: components.length ? "alternative" : "alternativeGeneric",
                        data: { source, package: manifest.package, components: components.join(", ") },
                    });
                    return;
                }

                // Copied components (shadcn/ui-style paths) with the library's names.
                if (shadcnPath.test(source)) {
                    const ours = importedNames(node).map(({ name }) => name).filter((name) => exportSet.has(name));
                    if (ours.length) context.report({ node: node.source, messageId: "shadcn", data: { source, package: manifest.package, components: ours.join(", ") } });
                }
            },

            JSXOpeningElement(node) {
                const element = node as unknown as JSXOpeningElement;
                if (element.name.type !== "JSXIdentifier") return;
                const name = jsxName(element.name);
                if (!/^[A-Z]/.test(name)) return;
                const pkg = packageOf(name);
                if (!pkg || libraryImports(context).has(name) || isBound(context, node as Node, name)) return;
                context.report({ node: element.name as unknown as Node, messageId: "missing", data: { name, package: pkg }, fix: (fixer) => addImport(fixer, name, pkg) });
            },
        };
    },
};
