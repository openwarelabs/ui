import { useId } from "react";

import { Accordion, AccordionItem, cx, SectionHeading, Text } from "@openwarelabs/ui";

import type { Faq01Props } from "./Faq01.types";

/** Questions in an accordion that opens one at a time, under a centred heading. */
export function Faq01({ eyebrow, title, description, questions, defaultOpen, note, className, ...props }: Faq01Props) {
    const id = useId();
    const value = (index: number) => questions[index]?.id ?? String(index);
    return (
        <section className={cx("ow-faq01", className)} aria-labelledby={id} {...props}>
            <div className="ow-faq01__inner">
                <SectionHeading align="center" eyebrow={eyebrow} title={<span id={id}>{title}</span>} intro={description} />

                <Accordion className="ow-faq01__list" defaultValue={defaultOpen ?? (questions.length ? [value(0)] : [])}>
                    {questions.map((item, index) => (
                        <AccordionItem key={value(index)} value={value(index)} title={item.question}>
                            <Text variant="copy" className="ow-faq01__answer">
                                {item.answer}
                            </Text>
                        </AccordionItem>
                    ))}
                </Accordion>

                {note ? (
                    <Text variant="body" tone="muted" align="center" className="ow-faq01__more">
                        {note}
                    </Text>
                ) : null}
            </div>
        </section>
    );
}
