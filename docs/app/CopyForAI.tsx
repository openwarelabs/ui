import { Button, ButtonGroup, copyText, Menu, MenuItem, MenuLabel, MenuSeparator, toast } from "@openwarelabs/ui";
import { ChevronDown, FileText, MessageSquareText, Plug, Sparkles } from "lucide-react";

import { hrefOf } from "./content";

type Text = string | (() => string | Promise<string>);

const resolve = async (value: Text) => (typeof value === "function" ? value() : value);

/**
 * "Copy for AI": copies a ready-to-paste prompt for Claude, Codex or Cursor, with the page's reference under it.
 * The menu also copies the plain Markdown, and points to the MCP server for tools that should look it up themselves.
 */
export function CopyForAI({ prompt, markdown, what, onPrepare }: { prompt: Text; markdown: Text; what: string; onPrepare?(): void }) {
    const copy = async (value: Text, message: string) => {
        try {
            const text = await resolve(value);
            if (await copyText(text)) toast.success(message, { description: "Paste it into Claude, Codex, Cursor or any other AI tool." });
            else toast.error("The browser didn't allow copying. Try again.");
        } catch {
            toast.error(`${what} didn't load, so nothing was copied. Try again.`);
        }
    };
    return (
        <ButtonGroup aria-label={`Copy ${what} for AI`} className="docs-copy-ai" onPointerEnter={onPrepare} onFocus={onPrepare}>
            <Button size="sm" startIcon={<Sparkles size={15} />} onClick={() => copy(prompt, `Copied ${what} as a prompt`)}>
                Copy for AI
            </Button>
            <Menu
                label="More ways to give it to AI"
                align="end"
                trigger={
                    <Button size="sm" iconOnly aria-label="More ways to give it to AI">
                        <ChevronDown size={15} />
                    </Button>
                }
            >
                <MenuLabel>Copy</MenuLabel>
                <MenuItem icon={<MessageSquareText size={15} />} onSelect={() => copy(prompt, `Copied ${what} as a prompt`)}>
                    As a prompt
                </MenuItem>
                <MenuItem icon={<FileText size={15} />} onSelect={() => copy(markdown, `Copied ${what} as Markdown`)}>
                    As Markdown
                </MenuItem>
                <MenuSeparator />
                <MenuItem icon={<Plug size={15} />} onSelect={() => (window.location.hash = hrefOf.guide("ai"))}>
                    Connect the MCP server
                </MenuItem>
            </Menu>
        </ButtonGroup>
    );
}
