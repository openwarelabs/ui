import type { ComponentType, ElementType, MouseEvent } from "react";

import type { ProseProps } from "@/components/Prose/Prose.types";

/** The elements Markdown draws, each of which `components` can replace. */
export type MarkdownTag =
    | "a"
    | "blockquote"
    | "code"
    | "del"
    | "em"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "hr"
    | "img"
    | "li"
    | "ol"
    | "p"
    | "strong"
    | "table"
    | "td"
    | "th"
    | "ul";

/** What a fenced code block's renderer gets. */
export interface MarkdownCodeBlockProps {
    /** The code, without the fences. */
    code: string;
    /** The word after the opening fence, such as "tsx". */
    language?: string;
}

/** Your own renderers, by element: a router's Link for `a`, say. Each gets the element's props and children. */
export type MarkdownComponents = Partial<Record<MarkdownTag, ElementType>> & {
    /** Renders fenced code. Defaults to the library's CodeBlock. */
    codeBlock?: ComponentType<MarkdownCodeBlockProps>;
};

export interface MarkdownProps extends Omit<ProseProps, "size" | "children"> {
    /** The Markdown, as a string. */
    children?: string;
    /** The Markdown, if you'd rather not pass it as children. It wins over children. */
    content?: string;
    /** While the text is still arriving. An unfinished construct at the end (an open code fence, half a `**bold`, a link
     * without its URL yet, half a table row) shows as what it's becoming, never as raw syntax, and the finished blocks
     * above it aren't rendered again. The element is aria-busy meanwhile.
     * @default false */
    streaming?: boolean;
    /** Blinks a caret after the last character while it streams; it holds still for reduced motion. Leave it off inside
     * a streaming ChatMessage, which draws its own.
     * @default false */
    caret?: boolean;
    /** chat sets 14px text with a tight rhythm, for answers in a conversation; article the prose style, for documents.
     * @default "chat" */
    size?: "chat" | "article";
    /** Shows images. Off, an image shows as a link to it, named by its alt text.
     * @default false */
    allowImages?: boolean;
    /** Moves every heading down this many levels, so `#` under a page's own h1 and h2 can be an h3.
     * @default 0 */
    headingOffset?: number;
    /** Replaces the elements it draws with your own renderers. Keep the object stable (outside the component or memoised)
     * so finished blocks aren't rendered again. */
    components?: MarkdownComponents;
    /** Called when a link is clicked, before it's followed; call `event.preventDefault()` to handle it yourself. */
    onLinkClick?(event: MouseEvent<HTMLAnchorElement>, href: string): void;
}

/** What every block's renderer reads. Internal. */
export interface MarkdownContext {
    components: MarkdownComponents | undefined;
    allowImages: boolean;
    headingOffset: number;
    caret: boolean;
    click(event: MouseEvent<HTMLAnchorElement>, href: string): void;
}

/** One top-level block, rendered again only when its source or whether it's the streaming end changes. Internal. */
export interface MarkdownBlockProps {
    source: string;
    context: MarkdownContext;
    tail: boolean;
}
