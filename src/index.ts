// Openware UI. Import the components from here and the CSS once:
//   import "@openwarelabs/ui/fonts.css";
//   import "@openwarelabs/ui/styles.css";

// Typography
export { Text } from "./components/Text/Text";
export type { TextProps, TextVariant, TextTone } from "./components/Text/Text";

// Buttons
export { Button, buttonClassName } from "./components/Button/Button";
export type { ButtonProps, ButtonStyleOptions, ButtonVariant, ButtonSize, ButtonShape } from "./components/Button/Button";
export { ButtonGroup, CloseButton, ToggleButton } from "./components/Button/ButtonGroup";
export type { ButtonGroupProps, CloseButtonProps, ToggleButtonProps } from "./components/Button/ButtonGroup";
export { SegmentedControl } from "./components/SegmentedControl/SegmentedControl";
export type { SegmentedControlProps, SegmentedControlOption } from "./components/SegmentedControl/SegmentedControl";
export { ChoiceCard } from "./components/ChoiceCard/ChoiceCard";
export type { ChoiceCardProps } from "./components/ChoiceCard/ChoiceCard";
export { CopyButton, CodeBlock, Snippet } from "./components/CodeBlock/CodeBlock";
export type { CopyButtonProps, CodeBlockProps, SnippetProps } from "./components/CodeBlock/CodeBlock";
export { ToggleButtonGroup } from "./components/ToggleButtonGroup/ToggleButtonGroup";
export type {
    ToggleButtonGroupProps,
    ToggleButtonGroupOption,
    ToggleButtonGroupSingleProps,
    ToggleButtonGroupMultipleProps,
} from "./components/ToggleButtonGroup/ToggleButtonGroup";
export { Toolbar, ToolbarSeparator } from "./components/Toolbar/Toolbar";
export type { ToolbarProps, ToolbarSeparatorProps } from "./components/Toolbar/Toolbar";

// Forms
export { Field } from "./components/Field/Field";
export type { FieldProps } from "./components/Field/Field";
export { Form, FormError, useFormStatus } from "./components/Form/Form";
export type { FormProps, FormErrorProps, FormStatus, FormValues, FormErrors, ValidityCheck, ValidityMessages } from "./components/Form/Form";
export { Input } from "./components/Input/Input";
export type { InputProps } from "./components/Input/Input";
export { SearchField } from "./components/SearchField/SearchField";
export type { SearchFieldProps } from "./components/SearchField/SearchField";
export { NumberField } from "./components/NumberField/NumberField";
export type { NumberFieldProps } from "./components/NumberField/NumberField";
export { InputOTP } from "./components/InputOTP/InputOTP";
export type { InputOTPProps } from "./components/InputOTP/InputOTP";
export { DateField } from "./components/DateField/DateField";
export type { DateFieldProps } from "./components/DateField/DateField";
export { TimeField } from "./components/DateField/TimeField";
export type { TimeFieldProps } from "./components/DateField/TimeField";
export { Textarea } from "./components/Textarea/Textarea";
export type { TextareaProps } from "./components/Textarea/Textarea";
export { Select } from "./components/Select/Select";
export type { SelectProps, SelectOption, SelectGroup, SelectItem } from "./components/Select/Select";
export { ListBox } from "./components/ListBox/ListBox";
export type { ListBoxProps, ListBoxModeProps, ListBoxOption, ListBoxGroup, ListBoxItem, ListBoxSelectionMode } from "./components/ListBox/ListBox";
export { Combobox } from "./components/Combobox/Combobox";
export type { ComboboxProps, ComboboxOption } from "./components/Combobox/Combobox";
export { Checkbox, CheckboxGroup, Fieldset } from "./components/Checkbox/Checkbox";
export type { CheckboxProps, CheckboxGroupProps, FieldsetProps } from "./components/Checkbox/Checkbox";
export { RadioGroup, Radio } from "./components/RadioGroup/RadioGroup";
export type { RadioGroupProps, RadioProps } from "./components/RadioGroup/RadioGroup";
export { Switch } from "./components/Switch/Switch";
export type { SwitchProps } from "./components/Switch/Switch";
export { Slider } from "./components/Slider/Slider";
export type { SliderProps } from "./components/Slider/Slider";
export { FileDropZone } from "./components/FileDropZone/FileDropZone";
export type { FileDropZoneProps } from "./components/FileDropZone/FileDropZone";

// Dates
export { Calendar } from "./components/Calendar/Calendar";
export type { CalendarProps, CalendarHandle } from "./components/Calendar/Calendar";
export { DatePicker } from "./components/Calendar/DatePicker";
export type { DatePickerProps } from "./components/Calendar/DatePicker";
export { RangeCalendar } from "./components/Calendar/RangeCalendar";
export type { RangeCalendarProps, DateRange } from "./components/Calendar/RangeCalendar";
export { formatDateRange } from "./components/Calendar/dates";
export { DateRangePicker } from "./components/Calendar/DateRangePicker";
export type { DateRangePickerProps, DateRangePreset } from "./components/Calendar/DateRangePicker";
export { todayISO, addDays, addMonths, formatDate, weekday, parseISO, toISO } from "./components/Calendar/dates";
export type { ISODate } from "./components/Calendar/dates";

