import { useId } from "react";

import { Accordion, AccordionItem, cx, Link, SectionHeading, Text } from "@openwarelabs/ui";

import { ArrowRightIcon } from "@blocks/shared/icons";
import type { Faq02Props } from "./Faq02.types";

/** A heading on the left, the questions on the right. */
export function Faq02({ eyebrow, title, description, links, questions, defaultOpen, className, ...props }: Faq02Props) {
    const id = useId();
    const value = (index: number) => questions[index]?.id ?? String(index);
    return (
        <section className={cx("ow-faq02", className)} aria-labelledby={id} {...props}>
            <div className="ow-faq02__inner">
                <div className="ow-faq02__intro">
                    <SectionHeading eyebrow={eyebrow} title={<span id={id}>{title}</span>} intro={description} />
                    {links?.length ? (
                        <ul className="ow-faq02__links">
                            {links.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} variant="standalone">
                                        {link.label}
                                        <ArrowRightIcon size={14} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>

                <Accordion className="ow-faq02__list" type="multiple" defaultValue={defaultOpen ?? (questions.length ? [value(0)] : [])}>
                    {questions.map((item, index) => (
                        <AccordionItem key={value(index)} value={value(index)} title={item.question}>
                            <Text variant="copy" className="ow-faq02__answer">
                                {item.answer}
                            </Text>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
