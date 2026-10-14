import { useId } from "react";

import { cx, SectionHeading, Tab, TabList, TabPanel, Tabs, Text } from "@openwarelabs/ui";

import type { Features04Props } from "./Features04.types";

/** A row of tabs, each showing its part of the product with a caption above it. */
export function Features04({ eyebrow, title, description, tabs, defaultTab = 0, labels = {}, className, ...props }: Features04Props) {
    const id = useId();
    return (
        <section className={cx("ow-features04", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-features04__inner">
                <SectionHeading align="center" eyebrow={eyebrow} title={<span id={`${id}-title`}>{title}</span>} intro={description} />

                <Tabs defaultValue={String(defaultTab)} className="ow-features04__tabs">
                    <TabList aria-label={labels.tabs ?? "Features"}>
                        {tabs.map((tab, index) => (
                            <Tab key={index} value={String(index)} icon={tab.icon}>
                                {tab.label}
                            </Tab>
                        ))}
                    </TabList>
                    {tabs.map((tab, index) => (
                        <TabPanel key={index} value={String(index)} className="ow-features04__panel">
                            {tab.caption ? (
                                <Text variant="copy" align="center" className="ow-features04__caption">
                                    {tab.caption}
                                </Text>
                            ) : null}
                            {tab.visual}
                        </TabPanel>
                    ))}
                </Tabs>
            </div>
        </section>
    );
}
