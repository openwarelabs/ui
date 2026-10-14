import { useId } from "react";

import { cx, SectionHeading, Tab, TabList, TabPanel, Tabs, Text, User } from "@openwarelabs/ui";

import { QuoteIcon } from "@blocks/shared/icons";
import type { Testimonial03Props } from "./Testimonial03.types";

/** Customers' logos as tabs, each showing a quote, the person, and a panel about their company. */
export function Testimonial03({ eyebrow, title, stories, defaultStory = 0, note, labels = {}, className, ...props }: Testimonial03Props) {
    const id = useId();
    return (
        <section className={cx("ow-testimonial03", className)} aria-labelledby={id} {...props}>
            <div className="ow-testimonial03__inner">
                <SectionHeading align="center" eyebrow={eyebrow} title={<span id={id}>{title}</span>} />

                <Tabs defaultValue={String(defaultStory)} variant="line" className="ow-testimonial03__tabs">
                    <TabList aria-label={labels.tabs ?? "Customers"}>
                        {stories.map((story, index) => (
                            <Tab key={story.company} value={String(index)} className="ow-testimonial03__tab">
                                {story.logo}
                            </Tab>
                        ))}
                    </TabList>

                    {stories.map((story, index) => (
                        <TabPanel key={story.company} value={String(index)} className="ow-testimonial03__panel">
                            <figure className="ow-testimonial03__card">
                                <div className="ow-testimonial03__body">
                                    <QuoteIcon size={18} className="ow-testimonial03__mark" />
                                    <blockquote className="ow-testimonial03__quote">
                                        <Text as="p" variant="heading" className="ow-testimonial03__text">
                                            {story.quote}
                                        </Text>
                                    </blockquote>
                                    <figcaption className="ow-testimonial03__person">
                                        <User name={story.name} description={story.jobTitle} src={story.avatar} size="lg" />
                                    </figcaption>
                                </div>
                                <div className="ow-testimonial03__company">
                                    {story.largeLogo ?? story.logo}
                                    {story.about ? (
                                        <Text variant="copy" className="ow-testimonial03__about">
                                            {story.about}
                                        </Text>
                                    ) : null}
                                    {story.facts?.length ? (
                                        <dl className="ow-testimonial03__facts">
                                            {story.facts.map((fact, factIndex) => (
                                                <div key={factIndex} className="ow-testimonial03__fact">
                                                    <Text as="dt" variant="body" tone="muted">
                                                        {fact.label}
                                                    </Text>
                                                    <Text as="dd" variant="label" align="end">
                                                        {fact.value}
                                                    </Text>
                                                </div>
                                            ))}
                                        </dl>
                                    ) : null}
                                </div>
                            </figure>
                        </TabPanel>
                    ))}
                </Tabs>

                {note ? (
                    <Text as="p" variant="caption" align="center" className="ow-testimonial03__note">
                        {note}
                    </Text>
                ) : null}
            </div>
        </section>
    );
}
