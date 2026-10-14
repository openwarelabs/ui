import { useId, useRef, useState, type FormEvent } from "react";

import { Button, cx, Input, Link, Separator, Text } from "@openwarelabs/ui";

import { FooterColumns } from "@blocks/shared/FooterColumns";
import { CircleCheckIcon, MailIcon } from "@blocks/shared/icons";
import type { Footer03Props } from "./Footer03.types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A newsletter sign-up across the top, then the brand and columns of links, then the small print. */
export function Footer03({ newsletter, brand, description, columns, legal, legalLinks = [], labels = {}, className, ...props }: Footer03Props) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [sentTo, setSentTo] = useState("");
    const input = useRef<HTMLInputElement>(null);
    const id = useId();

    const subscribe = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const address = email.trim();
        if (!address) setError(labels.empty ?? "Enter your email address.");
        else if (!emailPattern.test(address)) setError(labels.invalid ?? "That doesn't look like an email address. Check it for a typo.");
        else {
            setError("");
            setSending(true);
            try {
                await newsletter.onSubmit(address);
                setSentTo(address);
                return;
            } catch (failure) {
                setError(failure instanceof Error && failure.message ? failure.message : (labels.failed ?? "That didn't go through. Try again in a moment."));
            } finally {
                setSending(false);
            }
        }
        input.current?.focus();
    };

    const startAgain = () => {
        setSentTo("");
        setEmail("");
        window.setTimeout(() => input.current?.focus());
    };

    return (
        <footer className={cx("ow-footer03", className)} {...props}>
            <div className="ow-footer03__inner">
                <section className="ow-footer03__signup" aria-labelledby={`${id}-title`}>
                    <div>
                        <Text variant="heading" as="h2" id={`${id}-title`}>
                            {newsletter.title}
                        </Text>
                        {newsletter.description ? (
                            <Text variant="copy" className="ow-footer03__intro">
                                {newsletter.description}
                            </Text>
                        ) : null}
                    </div>

                    {sentTo ? (
                        <div className="ow-footer03__done" role="status">
                            <CircleCheckIcon size={18} />
                            <span className="ow-footer03__done-text">
                                <Text variant="label">{newsletter.successTitle}</Text>
                                {newsletter.successDescription ? (
                                    <Text variant="body" as="span" tone="soft" className="ow-footer03__done-detail">
                                        {newsletter.successDescription(sentTo)}
                                    </Text>
                                ) : null}
                            </span>
                            <Button size="sm" variant="ghost" onClick={startAgain}>
                                {labels.change ?? "Change"}
                            </Button>
                        </div>
                    ) : (
                        <form noValidate onSubmit={subscribe}>
                            <div className="ow-footer03__row">
                                <Input
                                    ref={input}
                                    type="email"
                                    autoComplete="email"
                                    placeholder={labels.placeholder ?? "you@example.com"}
                                    aria-label={labels.email ?? "Email address"}
                                    aria-describedby={`${id}-note`}
                                    className="ow-footer03__email"
                                    startContent={<MailIcon size={16} />}
                                    isInvalid={Boolean(error)}
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        if (error) setError("");
                                    }}
                                />
                                <Button type="submit" variant="primary" shape="pill" loading={sending} endIcon={newsletter.submitIcon}>
                                    {newsletter.submitLabel}
                                </Button>
                            </div>
                            <Text
                                variant="caption"
                                as="p"
                                id={`${id}-note`}
                                tone={error ? "danger" : undefined}
                                className="ow-footer03__note"
                                aria-live="polite"
                            >
                                {error || newsletter.note}
                            </Text>
                        </form>
                    )}
                </section>

                <div className="ow-footer03__links">
                    <div className="ow-footer03__brand">
                        <Link
                            href={brand.href}
                            variant="standalone"
                            className="ow-footer03__logo"
                            aria-label={labels.home ?? (typeof brand.name === "string" ? `${brand.name} home` : undefined)}
                        >
                            {brand.logo}
                            <Text variant="dialog-title" as="span">
                                {brand.name}
                            </Text>
                        </Link>
                        {description ? (
                            <Text variant="copy" className="ow-footer03__line">
                                {description}
                            </Text>
                        ) : null}
                    </div>
                    <FooterColumns columns={columns} headingClassName="ow-footer03__heading" listClassName="ow-footer03__list" />
                </div>

                <Separator />

                <div className="ow-footer03__bottom">
                    <Text variant="caption" as="p">
                        {legal}
                    </Text>
                    {legalLinks.length ? (
                        <Text variant="caption" as="ul" className="ow-footer03__legal">
                            {legalLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} variant="muted">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </Text>
                    ) : null}
                </div>
            </div>
        </footer>
    );
}
