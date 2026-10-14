import { useEffect, useId, useRef, useState } from "react";

import { cx, Select, SettingsRow, Switch, Text, VisuallyHidden } from "@openwarelabs/ui";

import { CheckIcon } from "@blocks/shared/icons";
import type { Notifications03Props, Notifications03Value } from "./Notifications03.types";

/** Notification settings: a grid of switches with events down the side and channels across the top, and delivery settings under it. */
export function Notifications03({
    title,
    description,
    channels,
    groups,
    value,
    defaultValue = {},
    onChange,
    options = [],
    onOptionChange,
    labels = {},
    className,
    ...props
}: Notifications03Props) {
    const id = useId();
    const [ownValue, setOwnValue] = useState<Notifications03Value>(defaultValue);
    const settings = value ?? ownValue;
    const [optionValues, setOptionValues] = useState<Record<string, string | boolean>>(() =>
        Object.fromEntries(options.map((option) => [option.id, option.defaultValue])),
    );
    const [saved, setSaved] = useState(false);
    const timer = useRef(0);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    // Each change saves at once; say so for a moment.
    const save = () => {
        setSaved(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setSaved(false), 2000);
    };

    const toggle = (event: string, channel: string, on: boolean) => {
        const current = settings[event] ?? [];
        const next = { ...settings, [event]: on ? [...current, channel] : current.filter((other) => other !== channel) };
        setOwnValue(next);
        onChange?.(next, { event, channel, on });
        save();
    };

    const setOption = (option: string, next: string | boolean) => {
        setOptionValues((current) => ({ ...current, [option]: next }));
        onOptionChange?.(option, next);
        save();
    };

    return (
        <section className={cx("ow-notifications03", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-notifications03__panel">
                <div>
                    <div className="ow-notifications03__header">
                        <Text variant="heading" as="h2" id={`${id}-title`}>
                            {title}
                        </Text>
                        <Text variant="caption" tone="success" className="ow-notifications03__saved" role="status" data-hidden={saved ? undefined : ""}>
                            {saved ? (
                                <>
                                    <CheckIcon size={15} />
                                    {labels.saved ?? "Saved"}
                                </>
                            ) : null}
                        </Text>
                    </div>
                    {description ? (
                        <Text variant="copy" className="ow-notifications03__subtitle">
                            {description}
                        </Text>
                    ) : null}
                </div>

                <div className="ow-notifications03__card">
                    <table className="ow-notifications03__grid">
                        <thead>
                            <tr>
                                <th scope="col" className="ow-notifications03__corner">
                                    <Text variant="caption">{labels.event ?? "Event"}</Text>
                                </th>
                                {channels.map((channel) => (
                                    <th key={channel.id} scope="col" className="ow-notifications03__channel" id={`${id}-${channel.id}`}>
                                        <Text variant="label" tone="soft" className="ow-notifications03__channel-label">
                                            {channel.icon}
                                            {channel.label}
                                        </Text>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        {groups.map((group, groupIndex) => (
                            <tbody key={groupIndex}>
                                <tr className="ow-notifications03__group">
                                    <th scope="colgroup" colSpan={channels.length + 1}>
                                        <Text variant="overline">{group.label}</Text>
                                    </th>
                                </tr>
                                {group.events.map((event) => {
                                    const on = settings[event.id] ?? [];
                                    const rowId = `${id}-event-${event.id}`;
                                    return (
                                        <tr key={event.id}>
                                            <th scope="row" className="ow-notifications03__event">
                                                <span className="ow-notifications03__event-label">
                                                    <Text as="span" id={rowId}>
                                                        {event.label}
                                                    </Text>
                                                    {on.length === 0 ? <Text variant="caption">{labels.muted ?? "Muted"}</Text> : null}
                                                </span>
                                                {event.description ? (
                                                    <Text variant="caption" className="ow-notifications03__event-description">
                                                        {event.description}
                                                    </Text>
                                                ) : null}
                                            </th>
                                            {channels.map((channel) => (
                                                <td key={channel.id}>
                                                    <span className="ow-notifications03__cell">
                                                        {event.unavailable?.includes(channel.id) ? (
                                                            <span className="ow-notifications03__unavailable">
                                                                <span aria-hidden="true">–</span>
                                                                <VisuallyHidden>
                                                                    {labels.unavailable
                                                                        ? labels.unavailable(channel.label)
                                                                        : `Not sent by ${channel.label.toLowerCase()}`}
                                                                </VisuallyHidden>
                                                            </span>
                                                        ) : (
                                                            <Switch
                                                                checked={on.includes(channel.id)}
                                                                onChange={(checked) => toggle(event.id, channel.id, checked)}
                                                                aria-labelledby={`${id}-${channel.id} ${rowId}`}
                                                            />
                                                        )}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        ))}
                    </table>
                </div>

                {options.length ? (
                    <div>
                        <Text variant="card-title" className="ow-notifications03__section-title">
                            {labels.options ?? "Delivery"}
                        </Text>
                        <div className="ow-notifications03__rows">
                            {options.map((option) => (
                                <SettingsRow key={option.id} label={option.label} description={option.description}>
                                    {option.kind === "select" ? (
                                        <Select
                                            aria-label={option.label}
                                            size="sm"
                                            value={String(optionValues[option.id] ?? option.defaultValue)}
                                            options={option.options}
                                            onChange={(next) => setOption(option.id, next)}
                                        />
                                    ) : (
                                        <Switch
                                            label={option.label}
                                            checked={Boolean(optionValues[option.id] ?? option.defaultValue)}
                                            onChange={(checked) => setOption(option.id, checked)}
                                        />
                                    )}
                                </SettingsRow>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