// Feedback
export { Alert } from "./components/Alert/Alert";
export type { AlertProps, AlertVariant } from "./components/Alert/Alert";
export { Badge } from "./components/Badge/Badge";
export type { BadgeProps, BadgeVariant } from "./components/Badge/Badge";
export { ProgressBar, ProgressCircle } from "./components/Progress/Progress";
export type { ProgressBarProps, ProgressCircleProps, ProgressTone } from "./components/Progress/Progress";
export { Meter } from "./components/Meter/Meter";
export type { MeterProps } from "./components/Meter/Meter";
export { Spinner } from "./components/Spinner/Spinner";
export type { SpinnerProps } from "./components/Spinner/Spinner";
export { Skeleton, SkeletonRows } from "./components/Skeleton/Skeleton";
export type { SkeletonProps, SkeletonRowsProps } from "./components/Skeleton/Skeleton";
export { Toaster, toast } from "./components/Toast/Toast";
export type { ToasterProps, ToastOptions } from "./components/Toast/Toast";
export { Tooltip } from "./components/Tooltip/Tooltip";
export type { TooltipProps } from "./components/Tooltip/Tooltip";

// Overlays
export { Dialog, ConfirmDialog } from "./components/Dialog/Dialog";
export type { DialogProps, ConfirmDialogProps } from "./components/Dialog/Dialog";
export { Drawer } from "./components/Drawer/Drawer";
export type { DrawerProps } from "./components/Drawer/Drawer";
export { Popover } from "./components/Popover/Popover";
export type { PopoverProps } from "./components/Popover/Popover";
export { Menu, MenuItem, MenuLabel, MenuSeparator } from "./components/Menu/Menu";
export type { MenuProps, MenuItemProps } from "./components/Menu/Menu";
export { CommandPalette } from "./components/CommandPalette/CommandPalette";
export type { Command, CommandPaletteProps } from "./components/CommandPalette/CommandPalette";
export { filterCommands } from "./components/CommandPalette/filterCommands";

// Navigation
export { Tabs, TabList, Tab, TabPanel } from "./components/Tabs/Tabs";
export type { TabsProps, TabListProps, TabProps, TabPanelProps } from "./components/Tabs/Tabs";
export { Accordion, AccordionItem, Disclosure } from "./components/Accordion/Accordion";
export type { AccordionProps, AccordionItemProps, DisclosureProps } from "./components/Accordion/Accordion";
export { Breadcrumbs, Link, linkClassName } from "./components/Breadcrumbs/Breadcrumbs";
export type { BreadcrumbsProps, BreadcrumbItem, LinkProps, LinkStyleOptions } from "./components/Breadcrumbs/Breadcrumbs";
export { Pagination, paginationItems } from "./components/Pagination/Pagination";
export type { PaginationProps } from "./components/Pagination/Pagination";
export { Steps } from "./components/Steps/Steps";
export type { StepsProps, StepItem } from "./components/Steps/Steps";
export { NavList, NavItem } from "./components/NavList/NavList";
export type { NavListProps, NavItemProps } from "./components/NavList/NavList";
export { AppShell, SidebarHeader, SidebarContent, SidebarFooter, SidebarToggle, useAppShell } from "./components/AppShell/AppShell";
export type { AppShellProps, AppShellState, SidebarSectionProps, SidebarToggleProps } from "./components/AppShell/AppShell";

// Data display
export { Table } from "./components/Table/Table";
export type { TableProps, TableColumn, TableSort } from "./components/Table/Table";
export { Stat } from "./components/Stat/Stat";
export type { StatProps } from "./components/Stat/Stat";
export { Timeline, TimelineItem } from "./components/Timeline/Timeline";
export type { TimelineProps, TimelineItemProps, TimelineTone } from "./components/Timeline/Timeline";
export { LineChart, BarChart, DonutChart, Sparkline } from "./components/Chart/Chart";
export type {
    BarChartProps,
    CartesianChartProps,
    ChartColor,
    ChartRow,
    ChartSeries,
    DonutChartProps,
    DonutChartSlice,
    LineChartProps,
    SparklineProps,
} from "./components/Chart/Chart";
export { FileTree } from "./components/FileTree/FileTree";
export type { FileTreeProps, FileTreeNode } from "./components/FileTree/FileTree";
export { EmptyState } from "./components/EmptyState/EmptyState";
export type { EmptyStateProps } from "./components/EmptyState/EmptyState";
export { Tag, TagGroup, ColorSwatch } from "./components/Tag/Tag";
export type { TagProps, TagGroupProps, ColorSwatchProps } from "./components/Tag/Tag";
export { Avatar } from "./components/Avatar/Avatar";
export type { AvatarProps, AvatarSize } from "./components/Avatar/Avatar";
export { AvatarGroup, User } from "./components/Avatar/AvatarGroup";
export type { AvatarGroupProps, UserProps } from "./components/Avatar/AvatarGroup";
export { Image } from "./components/Image/Image";
export type { ImageProps, ImageFit, ImageRadius } from "./components/Image/Image";
export { Kbd, Code } from "./components/Kbd/Kbd";

