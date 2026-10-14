import { useEffect, useState } from "react";

import type { Command } from "@openwarelabs/ui";

import type { AppShellStateOptions, BlockMenuItem } from "@blocks/shared/shared.types";

/**
 * What every app shell keeps: the current place (its own, unless `current` is given), the phone drawer, and the
 * search, which ⌘K or Ctrl+K opens from anywhere when there are commands. Choosing a place closes the drawer.
 */
export function useAppShell({ current, defaultCurrent, onNavigate, commands }: AppShellStateOptions) {
    const [ownCurrent, setOwnCurrent] = useState(defaultCurrent);
    const [navOpen, setNavOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const active = current ?? ownCurrent;
    const hasSearch = Boolean(commands?.length);

    useEffect(() => {
        if (!hasSearch) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [hasSearch]);

    const navigate = (id: string) => {
        setOwnCurrent(id);
        onNavigate?.(id);
        setNavOpen(false);
    };

    const paletteCommands: Command[] = (commands ?? []).map(({ run, page, ...command }) => ({
        ...command,
        run: () => {
            run?.();
            if (page !== undefined) navigate(page);
        },
    }));

    /** For a menu item that opens a place. */
    const afterMenuSelect = (item: BlockMenuItem & { page?: string }) => {
        if (item.page !== undefined) navigate(item.page);
    };

    return { active, navigate, navOpen, setNavOpen, searchOpen, setSearchOpen, hasSearch, paletteCommands, afterMenuSelect };
}
