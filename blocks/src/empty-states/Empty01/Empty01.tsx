import { useState } from "react";

import { Badge, Button, ChoiceCard, cx, Dialog, EmptyState, Field, Input, Separator, Text, toast } from "@openwarelabs/ui";

import { PlusIcon } from "@blocks/shared/icons";
import type { Empty01Item, Empty01Props } from "./Empty01.types";

const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** A first-run page: what will be here, the button that makes the first one, and other ways to start. */
export function Empty01({
    title,
    description,
    icon,
    emptyTitle,
    emptyDescription,
    ways = [],
    defaultItems = [],
    onCreate,
    onRemove,
    namePattern = slug,
    labels = {},
    className,
    ...props
}: Empty01Props) {
    const [items, setItems] = useState<Empty01Item[]>(defaultItems);
    const [open, setOpen] = useState(false);
    // The way picked, or null for the main button.
    const [wayId, setWayId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const way = ways.find((entry) => entry.id === wayId);
    const createLabel = labels.create ?? "Create project";

    const start = (next: string | null) => {
        setWayId(next);
        setOpen(true);
        setName("");
        setError("");
    };

    const create = () => {
        const value = name.trim();
        if (!value) return setError(labels.nameRequired ?? "Give the project a name.");
        if (!namePattern.test(value)) return setError(labels.nameInvalid ?? "Use only lowercase letters, numbers and dashes.");
        if (items.some((item) => item.name === value))
            return setError(labels.nameTaken ? labels.nameTaken(value) : `There's already a project called ${value}.`);
        const item: Empty01Item = { name: value, source: way ? way.source : (labels.blankSource ?? "Blank project"), way: way?.id };
        setItems((list) => [...list, item]);
        setOpen(false);
        onCreate?.(item);
        toast.success(labels.created ? labels.created(value) : `Created ${value}`, {
            action: {
                label: labels.undo ?? "Undo",
                onClick: () => {
                    setItems((list) => list.filter((entry) => entry.name !== value));
                    onRemove?.(item);
                },
            },
        });
    };

    return (
        <div className={cx("ow-empty01", className)} {...props}>
            <main className="ow-empty01__panel">
                <div className="ow-empty01__header">
                    <div>
                        <Text variant="heading" as="h2">
                            {title}
                        </Text>
                        {description ? (
                            <Text variant="copy" className="ow-empty01__subtitle">
                                {description}
                            </Text>
                        ) : null}
                    </div>
                    {items.length > 0 ? (
                        <Button variant="primary" startIcon={<PlusIcon size={16} />} onClick={() => start(null)}>
                            {labels.newItem ?? "New project"}
                        </Button>
                    ) : null}
                </div>

                {items.length === 0 ? (
                    <div className="ow-empty01__area">
                        <EmptyState
                            icon={icon}
                            title={emptyTitle}
                            description={emptyDescription}
                            actions={
                                <Button variant="primary" startIcon={<PlusIcon size={16} />} onClick={() => start(null)}>
                                    {createLabel}
                                </Button>
                            }
                        />
                        {ways.length ? (
                            <div className="ow-empty01__ways">
                                <Separator label={labels.otherWays ?? "or start another way"} spacing="2xl" />
                                <div className="ow-empty01__choices">
                                    {ways.map((entry) => (
                                        <ChoiceCard
                                            key={entry.id}
                                            icon={entry.icon}
                                            title={entry.title}
                                            description={entry.description}
                                            recommended={entry.recommended}
                                            onClick={() => start(entry.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <ul className="ow-empty01__list" aria-label={labels.list ?? "Projects"}>
                        {items.map((item) => (
                            <li key={item.name} className="ow-empty01__row">
                                <span className="ow-empty01__dot" aria-hidden="true" />
                                <span className="ow-empty01__name">
                                    <Text variant="label" truncate>
                                        {item.name}
                                    </Text>
                                    {item.source ? <Text variant="caption">{item.source}</Text> : null}
                                </span>
                                <Text variant="caption" className="ow-empty01__when">
                                    {labels.createdJustNow ?? "Created just now"}
                                </Text>
                                <Badge size="sm" variant="active">
                                    {labels.newBadge ?? "New"}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                title={way ? (way.dialogTitle ?? way.title) : (labels.dialogTitle ?? "Create a project")}
                description={way ? way.dialogDescription : (labels.dialogDescription ?? "An empty project. Connect a repository to it whenever you're ready.")}
                onSubmit={create}
                actions={
                    <>
                        <Button onClick={() => setOpen(false)}>{labels.cancel ?? "Cancel"}</Button>
                        <Button type="submit" variant="primary">
                            {way ? (labels.continue ?? "Continue") : createLabel}
                        </Button>
                    </>
                }
            >
                <Field
                    label={labels.name ?? "Project name"}
                    hint={error ? undefined : (labels.nameHint ?? "Lowercase letters, numbers and dashes.")}
                    error={error || undefined}
                >
                    <Input
                        autoFocus
                        placeholder={labels.placeholder ?? "billing-api"}
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                            if (error) setError("");
                        }}
                    />
                </Field>
            </Dialog>
        </div>
    );
}
