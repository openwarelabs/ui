// The library's stylesheets in the order they're joined: tokens first (generated), then base, then each
// component, with anything a component builds on placed before it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const cssOrder = [
    "styles/base.css",
    "components/Spinner/Spinner.css",
    "components/Button/Button.css",
    "components/SegmentedControl/SegmentedControl.css",
    "components/Tabs/Tabs.css",
    "components/Input/Input.css",
    "components/Textarea/Textarea.css",
    "components/Select/Select.css",
    "components/Combobox/Combobox.css",
    "components/Checkbox/Checkbox.css",
    "components/RadioGroup/RadioGroup.css",
    "components/Switch/Switch.css",
    "components/Slider/Slider.css",
    "components/NumberField/NumberField.css",
    "components/InputOTP/InputOTP.css",
    "components/FileDropZone/FileDropZone.css",
    "components/Field/Field.css",
    "components/Badge/Badge.css",
    "components/Alert/Alert.css",
    "components/Progress/Progress.css",
    "components/Tooltip/Tooltip.css",
    "components/Toast/Toast.css",
    "components/Skeleton/Skeleton.css",
    "components/Dialog/Dialog.css",
    "components/Drawer/Drawer.css",
    "components/Popover/Popover.css",
    "components/Calendar/Calendar.css",
    "components/Calendar/DatePicker.css",
    "components/ColorPicker/ColorPicker.css",
    "components/CommandPalette/CommandPalette.css",
    "components/Menu/Menu.css",
    "components/Accordion/Accordion.css",
    "components/Breadcrumbs/Breadcrumbs.css",
    "components/Pagination/Pagination.css",
    "components/Steps/Steps.css",
    "components/ChoiceCard/ChoiceCard.css",
    "components/Avatar/Avatar.css",
    "components/Kbd/Kbd.css",
    "components/CodeBlock/CodeBlock.css",
    "components/Tag/Tag.css",
    "components/Table/Table.css",
    "components/Stat/Stat.css",
    "components/FileTree/FileTree.css",
    "components/EmptyState/EmptyState.css",
    "components/Card/Card.css",
    "components/NavList/NavList.css",
    "components/Layout/Layout.css",
    "components/Marketing/Marketing.css",
];

/** Every component stylesheet must be listed, so a new one can't be left out of the build by accident. */
export function checkCssOrder() {
    const missing = fs
        .readdirSync(path.join(root, "src/components"), { recursive: true })
        .filter((file) => String(file).endsWith(".css"))
        .map((file) => `components/${String(file).split(path.sep).join("/")}`)
        .filter((file) => !cssOrder.includes(file));
    if (missing.length) throw new Error(`CSS not in the build order (scripts/css.mjs): ${missing.join(", ")}`);
}

/** tokens.css plus every component stylesheet, as one string. */
export function readStyles() {
    checkCssOrder();
    const read = (file) => fs.readFileSync(path.join(root, "src", file), "utf8");
    const tokens = read("styles/tokens.css");
    const components = cssOrder.map((file) => `/* ${file} */\n${read(file)}`).join("\n");
    return { tokens, components };
}
