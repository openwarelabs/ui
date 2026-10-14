import { useId, useRef, useState } from "react";

import {
    Avatar,
    Button,
    ChatAgentAvatar,
    ChatConversation,
    ChatLoader,
    ChatMessage,
    ChatMessageActions,
    cx,
    EmptyState,
    Kbd,
    Menu,
    MenuLabel,
    PromptInput,
    PromptSuggestion,
    PromptSuggestions,
    Prose,
    Text,
    type ChatConversationHandle,
} from "@openwarelabs/ui";

import { BlockMenuItems } from "@blocks/shared/BlockMenuItems";
import { EllipsisIcon, SquarePenIcon } from "@blocks/shared/icons";
import type { Chat01Props } from "./Chat01.types";

/**
 * A chat with an agent that fills its frame: a header with the chat's name, then the messages, which scroll and keep
 * the reply box docked below them. The person's messages can be copied and edited; the agent's copied and rated.
 */
export function Chat01({
    title,
    context,
    messages,
    user,
    agentName = "Agent",
    day,
    thinking = false,
    onSend,
    onStop,
    onNewChat,
    onRate,
    menu,
    menuHeading,
    empty,
    draft: draftProp,
    onDraftChange,
    locale,
    labels = {},
    className,
    ...props
}: Chat01Props) {
    const id = useId();
    const view = useRef<ChatConversationHandle>(null);
    const input = useRef<HTMLTextAreaElement>(null);
    const [ownDraft, setOwnDraft] = useState("");
    const draft = draftProp ?? ownDraft;
    const setDraft = (text: string) => {
        setOwnDraft(text);
        onDraftChange?.(text);
    };

    const last = messages[messages.length - 1];
    const streaming = last?.status === "streaming";

    const send = (text: string) => {
        setDraft("");
        onSend?.(text);
        view.current?.scrollToBottom();
    };

    const edit = (text: string) => {
        setDraft(text);
        input.current?.focus();
    };

    const newChat = () => {
        setDraft("");
        onNewChat?.();
        input.current?.focus();
    };

    return (
        <div className={cx("ow-chat01", className)} {...props}>
            <div className="ow-chat01__panel">
                <header className="ow-chat01__header">
                    <ChatAgentAvatar size="lg" />
                    <div className="ow-chat01__heading">
                        <Text variant="card-title" as="h1" truncate id={`${id}-title`}>
                            {title}
                        </Text>
                        {context ? (
                            <Text variant="caption" className="ow-chat01__context">
                                <span className="ow-chat01__context-dot" aria-hidden="true" />
                                {context}
                            </Text>
                        ) : null}
                    </div>
                    {onNewChat ? (
                        <Button variant="ghost" size="sm" iconOnly aria-label={labels.newChat ?? "New chat"} onClick={newChat}>
                            <SquarePenIcon size={16} />
                        </Button>
                    ) : null}
                    {menu?.length ? (
                        <Menu
                            label={labels.menu ?? "Chat"}
                            align="end"
                            trigger={
                                <Button variant="ghost" size="sm" iconOnly aria-label={labels.more ?? "More"}>
                                    <EllipsisIcon size={16} />
                                </Button>
                            }
                        >
                            {menuHeading ? <MenuLabel>{menuHeading}</MenuLabel> : null}
                            <BlockMenuItems items={menu} />
                        </Menu>
                    ) : null}
                </header>

                <ChatConversation
                    ref={view}
                    aria-labelledby={`${id}-title`}
                    empty={
                        empty ? (
                            <EmptyState
                                icon={empty.icon}
                                title={empty.title}
                                description={empty.description}
                                actions={
                                    empty.suggestions?.length ? (
                                        <PromptSuggestions align="center" aria-label={labels.suggestions ?? "Ideas to start from"}>
                                            {empty.suggestions.map((suggestion) => (
                                                <PromptSuggestion key={suggestion.label} icon={suggestion.icon} onClick={() => edit(suggestion.label)}>
                                                    {suggestion.label}
                                                </PromptSuggestion>
                                            ))}
                                        </PromptSuggestions>
                                    ) : undefined
                                }
                            />
                        ) : undefined
                    }
                    footer={
                        <PromptInput
                            ref={input}
                            value={draft}
                            onChange={setDraft}
                            onSubmit={send}
                            isStreaming={thinking || streaming}
                            onStop={onStop}
                            placeholder={labels.placeholder ?? "Reply to the agent…"}
                            aria-label={labels.input ?? "Reply to the agent"}
                            hint={
                                labels.hint ?? (
                                    <>
                                        <Kbd>Enter</Kbd> to send, <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for a new line
                                    </>
                                )
                            }
                        />
                    }
                >
                    {messages.length && day ? <ChatMessage from="system">{day}</ChatMessage> : null}
                    {messages.map((message) =>
                        message.from === "user" ? (
                            <ChatMessage
                                key={message.id}
                                from="user"
                                name={user.name}
                                avatar={<Avatar name={user.name} src={user.avatar} />}
                                time={message.time}
                                locale={locale}
                                actions={<ChatMessageActions copyText={message.text} onEdit={() => edit(message.text)} />}
                            >
                                {message.text}
                            </ChatMessage>
                        ) : (
                            <ChatMessage
                                key={message.id}
                                from="assistant"
                                name={agentName}
                                time={message.time}
                                locale={locale}
                                status={message.status}
                                showActions={message === last ? "always" : "hover"}
                                actions={<ChatMessageActions copyText={message.text} onRate={(rating) => onRate?.(message, rating)} />}
                            >
                                {message.body ?? (
                                    <Prose size="sm">
                                        <Text variant="copy" tone="default">
                                            {message.text}
                                        </Text>
                                    </Prose>
                                )}
                            </ChatMessage>
                        ),
                    )}
                    {thinking ? <ChatLoader name={agentName} label={labels.thinking ?? "Thinking…"} /> : null}
                </ChatConversation>
            </div>
        </div>
    );
}
