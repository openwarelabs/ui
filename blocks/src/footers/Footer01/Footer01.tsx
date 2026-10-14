import { useEffect, useId, useState } from "react";

import { cx, Link, SegmentedControl, Separator, Text } from "@openwarelabs/ui";

import { FooterColumns } from "@blocks/shared/FooterColumns";
import { MonitorIcon, MoonIcon, SunIcon } from "@blocks/shared/icons";
import type { Footer01Props } from "./Footer01.types";

const currentTheme = () => (typeof document === "undefined" ? "system" : (document.documentElement.dataset.theme ?? "system"));

/** Light, dark or the system's choice, set on <html data-theme>. */
function useTheme() {
    const [theme, setTheme] = useState(currentTheme);

    // Stay in step if something else changes the theme.
    useEffect(() => {
        const observer = new MutationObserver(() => setTheme(currentTheme()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        return () => observer.disconnect();
    }, []);

    const choose = (value: string) => {
        document.documentElement.dataset.theme = value;
        setTheme(value);
    };
    return [theme, choose] as const;
}

/** The logo and a line, then three or four columns of links, with the small print and a theme switch below. */
export function Footer01({ brand, description, status, columns, legal, legalLinks = [], themeSwitch = false, labels = {}, className, ...props }: Footer01Props) {
    const [theme, setTheme] = useTheme();
    const themeId = useId();
    const home = labels.home ?? (typeof brand.name === "string" ? `${brand.name} home` : undefined);

    return (
        <footer className={cx("ow-footer01", className)} {...props}>
            <div className="ow-footer01__inner">
                <div className="ow-footer01__top">
                    <div className="ow-footer01__brand">
                        <Link href={brand.href} variant="standalone" className="ow-footer01__logo" aria-label={home}>
                            {brand.logo}
                            <Text variant="dialog-title" as="span">
                                {brand.name}
                            </Text>
                        </Link>
                        {description ? <Text variant="copy">{description}</Text> : null}
                        {status ? (
                            <Link href={status.href} variant="standalone" className="ow-footer01__status">
                                <span className="ow-footer01__status-dot" aria-hidden="true" />
                                {status.label}
                            </Link>
                        ) : null}
                    </div>

                    <FooterColumns columns={columns} headingClassName="ow-footer01__heading" listClassName="ow-footer01__links" badgeClassName="ow-footer01__new" />
                </div>

                <Separator />

                <div className="ow-footer01__bottom">
                    <Text variant="caption" as="p" className="ow-footer01__legal">
                        <span>{legal}</span>
                        {legalLinks.map((link, index) => (
                            <Link key={index} href={link.href} variant="muted">
                                {link.label}
                            </Link>
                        ))}
                    </Text>
                    {themeSwitch ? (
                        <div className="ow-footer01__theme">
                            <Text variant="caption" id={themeId}>
                                {labels.theme ?? "Theme"}
                            </Text>
                            <SegmentedControl
                                size="sm"
                                aria-labelledby={themeId}
                                options={[
                                    { value: "light", label: null, icon: <SunIcon size={15} />, "aria-label": labels.light ?? "Light" },
                                    { value: "dark", label: null, icon: <MoonIcon size={15} />, "aria-label": labels.dark ?? "Dark" },
                                    { value: "system", label: null, icon: <MonitorIcon size={15} />, "aria-label": labels.system ?? "Match the system" },
                                ]}
                                value={theme}
                                onChange={setTheme}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </footer>
    );
}
