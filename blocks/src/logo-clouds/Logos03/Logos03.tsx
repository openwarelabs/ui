import { useId, useState } from "react";

import { Button, cx, Text, Tooltip } from "@openwarelabs/ui";

import { PauseIcon, PlayIcon } from "@blocks/shared/icons";
import type { Logos03Logo, Logos03Props } from "./Logos03.types";

function LogoList({ logos, copy = false }: { logos: Logos03Logo[]; copy?: boolean }) {
    return (
        <ul className={copy ? "ow-logos03__list ow-logos03__list--copy" : "ow-logos03__list"} aria-hidden={copy || undefined}>
            {logos.map((logo) => (
                <li key={logo.name} className="ow-logos03__logo">
                    {logo.logo}
                </li>
            ))}
        </ul>
    );
}

/** A slow, endless row of customers' logos that pauses on hover and stands still with reduced motion. */
export function Logos03({ title, logos, labels = {}, className, ...props }: Logos03Props) {
    const id = useId();
    const [paused, setPaused] = useState(false);
    const toggleLabel = paused ? (labels.play ?? "Play the logos") : (labels.pause ?? "Pause the logos");

    return (
        <section className={cx("ow-logos03", className)} aria-labelledby={id} data-paused={paused || undefined} {...props}>
            <div className="ow-logos03__head">
                <Text as="h2" variant="body" tone="muted" align="center" id={id}>
                    {title}
                </Text>
                {/* Moving content needs a way to stop it for good; hover and focus only hold it still for a moment. */}
                <Tooltip label={toggleLabel}>
                    <Button
                        className="ow-logos03__toggle"
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={toggleLabel}
                        onClick={() => setPaused((value) => !value)}
                    >
                        {paused ? <PlayIcon size={14} /> : <PauseIcon size={14} />}
                    </Button>
                </Tooltip>
            </div>
            {/* Focusable, so a keyboard can hold it still too. */}
            <div className="ow-logos03__viewport" role="region" aria-label={labels.region ?? "Customer logos"} tabIndex={0}>
                <div className="ow-logos03__track">
                    <LogoList logos={logos} />
                    <LogoList logos={logos} copy />
                </div>
            </div>
        </section>
    );
}
