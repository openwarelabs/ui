import {
    forwardRef,
    useLayoutEffect,
    useRef,
    type ChangeEvent,
    type CSSProperties,
    type ForwardedRef,
    type TextareaHTMLAttributes,
} from "react";

import { cx } from "../../utils/cx";
import { resizeTextArea } from "../../utils/resizeTextArea";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Grows with its text, up to `autoGrowMaxHeight`, then scrolls. */
    autoGrow?: boolean;
    /** The tallest an auto-growing box gets. A number is pixels. Default 180. */
    autoGrowMaxHeight?: number | string;
    /** Borderless and transparent, for use inside your own field container (a chat composer). */
    bare?: boolean;
    isInvalid?: boolean;
}

const defaultAutoGrowMaxHeight = 180;

function assignRef(ref: ForwardedRef<HTMLTextAreaElement>, element: HTMLTextAreaElement | null) {
    if (typeof ref === "function") ref(element);
    else if (ref) ref.current = element;
}

/** A multi-line text field, 72px tall at least; it can grow with its text. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    {
        autoGrow = false,
        autoGrowMaxHeight = defaultAutoGrowMaxHeight,
        bare = false,
        className,
        isInvalid = false,
        onChange,
        style,
        value,
        ...textareaProps
    },
    ref,
) {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    useLayoutEffect(() => {
        if (autoGrow && textAreaRef.current) resizeTextArea(textAreaRef.current);
    }, [autoGrow, autoGrowMaxHeight, value]);

    function setTextAreaRef(element: HTMLTextAreaElement | null) {
        textAreaRef.current = element;
        assignRef(ref, element);
        if (autoGrow && element) resizeTextArea(element);
    }

    function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
        // A controlled box is resized once its new value renders (the layout effect above).
        if (autoGrow && value === undefined) resizeTextArea(event.currentTarget);
        onChange?.(event);
    }

    const textareaStyle: CSSProperties | undefined = autoGrow
        ? {
              ...style,
              maxHeight: typeof autoGrowMaxHeight === "number" ? `${autoGrowMaxHeight}px` : autoGrowMaxHeight,
          }
        : style;

    return (
        <textarea
            {...textareaProps}
            ref={setTextAreaRef}
            className={cx(
                "ow-textarea",
                bare && "ow-textarea--bare",
                isInvalid && !bare && "ow-textarea--invalid",
                autoGrow && "ow-textarea--auto-grow",
                className,
            )}
            aria-invalid={isInvalid || undefined}
            style={textareaStyle}
            value={value}
            onChange={handleChange}
        />
    );
});
