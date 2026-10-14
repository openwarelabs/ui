import { Avatar, Button, CommandPalette, cx, Drawer, Menu, MenuLabel, NavItem, NavList, Text } from "@openwarelabs/ui";

import { useAppShell } from "@blocks/shared/appShell";
import { AppWorkspaceItems } from "@blocks/shared/AppWorkspaceItems";
import { BlockMenuItems } from "@blocks/shared/BlockMenuItems";
import { ChevronsUpDownIcon, MenuIcon, SearchIcon } from "@blocks/shared/icons";
import type { Shell02Props } from "./Shell02.types";

/**
 * An app's frame for a few sections: the workspace, the sections and the account across the top on the canvas, and
 * the page on a raised panel under them. Under 1024px the search folds to its icon; on phones the sections and the
 * account move into a drawer.
 */
export function Shell02({
    workspace,
    logo,
    workspaces,
    onNewWorkspace,
    navigation,
    current,
    defaultCurrent,
    onNavigate,
    account,
    accountMenu = [],
    commands,
    children,
    labels = {},
    className,
    ...props
}: Shell02Props) {
    const shell = useAppShell({ current, defaultCurrent: defaultCurrent ?? navigation[0]?.id, onNavigate, commands });
    const searchLabel = labels.search ?? "Search";
    const navigationLabel = labels.navigation ?? "Main navigation";
    const accountLabel = labels.account ?? "Account";
    const openSearch = () => shell.setSearchOpen(true);

    const items = (orientation: "horizontal" | "vertical") =>
        navigation.map((item) => (
            <NavItem
                key={item.id}
                icon={orientation === "vertical" ? item.icon : undefined}
                href={item.href}
                active={shell.active === item.id}
                end={item.count}
                onClick={() => shell.navigate(item.id)}
            >
                {item.label}
            </NavItem>
        ));

    return (
        <div className={cx("ow-shell02", className)} {...props}>
            <header className="ow-shell02__header">
                <Menu
                    label={labels.workspaces ?? "Workspaces"}
                    width={232}
                    trigger={
                        <Button variant="ghost" size="sm" className="ow-shell02__workspace" endIcon={<ChevronsUpDownIcon size={15} />}>
                            {logo}
                            <Text as="span" variant="card-title" tone="default">
                                {workspace}
                            </Text>
                        </Button>
                    }
                >
                    <AppWorkspaceItems
                        workspaces={workspaces ?? [{ name: workspace, current: true }]}
                        onNewWorkspace={onNewWorkspace}
                        heading={labels.workspaces ?? "Workspaces"}
                        newWorkspace={labels.newWorkspace ?? "New workspace"}
                        spacerClassName="ow-shell02__menu-spacer"
                    />
                </Menu>

                <NavList label={navigationLabel} orientation="horizontal" className="ow-shell02__nav">
                    {items("horizontal")}
                </NavList>

                <div className="ow-shell02__end">
                    {shell.hasSearch ? (
                        <>
                            <Button size="sm" className="ow-shell02__search" startIcon={<SearchIcon size={15} />} shortcut="⌘K" onClick={openSearch}>
                                <Text as="span" tone="muted" className="ow-shell02__search-text">
                                    {searchLabel}
                                </Text>
                            </Button>
                            {/* Under 1024px wide the search field folds to its icon. */}
                            <Button variant="ghost" iconOnly className="ow-shell02__search-icon" aria-label={searchLabel} onClick={openSearch}>
                                <SearchIcon size={18} />
                            </Button>
                        </>
                    ) : null}
                    <span className="ow-shell02__account">
                        <Menu
                            label={accountLabel}
                            align="end"
                            width={232}
                            trigger={
                                <Button variant="ghost" iconOnly aria-label={labels.accountButton?.(account.name) ?? `${accountLabel}: ${account.name}`}>
                                    <Avatar name={account.name} src={account.avatar} size="md" />
                                </Button>
                            }
                        >
                            {account.email ? <MenuLabel>{account.email}</MenuLabel> : null}
                            <BlockMenuItems items={accountMenu} onAfterSelect={shell.afterMenuSelect} />
                        </Menu>
                    </span>
                    <span className="ow-shell02__menu-button">
                        <Button variant="ghost" iconOnly aria-label={labels.openNavigation ?? "Open navigation"} onClick={() => shell.setNavOpen(true)}>
                            <MenuIcon size={18} />
                        </Button>
                    </span>
                </div>
            </header>

            <main className="ow-shell02__panel">
                <div className="ow-shell02__page">{children}</div>
            </main>

            <Drawer open={shell.navOpen} onClose={() => shell.setNavOpen(false)} side="right" size={300} title={labels.menu ?? "Menu"}>
                <div className="ow-shell02__drawer">
                    <NavList label={navigationLabel}>{items("vertical")}</NavList>
                    <div className="ow-shell02__drawer-account">
                        <Menu
                            label={accountLabel}
                            above
                            width={232}
                            trigger={
                                <Button variant="ghost" fullWidth className="ow-shell02__user" endIcon={<ChevronsUpDownIcon size={15} />}>
                                    <Avatar name={account.name} src={account.avatar} size="sm" />
                                    <span className="ow-shell02__user-text">
                                        <Text as="span" variant="label" tone="default" truncate>
                                            {account.name}
                                        </Text>
                                        {account.email ? (
                                            <Text variant="caption" truncate>
                                                {account.email}
                                            </Text>
                                        ) : null}
                                    </span>
                                </Button>
                            }
                        >
                            <BlockMenuItems items={accountMenu} onAfterSelect={shell.afterMenuSelect} />
                        </Menu>
                    </div>
                </div>
            </Drawer>
            {shell.hasSearch ? (
                <CommandPalette
                    open={shell.searchOpen}
                    onClose={() => shell.setSearchOpen(false)}
                    commands={shell.paletteCommands}
                    placeholder={labels.searchPlaceholder ?? "Search…"}
                />
            ) : null}
        </div>
    );
}
