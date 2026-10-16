// The library's stylesheets in the order they're joined: tokens first (generated), then base, then each
// component, with anything a component builds on placed before it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const cssOrder = [
    "styles/base.css",
    "components/Text/Text.css",
    "components/Spinner/Spinner.css",
    "components/Button/Button.css",
    "components/ToggleButtonGroup/ToggleButtonGroup.css",
    "components/Toolbar/Toolbar.css",
    "components/SegmentedControl/SegmentedControl.css",
    "components/Tabs/Tabs.css",
    "components/Input/Input.css",
    "components/DateField/DateField.css",
    "components/DateField/TimeRangeField.css",
    "components/Textarea/Textarea.css",
    "components/InlineEdit/InlineEdit.css",
    "components/Select/Select.css",
    "components/ListBox/ListBox.css",
    "components/TransferList/TransferList.css",
    "components/Combobox/Combobox.css",
    "components/TagInput/TagInput.css",
    "components/MentionInput/MentionInput.css",
    "components/Checkbox/Checkbox.css",
    "components/RadioGroup/RadioGroup.css",
    "components/Switch/Switch.css",
    "components/Slider/Slider.css",
    "components/Rating/Rating.css",
    "components/SignaturePad/SignaturePad.css",
    "components/NumberField/NumberField.css",
    "components/InputOTP/InputOTP.css",
    "components/FileDropZone/FileDropZone.css",
    "components/ImageCropper/ImageCropper.css",
    "components/UploadList/UploadList.css",
    "components/Field/Field.css",
    "components/Form/Form.css",
    "components/Badge/Badge.css",
    "components/Alert/Alert.css",
    "components/Banner/Banner.css",
    "components/Progress/Progress.css",
    "components/Meter/Meter.css",
    "components/PasswordInput/PasswordInput.css",
    "components/Tooltip/Tooltip.css",
    "components/Truncate/Truncate.css",
    "components/Toast/Toast.css",
    "components/Skeleton/Skeleton.css",
    "components/Dialog/Dialog.css",
    "components/Drawer/Drawer.css",
    "components/BottomSheet/BottomSheet.css",
    "components/Popover/Popover.css",
    "components/NotificationCenter/NotificationCenter.css",
    "components/Tour/Tour.css",
    "components/HoverCard/HoverCard.css",
    "components/Calendar/Calendar.css",
    "components/Calendar/DatePicker.css",
    "components/Calendar/RangeCalendar.css",
    "components/Calendar/DateRangePicker.css",
    "components/ColorPicker/ColorPicker.css",
    "components/ColorPicker/ColorArea.css",
    "components/ColorPicker/ColorSlider.css",
    "components/ColorPicker/ColorSwatchPicker.css",
    "components/CommandPalette/CommandPalette.css",
    "components/Menu/Menu.css",
    "components/ContextMenu/ContextMenu.css",
    "components/Accordion/Accordion.css",
    "components/Collapsible/Collapsible.css",
    "components/Breadcrumbs/Breadcrumbs.css",
    "components/Pagination/Pagination.css",
    "components/Steps/Steps.css",
    "components/Wizard/Wizard.css",
    "components/Timeline/Timeline.css",
    "components/ChoiceCard/ChoiceCard.css",
    "components/Avatar/Avatar.css",
    "components/QRCode/QRCode.css",
    "components/Image/Image.css",
    "components/MediaPlayer/MediaPlayer.css",
    "components/Kbd/Kbd.css",
    "components/CodeBlock/CodeBlock.css",
    "components/DiffViewer/DiffViewer.css",
    "components/Tag/Tag.css",
    "components/SortableList/SortableList.css",
    "components/Kanban/Kanban.css",
    "components/Gantt/Gantt.css",
    "components/Table/Table.css",
    "components/DataGrid/DataGrid.css",
    "components/Stat/Stat.css",
    "components/Countdown/Countdown.css",
    "components/Carousel/Carousel.css",
    "components/Lightbox/Lightbox.css",
    "components/DescriptionList/DescriptionList.css",
    "components/Chart/Chart.css",
    "components/ActivityHeatmap/ActivityHeatmap.css",
    "components/FileTree/FileTree.css",
    "components/TreeView/TreeView.css",
    "components/JsonViewer/JsonViewer.css",
    "components/EmptyState/EmptyState.css",
    "components/Card/Card.css",
    "components/FocusTrap/FocusTrap.css",
    "components/NavList/NavList.css",
    "components/TableOfContents/TableOfContents.css",
    "components/NavigationMenu/NavigationMenu.css",
    "components/AppShell/AppShell.css",
    "components/Layout/Layout.css",
    "components/ScrollArea/ScrollArea.css",
    "components/Container/Container.css",
    "components/Section/Section.css",
    "components/Splitter/Splitter.css",
    "components/VirtualList/VirtualList.css",
    "components/AspectRatio/AspectRatio.css",
    "components/Affix/Affix.css",
    "components/Watermark/Watermark.css",
    "components/Marketing/Marketing.css",
    "components/Marquee/Marquee.css",
    "components/Prose/Prose.css",
    "components/Markdown/Markdown.css",
    "components/Callout/Callout.css",
    "components/MarkdownEditor/MarkdownEditor.css",
    "components/TextShimmer/TextShimmer.css",
    "components/PromptInput/PromptInput.css",
    "components/PromptInput/PromptSuggestion.css",
    "components/Chat/Chat.css",
    "components/CommentThread/CommentThread.css",
    "components/ChatTool/ChatTool.css",
    "components/ChainOfThought/ChainOfThought.css",
    "components/ChatSource/ChatSource.css",
    "components/LogViewer/LogViewer.css",
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

/** Every stylesheet of @openwarelabs/blocks, in source order: blocks/src/<category>/<Name>/<Name>.css. */
export function blockStylesheets() {
    const src = path.join(root, "blocks/src");
    if (!fs.existsSync(src)) return [];
    return fs
        .readdirSync(src, { recursive: true })
        .map(String)
        .filter((file) => file.endsWith(".css"))
        .sort()
        .map((file) => path.join(src, file));
}

/** The blocks' styles as one string, each file headed by its path. */
export function readBlockStyles() {
    return blockStylesheets()
        .map((file) => `/* ${path.relative(path.join(root, "blocks/src"), file)} */\n${fs.readFileSync(file, "utf8").trim()}\n`)
        .join("\n");
}
