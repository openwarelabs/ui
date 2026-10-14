import { useId, useState, useSyncExternalStore } from "react";

import { Badge, cx, SectionHeading, SegmentedControl, Table, Text, VisuallyHidden, type TableColumn } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { CheckIcon, MinusIcon } from "@blocks/shared/icons";
import type { Pricing03Props, Pricing03Row, Pricing03Value } from "./Pricing03.types";

const phoneQuery = "(max-width: 760px)";

/** Whether the window is phone-sized, following it as it changes. */
function useIsPhone() {
    return useSyncExternalStore(
        (onChange) => {
            const list = window.matchMedia(phoneQuery);
            list.addEventListener("change", onChange);
            return () => list.removeEventListener("change", onChange);
        },
        () => window.matchMedia(phoneQuery).matches,
        () => false,
    );
}

const caption = (title: string) => `${title}, by plan`;

/** Every feature down the side and a tick, a dash or a limit for each plan; one plan at a time on phones. */
export function Pricing03({ eyebrow, title, description, plans, groups, pricesNote, defaultPlan, note, labels = {}, className, ...props }: Pricing03Props) {
    const id = useId();
    const isPhone = useIsPhone();
    const [picked, setPicked] = useState(() => defaultPlan ?? (plans.find((plan) => plan.recommended) ?? plans[0])?.id ?? "");
    const shown = isPhone ? plans.filter((plan) => plan.id === picked) : plans;

    const cell = (value: Pricing03Value) => {
        if (value === true) {
            return (
                <span className="ow-pricing03__yes">
                    <CheckIcon size={14} strokeWidth={2.5} />
                    <VisuallyHidden>{labels.included ?? "Included"}</VisuallyHidden>
                </span>
            );
        }
        if (value === false) {
            return (
                <span className="ow-pricing03__no">
                    <MinusIcon size={16} />
                    <VisuallyHidden>{labels.notIncluded ?? "Not included"}</VisuallyHidden>
                </span>
            );
        }
        return value;
    };

    const columns = (groupTitle: string): Array<TableColumn<Pricing03Row & { id: string }>> => [
        {
            key: "feature",
            header: groupTitle,
            render: (row) => (
                <Text as="span" variant="body" className="ow-pricing03__feature">
                    {row.feature}
                    {row.note ? (
                        <Text variant="caption" className="ow-pricing03__feature-note">
                            {row.note}
                        </Text>
                    ) : null}
                </Text>
            ),
        },
        ...shown.map((plan) => ({
            key: plan.id,
            header: plan.name,
            render: (row: Pricing03Row) => cell(row.values[plan.id]),
        })),
    ];

    return (
        <section className={cx("ow-pricing03", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-pricing03__inner">
                <SectionHeading align="center" eyebrow={eyebrow} title={<span id={`${id}-title`}>{title}</span>} intro={description} />

                <div className="ow-pricing03__picker">
                    <SegmentedControl
                        aria-label={labels.picker ?? "Plan to compare"}
                        fullWidth
                        value={picked}
                        onChange={setPicked}
                        options={plans.map((plan) => ({ value: plan.id, label: plan.name }))}
                    />
                </div>

                <div className="ow-pricing03__plans">
                    {pricesNote ? (
                        <Text as="p" variant="caption" className="ow-pricing03__plans-label">
                            {pricesNote}
                        </Text>
                    ) : null}
                    {shown.map((plan) => (
                        <div key={plan.id} className="ow-pricing03__plan">
                            <Text as="p" variant="card-title" className="ow-pricing03__plan-name">
                                {plan.name}
                                {plan.badge ? (
                                    <Badge size="sm" variant="active">
                                        {plan.badge}
                                    </Badge>
                                ) : null}
                            </Text>
                            <Text as="p" variant="caption" className="ow-pricing03__plan-price">
                                <Text as="strong" variant="label" tone="default" className="ow-pricing03__plan-amount">
                                    {plan.price}
                                </Text>{" "}
                                {plan.unit}
                            </Text>
                            <BlockActionButton action={plan.action} variant={plan.recommended ? "primary" : "secondary"} size="sm" />
                        </div>
                    ))}
                </div>

                <div className="ow-pricing03__groups">
                    {groups.map((group) => (
                        <Table
                            key={group.title}
                            className="ow-pricing03__group"
                            caption={(labels.caption ?? caption)(group.title)}
                            hideCaption
                            columns={columns(group.title)}
                            rows={group.rows.map((row, index) => ({ ...row, id: `${group.title}-${index}` }))}
                        />
                    ))}
                </div>

                {note ? (
                    <Text as="p" variant="caption" align="center" className="ow-pricing03__note">
                        {note}
                    </Text>
                ) : null}
            </div>
        </section>
    );
}
