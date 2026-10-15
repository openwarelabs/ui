import { useId, useState, type Key } from "react";

import { Button, Card, cx, Menu, MenuLabel, Table, Text, Tooltip } from "@openwarelabs/ui";

import { BlockMenuItems } from "@blocks/shared/BlockMenuItems";
import { ChevronDownIcon, XIcon } from "@blocks/shared/icons";
import { hiddenColumns } from "@blocks/shared/tableColumns";
import type { List02Props } from "./List02.types";

/** A table with checkboxes. Once rows are selected, a bar takes over the card's header with what can be done to all of them. */
export function List02<Row extends object>({
    title,
    description,
    primaryAction,
    columns,
    rows,
    rowKey,
    rowLabel,
    defaultSort,
    selectedKeys,
    defaultSelectedKeys = [],
    onSelectionChange,
    bulkActions,
    summary,
    hint,
    labels = {},
    className,
    ...props
}: List02Props<Row>) {
    const id = useId();
    const [ownSelection, setOwnSelection] = useState<Key[]>(defaultSelectedKeys);
    const selected = selectedKeys ?? ownSelection;
    const select = (keys: Key[]) => {
        if (selectedKeys === undefined) setOwnSelection(keys);
        onSelectionChange?.(keys);
    };

    const keyOf = (row: Row): Key => (typeof rowKey === "function" ? rowKey(row) : ((row as Record<string, unknown>)[(rowKey ?? "id") as string] as Key));
    const chosen = rows.filter((row) => selected.includes(keyOf(row)));
    const actions = chosen.length && bulkActions ? bulkActions(chosen) : [];
    const caption = labels.caption ?? (typeof title === "string" ? title : "Rows");
    const clearLabel = labels.clearSelection ?? "Clear selection";

    return (
        <section className={cx("ow-list02", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-list02__inner">
                <div className="ow-list02__header">
                    <div>
                        <Text as="h2" variant="heading" id={`${id}-title`}>
                            {title}
                        </Text>
                        {description ? (
                            <Text variant="copy" className="ow-list02__lead">
                                {description}
                            </Text>
                        ) : null}
                    </div>
                    {primaryAction ? (
                        <Button
                            variant="primary"
                            startIcon={primaryAction.icon}
                            loading={primaryAction.loading}
                            disabled={primaryAction.disabled}
                            onClick={primaryAction.onClick}
                        >
                            {primaryAction.label}
                        </Button>
                    ) : null}
                </div>

                <Card padding="none" className="ow-list02__card" {...hiddenColumns(columns, 1)}>
                    {chosen.length ? (
                        <div className="ow-list02__bar" role="region" aria-label={labels.bar ?? "Selected rows"}>
                            <Text variant="label" tone="primary" className="ow-list02__selected" aria-live="polite">
                                {labels.selected ? labels.selected(chosen.length) : <>{chosen.length} selected</>}
                            </Text>
                            <div className="ow-list02__actions">
                                {actions.map((action, index) =>
                                    action.menu ? (
                                        <Menu
                                            key={index}
                                            label={typeof action.label === "string" ? action.label : "Actions"}
                                            trigger={
                                                <Button size="sm" endIcon={<ChevronDownIcon size={14} />} disabled={action.disabled}>
                                                    {action.label}
                                                </Button>
                                            }
                                        >
                                            {action.menuHeading ? <MenuLabel>{action.menuHeading}</MenuLabel> : null}
                                            <BlockMenuItems items={action.menu} />
                                        </Menu>
                                    ) : (
                                        <Button
                                            key={index}
                                            size="sm"
                                            variant={action.variant === "danger" ? "danger" : undefined}
                                            startIcon={action.icon}
                                            loading={action.loading}
                                            disabled={action.disabled}
                                            onClick={action.onClick}
                                        >
                                            {action.label}
                                        </Button>
                                    ),
                                )}
                            </div>
                            <span className="ow-list02__clear">
                                <Tooltip label={clearLabel}>
                                    <Button size="sm" variant="ghost" iconOnly aria-label={clearLabel} onClick={() => select([])}>
                                        <XIcon size={16} />
                                    </Button>
                                </Tooltip>
                            </span>
                        </div>
                    ) : (
                        <div className="ow-list02__top">
                            {summary}
                            {hint ? (
                                <Text variant="caption" className="ow-list02__hint">
                                    {hint}
                                </Text>
                            ) : null}
                        </div>
                    )}

                    <Table
                        variant="plain"
                        caption={caption}
                        hideCaption
                        columns={columns}
                        rows={rows}
                        rowKey={rowKey}
                        selectionMode="multiple"
                        selectedKeys={selected}
                        onSelectionChange={select}
                        rowLabel={rowLabel}
                        defaultSort={defaultSort}
                    />
                </Card>
            </div>
        </section>
    );
}
