// The page each block is previewed in. Inside the docs it's an iframe, so a block's media queries answer to the
// frame's width (desktop, tablet or phone) and only the library's styles and its own reach it.
//   frame.html?block=heroes/HeroCentred            the block, scrolling inside a fixed-height frame
//   frame.html?block=heroes/HeroCentred&fit=content and report its height to the docs, which size the frame to it
import "@fontsource-variable/inter";
import "@fontsource-variable/geist-mono";
import "docs:styles";
import "./frame.css";

import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

import { Toaster } from "@openwarelabs/ui";
import { blocks } from "docs:blocks";

const params = new URLSearchParams(window.location.search);
const id = params.get("block") ?? "";
const fit = params.get("fit") === "content";
const Block = blocks[id];

if (fit) document.documentElement.dataset.fit = "content";

/** Inside the docs, follow their theme and colour as they change. */
function followParent() {
    let parentDocument: Document;
    try {
        if (window.parent === window) return;
        parentDocument = window.parent.document;
    } catch {
        return;
    }
    const sync = () => {
        document.documentElement.dataset.theme = parentDocument.documentElement.dataset.theme ?? "system";
        const brand = parentDocument.getElementById("docs-brand");
        let own = document.getElementById("docs-brand");
        if (brand) {
            if (!own) {
                own = document.createElement("style");
                own.id = "docs-brand";
                document.head.append(own);
            }
            if (own.textContent !== brand.textContent) own.textContent = brand.textContent;
        } else own?.remove();
    };
    sync();
    new MutationObserver(sync).observe(parentDocument.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    new MutationObserver(sync).observe(parentDocument.head, { childList: true, subtree: true, characterData: true });
}

/** Tells the docs how tall the block is, so the frame can fit it without scrolling. */
function reportHeight(element: HTMLElement) {
    if (!fit || window.parent === window) return;
    let last = 0;
    const send = () => {
        const height = Math.ceil(element.getBoundingClientRect().height);
        if (height === last) return;
        last = height;
        window.parent.postMessage({ type: "openware-block-height", height }, "*");
    };
    new ResizeObserver(send).observe(element);
    send();
}

/**
 * A block that opens a dialog or focuses a field as it loads would pull the docs' focus into its frame (and the docs'
 * shortcuts with it), and could scroll the docs to it. Until someone uses the block, focusing never scrolls, and for
 * the first moments focus is handed back to the page.
 */
function keepFocusOnThePage() {
    if (window.parent === window || !window.frameElement) return;
    const frameElement = window.frameElement as HTMLElement;
    let used = false;
    const use = () => {
        used = true;
    };
    window.addEventListener("pointerdown", use, { capture: true, once: true });
    window.addEventListener("keydown", use, { capture: true, once: true });
    const focus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (this: HTMLElement, options?: FocusOptions) {
        focus.call(this, used ? options : { ...options, preventScroll: true });
    };
    const started = performance.now();
    const check = () => {
        if (used || performance.now() - started > 2500) return;
        if (document.hasFocus() && window.parent.document.activeElement === frameElement) frameElement.blur();
        requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
}

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
    override state = { error: null as Error | null };
    static getDerivedStateFromError(error: Error) {
        return { error };
    }
    override render() {
        if (this.state.error) {
            return <p className="frame-message">This block didn't render: {this.state.error.message}</p>;
        }
        return this.props.children;
    }
}

followParent();
keepFocusOnThePage();
const root = document.getElementById("root")!;
reportHeight(root);
createRoot(root).render(
    Block ? (
        <Boundary>
            <Block />
            <Toaster />
        </Boundary>
    ) : (
        <p className="frame-message">
            There's no block called <code>{id || "(none)"}</code>.
        </p>
    ),
);
