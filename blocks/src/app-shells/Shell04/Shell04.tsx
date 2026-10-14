import { Fragment, useId, useState, type ReactElement } from "react";

import { Avatar, Button, CommandPalette, cx, Drawer, Menu, NavItem, NavList, Text, Tooltip } from "@openwarelabs/ui";

import { useAppShell } from "@blocks/shared/appShell";
import { AppWorkspaceItems } from "@blocks/shared/AppWorkspaceItems";
import { BlockMenuItems } from "@blocks/shared/BlockMenuItems";
import { ChevronRightIcon, ChevronsUpDownIcon, MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, SearchIcon } from "@blocks/shared/icons";
import type { Shell04Props } from "./Shell04.types";

/** Names an item in a tooltip while the sidebar shows only its icon. */
function Tip({ show, label, children }: { show: boolean; label: string; children: ReactElement }) {
    return show ? (
        <Tooltip label={label} placement="right">
            {children}
        </Tooltip>
    ) : (
        children
    );
}

/**
 * An app's frame with a sidebar that folds down to its icons, from a button in the page's toolbar: the labels fade
 * and the edge closes over them, and each item is named in a tooltip. On phones the sidebar becomes a drawer.
 */
export function Shell04({
    workspace,
    logo,
    workspaces,
    onNewWorkspace,
    navigation,
    current,
    defaultCurrent,
    onNavigate,
    defaultCollapsed,
    onCollapsedChange,
    account,
    accountMenu,
    commands,
    breadcrumbs,
    children,
    labels = {},
    className,
    ...props
}: Shell04Props) {
    const id = useId();
    const shell = useAppShell({ current, defaultCurrent: defaultCurrent ?? navigation[0]?.items[0]?.id, onNavigate, commands });
    // Folded on tablets to start with, open on desktops, unless told otherwise; nothing is remembered between visits.
    const [collapsed, setCollapsed] = useState(() => defaultCollapsed ?? window.matchMedia("(max-width: 1023px)").matches);
    const toggle = () => {
        setCollapsed(!collapsed);
        onCollapsedChange?.(!collapsed);
    };
    const searchLabel = labels.search ?? "Search";
    const openSearch = () => shell.setSearchOpen(true);
    const foldLabel = collapsed ? (labels.expand ?? "Expand sidebar") : (labels.collapse ?? "Collapse sidebar");

    /** Everything in the sidebar; the same list goes in the drawer on phones, always unfolded there. */
    const sidebar = (folded: boolean) => (
        <div className="ow-shell04__nav">
            <Tip show={folded} label={workspace}>
                <Menu
                    label={labels.workspaces ?? "Workspaces"}
                    width={232}
                    trigger={
                        <Button variant="ghost" size="sm" fullWidth className="ow-shell04__workspace" endIcon={<ChevronsUpDownIcon size={15} />}>
                            {logo}
                            <Text as="span" variant="card-title" tone="default" className="ow-shell04__workspace-name ow-shell04__fade">
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
                        spacerClassName="ow-shell04__menu-spacer"
                    />
                </Menu>
            </Tip>

            {shell.hasSearch ? (
                <Tip show={folded} label={searchLabel}>
                    <Button size="sm" fullWidth className="ow-shell04__search" startIcon={<SearchIcon size={15} />} shortcut="⌘K" onClick={openSearch}>
                        <Text as="span" tone="muted" className="ow-shell04__search-text ow-shell04__fade">
                            {searchLabel}
                        </Text>
                    </Button>
                </Tip>
            ) : null}

            {navigation.map((group, index) => (
                <NavList key={index} label={group.label} heading={group.heading}>
                    {group.items.map((item) => (
                        <Tip
                            key={item.id}
                            show={folded}
                            label={typeof item.count === "number" || typeof item.count === "string" ? `${item.label} (${item.count})` : item.label}
                        >
                            <NavItem
                                icon={
                                    <span className="ow-shell04__icon">
                                        {item.icon}
                                        {item.unread ? <span className="ow-shell04__unread" aria-hidden="true" /> : null}
                                    </span>
                                }
                                href={item.href}
                                active={shell.active === item.id}
                                end={item.count}
                                onClick={() => shell.navigate(item.id)}
                            >
                                {item.label}
                            </NavItem>
                        </Tip>
                    ))}
                </NavList>
            ))}

            <div className="ow-shell04__account">
                <Tip show={folded} label={account.name}>
                    <Menu
                        label={labels.account ?? "Account"}
                        above
                        width={232}
                        trigger={
                            <Button variant="ghost" fullWidth className="ow-shell04__user" endIcon={<ChevronsUpDownIcon size={15} />}>
                                <Avatar name={account.name} src={account.avatar} size="sm" />
                                <span className="ow-shell04__user-text ow-shell04__fade">
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
                </Tip>
            </div>
        </div>
    );

    return (
        <div className={cx("ow-shell04", collapsed && "ow-shell04--collapsed", className)} {...props}>
            <aside id={`${id}-sidebar`} className="ow-shell04__aside" aria-label={labels.navigation ?? "Main navigation"}>
                {sidebar(collapsed)}
            </aside>

            <div className="ow-shell04__body">
                <header className="ow-shell04__topbar">
                    <Button variant="ghost" iconOnly aria-label={labels.openNavigation ?? "Open navigation"} onClick={() => shell.setNavOpen(true)}>
                        <MenuIcon size={18} />
                    </Button>
                    <Text as="span" variant="card-title" className="ow-shell04__topbar-brand">
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

                <main className="ow-shell04__panel">
                    <div className="ow-shell04__toolbar">
                        <Tooltip label={foldLabel} placement="bottom">
                            <Button
                                variant="ghost"
                                size="sm"
                                iconOnly
                                aria-label={foldLabel}
                                aria-expanded={!collapsed}
                                aria-controls={`${id}-sidebar`}
                                onClick={toggle}
                            >
                                {collapsed ? <PanelLeftOpenIcon size={16} /> : <PanelLeftCloseIcon size={16} />}
                            </Button>
                        </Tooltip>
                        {breadcrumbs?.length ? (
                            <>
                                <span className="ow-shell04__toolbar-divider" aria-hidden="true" />
                                <Text as="span" tone="muted" className="ow-shell04__crumbs">
                                    {breadcrumbs.slice(0, -1).map((crumb, index) => (
                                        <Fragment key={index}>
                                            {crumb}
                                            <ChevronRightIcon size={14} />
                                        </Fragment>
                                    ))}
                                    <Text as="span" variant="label" tone="default">
                                        {breadcrumbs[breadcrumbs.length - 1]}
                                    </Text>
                                </Text>
                            </>
                        ) : null}
                    </div>

                    <div className="ow-shell04__page">{children}</div>
                </main>
            </div>

            <Drawer open={shell.navOpen} onClose={() => shell.setNavOpen(false)} side="left" size={300} title={labels.menu ?? "Menu"}>
                {sidebar(false)}
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