// Layout
export { Card, SettingsRow } from "./components/Card/Card";
export type { CardProps, SettingsRowProps } from "./components/Card/Card";
export { Stack, Separator, ScrollShadow, VisuallyHidden } from "./components/Layout/Layout";
export { Container } from "./components/Container/Container";
export type { ContainerProps, ContainerSize } from "./components/Container/Container";
export { AspectRatio } from "./components/AspectRatio/AspectRatio";
export type { AspectRatioProps } from "./components/AspectRatio/AspectRatio";
export { Section } from "./components/Section/Section";
export type { SectionProps } from "./components/Section/Section";
export type { StackProps, SeparatorProps, ScrollShadowProps, SpaceToken } from "./components/Layout/Layout";

// Marketing
export { Chip, SectionHeading, SiteHeader, DotGrid } from "./components/Marketing/Marketing";
export type { SectionHeadingProps, SiteHeaderProps, DotGridProps } from "./components/Marketing/Marketing";

// AI
export { Prose } from "./components/Prose/Prose";
export type { ProseProps } from "./components/Prose/Prose";
export { TextShimmer } from "./components/TextShimmer/TextShimmer";
export type { TextShimmerProps } from "./components/TextShimmer/TextShimmer";
export { PromptInput } from "./components/PromptInput/PromptInput";
export type { PromptInputProps, PromptAttachment } from "./components/PromptInput/PromptInput";
export { PromptSuggestion, PromptSuggestions } from "./components/PromptInput/PromptSuggestion";
export type { PromptSuggestionProps, PromptSuggestionsProps } from "./components/PromptInput/PromptSuggestion";
export { ChatConversation } from "./components/Chat/ChatConversation";
export type { ChatConversationProps, ChatConversationHandle } from "./components/Chat/ChatConversation";
export { ChatMessage, ChatMessageActions, ChatAgentAvatar } from "./components/Chat/ChatMessage";
export type {
    ChatMessageProps,
    ChatMessageActionsProps,
    ChatAgentAvatarProps,
    ChatMessageFrom,
    ChatMessageStatus,
    ChatRating,
} from "./components/Chat/ChatMessage";
export { ChatLoader } from "./components/Chat/ChatLoader";
export type { ChatLoaderProps } from "./components/Chat/ChatLoader";
export { ChatTool } from "./components/ChatTool/ChatTool";
export type { ChatToolProps, ChatToolStatus } from "./components/ChatTool/ChatTool";
export { ChainOfThought } from "./components/ChainOfThought/ChainOfThought";
export type { ChainOfThoughtProps, ChainOfThoughtStep, ChainOfThoughtStatus } from "./components/ChainOfThought/ChainOfThought";
export { ChatSource, ChatSources } from "./components/ChatSource/ChatSource";
export type { ChatSourceProps, ChatSourcesProps, ChatSourceItem } from "./components/ChatSource/ChatSource";

// Hooks and helpers
export { ColorField, ColorPicker } from "./components/ColorPicker/ColorPicker";
export type { ColorFieldProps, ColorPickerProps, ColorSwatchOption } from "./components/ColorPicker/ColorPicker";
export { ColorArea } from "./components/ColorPicker/ColorArea";
export type { ColorAreaProps } from "./components/ColorPicker/ColorArea";
export { ColorSlider } from "./components/ColorPicker/ColorSlider";
export type { ColorChannel, ColorSliderProps } from "./components/ColorPicker/ColorSlider";
export { ColorSwatchPicker } from "./components/ColorPicker/ColorSwatchPicker";
export type { ColorSwatchPickerOption, ColorSwatchPickerProps } from "./components/ColorPicker/ColorSwatchPicker";
export { applyBrand, brandCss, brandPresets, brandScale, brandSteps, brandVariables } from "./utils/brand";
export type { BrandPreset, BrandScale, BrandStep } from "./utils/brand";
export { useModalDialog } from "./hooks/useModalDialog";
export { useMenuKeyboard } from "./hooks/useMenuKeyboard";
export { useControllableState } from "./hooks/useControllableState";
export { useFloating, useDismiss } from "./hooks/useFloating";
export { usePresence } from "./hooks/usePresence";
export type { Presence } from "./hooks/usePresence";
export type { Placement } from "./hooks/useFloating";
export { cx } from "./utils/cx";
export { getInitials } from "./utils/text";
export { copyText } from "./utils/copyText";
