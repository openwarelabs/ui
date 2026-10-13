/** Text longer than this can't fit under any auto-grow cap, however wide the box. */
const surelyOverflowingLength = 20_000;

/**
 * Whether the text needs more lines than fit under maxHeight even before wrapping. Counting line breaks is cheap;
 * measuring (scrollHeight) lays out all of the text, which takes tens of milliseconds per keystroke for a long draft.
 */
function surelyOverflows(textArea: HTMLTextAreaElement, maxHeight: number): boolean {
    const text = textArea.value;
    if (text.length > surelyOverflowingLength) return true;
    const style = window.getComputedStyle(textArea);
    const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2;
    if (!lineHeight) return false;
    const needed = Math.ceil(maxHeight / lineHeight) + 1;
    let lines = 1;
    for (let index = text.indexOf("\n"); index !== -1 && lines < needed; index = text.indexOf("\n", index + 1))
        lines += 1;
    return lines >= needed;
}

/** Grows a textarea to fit its text, up to its CSS max-height, then scrolls. */
export function resizeTextArea(textArea: HTMLTextAreaElement): void {
    const maxHeight = Number.parseFloat(window.getComputedStyle(textArea).maxHeight);
    // Already past the cap: it stays at the cap and scrolls, with nothing to measure.
    if (Number.isFinite(maxHeight) && surelyOverflows(textArea, maxHeight)) {
        textArea.style.height = `${maxHeight.toString()}px`;
        textArea.style.overflowY = "auto";
        return;
    }

    textArea.style.height = "auto";

    const shouldScroll = Number.isFinite(maxHeight) && textArea.scrollHeight > maxHeight;

    textArea.style.height = `${textArea.scrollHeight}px`;
    textArea.style.overflowY = shouldScroll ? "auto" : "hidden";
}
