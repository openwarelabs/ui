import type { ReactNode } from "react";

import { cx } from "../../utils/cx";
import { TextShimmer } from "../TextShimmer/TextShimmer";
import { ChatAgentAvatar, useChatEntrance } from "./ChatMessage";

export interface ChatLoaderProps {
    /** Words in place of the dots, with a shimmer across them: "Thinking…", "Reading the codebase…". */
    label?: ReactNode;
    /** Just the dots or the label, without a message's avatar and spacing: for inside a message, a step or a status bar.
     * @default false */
    inline?: boolean;
    /** The agent's name above, as on its messages: "Acme agent". */
    name?: ReactNode;
    /** The agent's bot tile by default; any node in its place, or null for none. */
    avatar?: ReactNode;
    /** What screen readers hear while the dots show. With a `label`, they hear the label.
     * @default "Working…" */
    srLabel?: string;
    className?: string;
}

/**
 * The agent is working and nothing has arrived yet: three dots that pulse in turn, or a shimmering label such as
 * "Thinking…". It sits in the conversation like the agent's next message, so the answer takes its place without a jump.
 */
export function ChatLoader({ label, inline = false, name, avatar, srLabel = "Working…", className }: ChatLoaderProps) {
    const entering = useChatEntrance();
    const indicator =
        label != null ? (
            <TextShimmer className="ow-chat-loader__label">{label}</TextShimmer>
        ) : (
            <span className="ow-chat-loader__dots">
                <span className="ow-chat-loader__dot" aria-hidden="true" />
                <span className="ow-chat-loader__dot" aria-hidden="true" />
                <span className="ow-chat-loader__dot" aria-hidden="true" />
                <span className="ow-visually-hidden">{srLabel}</span>
            </span>
        );

    if (inline) {
        return (
            <span role="status" className={cx("ow-chat-loader", "ow-chat-loader--inline", className)}>
                {indicator}
            </span>
        );
    }

    const avatarNode = avatar === undefined ? <ChatAgentAvatar /> : avatar;
    return (
        <div role="status" className={cx("ow-chat-message", "ow-chat-message--assistant", "ow-chat-loader", entering && "ow-chat-loader--enter", className)}>
            {avatarNode != null && avatarNode !== false ? <div className="ow-chat-message__avatar">{avatarNode}</div> : null}
            <div className="ow-chat-message__main">
                {name != null ? (
                    <div className="ow-chat-message__header">
                        <span className="ow-chat-message__name">{name}</span>
                    </div>
                ) : null}
                <div className="ow-chat-loader__line">{indicator}</div>
            </div>
        </div>
    );
}
