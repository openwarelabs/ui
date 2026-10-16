import { forwardRef, useCallback, type ChangeEvent } from "react";

import { Input } from "@/components/Input/Input";
import { Textarea } from "@/components/Textarea/Textarea";
import { useControllableState } from "@/hooks/useControllableState";
import type { MentionInputProps } from "./MentionInput.types";
import { useMentions } from "./useMentions";

export type { Mention, MentionInputProps, MentionLabels, MentionOption, MentionTrigger, UseMentionsOptions, UseMentionsResult } from "./MentionInput.types";
export { useMentions } from "./useMentions";

/**
 * A text field that suggests people after `@` and commands after `/` (or any trigger you give), at the caret.
 * Picking one puts it in the text as "@Saoirse Doyle ", and `onMentionsChange` reports the mentions with their ids.
 * One line by default; `multiline` makes it a Textarea that grows. For another text box, use `useMentions`.
 */
export const MentionInput = forwardRef<HTMLTextAreaElement | HTMLInputElement, MentionInputProps>(function MentionInput(
    { triggers, value, defaultValue = "", onChange, onMentionsChange, multiline = false, rows = 3, maxHeight, size = "md", disabled = false, labels, ...props },
    ref,
) {
    const [text, setText] = useControllableState(value, defaultValue, onChange);
    const { ref: attach, list } = useMentions({ triggers, value: text, onMentionsChange, disabled, size, labels });

    const setRef = useCallback(
        (element: HTMLTextAreaElement | HTMLInputElement | null) => {
            attach(element);
            if (typeof ref === "function") ref(element);
            else if (ref) ref.current = element;
        },
        [attach, ref],
    );

    const shared = {
        ...props,
        ref: setRef,
        value: text,
        disabled,
        onChange: (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setText(event.target.value),
    };

    return (
        <>
            {multiline ? <Textarea {...shared} rows={rows} autoGrow autoGrowMaxHeight={maxHeight} /> : <Input {...shared} size={size} autoComplete="off" />}
            {list}
        </>
    );
});
