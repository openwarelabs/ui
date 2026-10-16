import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { ComponentDoc } from "./types";

/**
 * The first example of a component, shrunk to fit its card: on the Components index and on Releases. It can't be
 * focused or clicked.
 */
export function Thumbnail({ doc, className }: { doc: ComponentDoc; className?: string }) {
    const frame = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.72);
    const example = doc.examples[0];
    const First = example?.Component;

    useEffect(() => {
        if (frame.current) frame.current.inert = true;
    }, []);

    // Fit the example inside the card, at most 72% of its real size.
    useLayoutEffect(() => {
        const outer = frame.current;
        const inner = content.current;
        if (!outer || !inner) return undefined;
        const fit = () => {
            const room = { width: outer.clientWidth - 24, height: outer.clientHeight - 20 };
            const size = { width: inner.offsetWidth, height: inner.offsetHeight };
            if (!size.width || !size.height) return;
            setScale(Math.min(0.72, room.width / size.width, room.height / size.height));
        };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(outer);
        observer.observe(inner);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={frame} className={className ? `docs-card__preview ${className}` : "docs-card__preview"} aria-hidden="true">
            <div
                ref={content}
                className={`docs-card__scale${example?.layout.fill ? " docs-card__scale--fill" : ""}`}
                style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
            >
                {First ? <First /> : null}
            </div>
        </div>
    );
}
