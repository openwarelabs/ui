import { useEffect, useId, useState } from "react";

import { Card, cx, NavItem, NavList, Text } from "@openwarelabs/ui";

import { CheckIcon } from "@blocks/shared/icons";
import type { Settings02Props } from "./Settings02.types";

/** The settings dialog's sections as a page: the list of sections on the left, the chosen one's cards of rows beside it. */
export function Settings02({
    title,
    description,
    sections,
    section: sectionProp,
    defaultSection,
    onSectionChange,
    savedAt,
    labels = {},
    className,
    ...props
}: Settings02Props) {
    const sectionId = useId();
    const [sectionState, setSectionState] = useState(defaultSection ?? sections[0]?.id);
    const [saved, setSaved] = useState(false);
    const [shownSave, setShownSave] = useState(savedAt);

    // Each change saves straight away; "Saved" shows beside the heading for a moment to say so.
    if (savedAt !== shownSave) {
        setShownSave(savedAt);
        if (savedAt !== undefined) setSaved(true);
    }
    useEffect(() => {
        if (!saved) return undefined;
        const timer = window.setTimeout(() => setSaved(false), 2000);
        return () => window.clearTimeout(timer);
    }, [saved, savedAt]);

    const current = sections.find((entry) => entry.id === (sectionProp ?? sectionState)) ?? sections[0];
    const choose = (id: string) => {
        setSectionState(id);
        onSectionChange?.(id);
    };
    const navItems = sections.map(({ id, label, icon }) => (
        <NavItem key={id} icon={icon} active={current?.id === id} onClick={() => choose(id)}>
            {label}
        </NavItem>
    ));

    return (
        <div className={cx("ow-settings02", className)} {...props}>
            <div className="ow-settings02__inner">
                <header className="ow-settings02__header">
                    <Text variant="heading" as="h1">
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="copy" className="ow-settings02__lead">
                            {description}
                        </Text>
                    ) : null}
                </header>

                <div className="ow-settings02__layout">
                    {/* Down the left on wider screens; a sideways strip on phones. */}
                    <NavList label={labels.sections ?? "Settings sections"} className="ow-settings02__nav ow-settings02__nav--side">
                        {navItems}
                    </NavList>
                    <NavList label={labels.sections ?? "Settings sections"} orientation="horizontal" className="ow-settings02__nav ow-settings02__nav--top">
                        {navItems}
                    </NavList>

                    {current ? (
                        <section className="ow-settings02__section" aria-labelledby={sectionId}>
                            <div className="ow-settings02__section-header">
                                <div>
                                    <Text variant="dialog-title" as="h2" id={sectionId}>
                                        {current.label}
                                    </Text>
                                    {current.description ? (
                                        <Text variant="copy" className="ow-settings02__section-text">
                                            {current.description}
                                        </Text>
                                    ) : null}
                                </div>
                                <Text variant="caption" tone="success" className="ow-settings02__saved" data-visible={saved || undefined} role="status">
                                    {saved ? (
                                        <>
                                            <CheckIcon size={14} />
                                            {labels.saved ?? "Saved"}
                                        </>
                                    ) : null}
                                </Text>
                            </div>
                            {current.groups.map((group, index) => (
                                <div key={index} className="ow-settings02__group">
                                    {group.title ? (
                                        <Text variant="label" as="h3" tone="muted">
                                            {group.title}
                                        </Text>
                                    ) : null}
                                    <Card padding="none" className="ow-settings02__card">
                                        {group.content}
                                    </Card>
                                </div>
                            ))}
                        </section>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
