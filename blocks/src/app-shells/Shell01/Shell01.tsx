import { Avatar, Button, CommandPalette, cx, Drawer, Menu, NavItem, NavList, Text } from "@openwarelabs/ui";

import { useAppShell } from "@blocks/shared/appShell";
import { AppWorkspaceItems } from "@blocks/shared/AppWorkspaceItems";
import { BlockMenuItems } from "@blocks/shared/BlockMenuItems";
import { ChevronsUpDownIcon, MenuIcon, SearchIcon } from "@blocks/shared/icons";
import type { Shell01Props } from "./Shell01.types";

/**
 * An app's frame: navigation down the left on the canvas, the account at the bottom, and the page on a raised panel
 * beside it. On phones the sidebar folds into a drawer behind a bar at the top.
 */
export function Shell01({
    workspace,
    logo,
    workspaces,
    onNewWorkspace,
    navigation,
    current,
    defaultCurrent,
    onNavigate,
    account,
    accountMenu,
    commands,
    children,
    labels = {},
    className,
    ...props
}: Shell01Props) {
    const shell = useAppShell({ current, defaultCurrent: defaultCurrent ?? navigation[0]?.items[0]?.id, onNavigate, commands });
    const searchLabel = labels.search ?? "Search";
    const openSearch = () => shell.setSearchOpen(true);

    // Everything in the sidebar; the same list goes in the drawer on phones.
    const sidebar = (
        <div className="ow-shell01__nav">
            <Menu
                label={labels.workspaces ?? "Workspaces"}
                width={232}
                trigger={
                    <Button variant="ghost" size="sm" fullWidth className="ow-shell01__workspace" endIcon={<ChevronsUpDownIcon size={15} />}>
                        {logo}
                        <Text as="span" variant="card-title" tone="default" className="ow-shell01__workspace-name">
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
                    spacerClassName="ow-shell01__menu-spacer"
                />
            </Menu>

            {shell.hasSearch ? (
                <Button size="sm" fullWidth className="ow-shell01__search" startIcon={<SearchIcon size={15} />} shortcut="⌘K" onClick={openSearch}>
                    <Text as="span" tone="muted" className="ow-shell01__search-text">
                        {searchLabel}
                    </Text>
                </Button>
            ) : null}

            {navigation.map((group, index) => (
                <NavList key={index} label={group.label} heading={group.heading}>
                    {group.items.map((item) => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            href={item.href}
                            active={shell.active === item.id}
                            end={item.count}
                            onClick={() => shell.navigate(item.id)}
                        >
                            {item.label}
                        </NavItem>
                    ))}
                </NavList>
            ))}

            <div className="ow-shell01__account">
                <Menu
                    label={labels.account ?? "Account"}
                    above
                    width={232}
                    trigger={
                        <Button variant="ghost" fullWidth className="ow-shell01__user" endIcon={<ChevronsUpDownIcon size={15} />}>
                            <Avatar name={account.name} src={account.avatar} size="sm" />
                            <span className="ow-shell01__user-text">
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
                    <BlockMenuItems items={accountMenu ?? []} onAfterSelect={shell.afterMenuSelect} />
                </Menu>
            </div>
        </div>
    );

    return (
        <div className={cx("ow-shell01", className)} {...props}>
            <aside className="ow-shell01__aside" aria-label={labels.navigation ?? "Main navigation"}>
                {sidebar}
            </aside>

            <div className="ow-shell01__body">
                <header className="ow-shell01__topbar">
                    <Button variant="ghost" iconOnly aria-label={labels.openNavigation ?? "Open navigation"} onClick={() => shell.setNavOpen(true)}>
                        <MenuIcon size={18} />
                    </Button>
                    <Text as="span" variant="card-title" className="ow-shell01__topbar-brand">
                        {logo}
                        {workspace}
                    </Text>
                    {shell.hasSearch ? (
                        <Button variant="ghost" iconOnly aria-label={searchLabel} onClick={openSearch}>
                            <SearchIcon size={18} />
                        </Button>
                    ) : (
                        <span />
                    )}
                </header>

                <main className="ow-shell01__panel">{children}</main>
            </div>

            <Drawer open={shell.navOpen} onClose={() => shell.setNavOpen(false)} side="left" size={300} title={labels.menu ?? "Menu"}>
                {sidebar}
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
