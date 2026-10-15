import { useEffect, useState } from "react";

import {
    Accordion,
    AccordionItem,
    Button,
    Drawer,
    NavigationMenu,
    NavigationMenuGroup,
    NavigationMenuItem,
    NavigationMenuLink,
    NavItem,
    NavList,
    SiteHeader,
    Text,
} from "@openwarelabs/ui";
import {
    BookOpen,
    Bot,
    ChartLine,
    LifeBuoy,
    Menu as MenuIcon,
    Newspaper,
    Plug,
    ShieldCheck,
    Workflow,
} from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "NavigationMenu",
    category: "Navigation",
    description:
        "A site's top navigation, with buttons that open panels of links: icons and descriptions, titled columns, a featured card, up to full-width mega-menus. It fits in SiteHeader's nav.",
    source: "components/NavigationMenu/NavigationMenu.tsx",
    imports: ["NavigationMenu", "NavigationMenuItem", "NavigationMenuLink", "NavigationMenuGroup"],
    props: [
        "NavigationMenuProps",
        "NavigationMenuItemProps",
        "NavigationMenuLinkProps",
        "NavigationMenuGroupProps",
    ],
    keyboard: [
        ["Enter / Space", "On a trigger, opens or closes its panel."],
        [
            "Tab",
            "From an open trigger, moves into its panel's links; tabbing out of the menu closes it.",
        ],
        ["Left / Right", "Moves between the top-level items, mirrored in right-to-left text."],
        [
            "Down",
            "On a trigger, opens its panel and moves to the first link. In a panel, goes to the next link.",
        ],
        ["Up", "In a panel, goes to the previous link, and from the first back to its trigger."],
        ["Escape", "Closes the panel and returns focus to its trigger."],
    ],
    notes: [
        "It's the disclosure pattern, not a menu: triggers are buttons with aria-expanded and aria-controls, panels hold ordinary links, and screen readers browse them as links.",
        "Hovering opens a panel after 150ms; once one is open, moving to another trigger switches at once. A panel opened by hovering stays 300ms after the pointer leaves, so it can cross into it; one opened by a click stays until a click outside, Escape or Tab moves away.",
        "On touch screens a tap opens and closes a panel; nothing opens on hover.",
        'NavigationMenuLink\'s active sets aria-current="page". Following any link in a panel closes it, for apps that route without reloading.',
        "Panels sit in the top layer, so SiteHeader's blur and overflow can't clip them. panelWidth=\"full\" makes them as wide as the header around the menu.",
        "Columns stack under 640px wide. SiteHeader hides its nav under 760px: put the same links in a Drawer behind a menu button there, as in the SiteHeader example below.",
        "Inside SiteHeader, set landmark={false}: SiteHeader's nav is already the landmark.",
    ],
    related: ["SiteHeader", "NavList", "Menu", "Popover", "Drawer"],
    since: "0.15.0",
};

const product = [
    {
        title: "Agents",
        description: "Run tasks on a schedule or on demand.",
        icon: <Bot size={18} />,
    },
    {
        title: "Workflows",
        description: "Chain steps together, with approvals.",
        icon: <Workflow size={18} />,
    },
    {
        title: "Integrations",
        description: "Connect the tools you already use.",
        icon: <Plug size={18} />,
    },
    {
        title: "Analytics",
        description: "See what ran, and what it cost.",
        icon: <ChartLine size={18} />,
    },
];

/** Two panels of links with icons and descriptions, and a plain link. */
export function Basic() {
    return (
        <NavigationMenu label="Main">
            <NavigationMenuItem trigger="Product" columns={2}>
                {product.map((link) => (
                    <NavigationMenuLink
                        key={link.title}
                        href="#/components/navigation-menu"
                        {...link}
                    />
                ))}
            </NavigationMenuItem>
            <NavigationMenuItem trigger="Resources">
                <NavigationMenuLink
                    href="#/components/navigation-menu"
                    icon={<BookOpen size={18} />}
                    title="Docs"
                    description="Guides and the API."
                    active
                />
                <NavigationMenuLink
                    href="#/components/navigation-menu"
                    icon={<Newspaper size={18} />}
                    title="Blog"
                />
                <NavigationMenuLink
                    href="#/components/navigation-menu"
                    icon={<LifeBuoy size={18} />}
                    title="Support"
                />
            </NavigationMenuItem>
            <NavigationMenuItem trigger="Pricing" href="#/components/navigation-menu" />
        </NavigationMenu>
    );
}
Basic.layout = { align: "start" as const, minHeight: 300 };

/** A full-width mega-menu: a featured card and two titled columns. */
export function MegaMenu() {
    return (
        <div style={{ width: "100%" }}>
            <NavigationMenu label="Main" panelWidth="full">
                <NavigationMenuItem trigger="Platform" columns={3}>
                    <NavigationMenuLink
                        featured
                        href="#/components/navigation-menu"
                        icon={<ShieldCheck size={22} />}
                        title="Openware 2.0"
                        description="Audit logs, roles and single sign-on, for teams of any size."
                    />
                    <NavigationMenuGroup title="Build">
                        {product.slice(0, 2).map((link) => (
                            <NavigationMenuLink
                                key={link.title}
                                href="#/components/navigation-menu"
                                {...link}
                            />
                        ))}
                    </NavigationMenuGroup>
                    <NavigationMenuGroup title="Operate">
                        {product.slice(2).map((link) => (
                            <NavigationMenuLink
                                key={link.title}
                                href="#/components/navigation-menu"
                                {...link}
                            />
                        ))}
                    </NavigationMenuGroup>
                </NavigationMenuItem>
                <NavigationMenuItem trigger="Company" columns={2}>
                    <NavigationMenuGroup title="About">
                        <NavigationMenuLink href="#/components/navigation-menu" title="Team" />
                        <NavigationMenuLink href="#/components/navigation-menu" title="Careers" />
                    </NavigationMenuGroup>
                    <NavigationMenuGroup title="News">
                        <NavigationMenuLink href="#/components/navigation-menu" title="Blog" />
                        <NavigationMenuLink href="#/components/navigation-menu" title="Press" />
                    </NavigationMenuGroup>
                </NavigationMenuItem>
                <NavigationMenuItem trigger="Pricing" href="#/components/navigation-menu" />
            </NavigationMenu>
        </div>
    );
}
MegaMenu.layout = { fill: true, align: "start" as const, minHeight: 340 };

function useNarrow(query = "(max-width: 760px)") {
    const [narrow, setNarrow] = useState(
        () => typeof window !== "undefined" && window.matchMedia(query).matches,
    );
    useEffect(() => {
        const list = window.matchMedia(query);
        const update = () => setNarrow(list.matches);
        list.addEventListener("change", update);
        return () => list.removeEventListener("change", update);
    }, [query]);
    return narrow;
}

/** In SiteHeader's nav, with full-width panels; under 760px a menu button opens the same links in a Drawer. */
export function InSiteHeader() {
    const narrow = useNarrow();
    const [open, setOpen] = useState(false);
    return (
        <div style={{ width: "100%" }}>
            <SiteHeader
                brand={<a href="#/components/navigation-menu">Acme</a>}
                nav={
                    <NavigationMenu landmark={false} panelWidth="full">
                        <NavigationMenuItem trigger="Product" columns={2}>
                            {product.map((link) => (
                                <NavigationMenuLink
                                    key={link.title}
                                    href="#/components/navigation-menu"
                                    {...link}
                                />
                            ))}
                        </NavigationMenuItem>
                        <NavigationMenuItem trigger="Resources" columns={2}>
                            <NavigationMenuGroup title="Learn">
                                <NavigationMenuLink
                                    href="#/components/navigation-menu"
                                    icon={<BookOpen size={18} />}
                                    title="Docs"
                                />
                                <NavigationMenuLink
                                    href="#/components/navigation-menu"
                                    icon={<Newspaper size={18} />}
                                    title="Blog"
                                />
                            </NavigationMenuGroup>
                            <NavigationMenuGroup title="Get help">
                                <NavigationMenuLink
                                    href="#/components/navigation-menu"
                                    icon={<LifeBuoy size={18} />}
                                    title="Support"
                                />
                            </NavigationMenuGroup>
                        </NavigationMenuItem>
                        <NavigationMenuItem trigger="Pricing" href="#/components/navigation-menu" />
                    </NavigationMenu>
                }
                actions={
                    narrow ? (
                        <Button
                            variant="secondary"
                            shape="pill"
                            size="sm"
                            startIcon={<MenuIcon size={16} />}
                            onClick={() => setOpen(true)}
                        >
                            Menu
                        </Button>
                    ) : (
                        <Button variant="primary" shape="pill" size="sm">
                            Sign up
                        </Button>
                    )
                }
            />
            <Drawer open={open} onClose={() => setOpen(false)} title="Menu" size={360}>
                <Accordion variant="separated">
                    <AccordionItem value="product" title="Product">
                        <NavList label="Product">
                            {product.map((link) => (
                                <NavItem
                                    key={link.title}
                                    href="#/components/navigation-menu"
                                    icon={link.icon}
                                    onClick={() => setOpen(false)}
                                >
                                    {link.title}
                                </NavItem>
                            ))}
                        </NavList>
                    </AccordionItem>
                    <AccordionItem value="resources" title="Resources">
                        <NavList label="Resources">
                            <NavItem
                                href="#/components/navigation-menu"
                                onClick={() => setOpen(false)}
                            >
                                Docs
                            </NavItem>
                            <NavItem
                                href="#/components/navigation-menu"
                                onClick={() => setOpen(false)}
                            >
                                Support
                            </NavItem>
                        </NavList>
                    </AccordionItem>
                </Accordion>
            </Drawer>
        </div>
    );
}
InSiteHeader.layout = {
    fill: true,
    align: "start" as const,
    ground: "paper" as const,
    minHeight: 320,
};

/** value and onValueChange keep which panel is open in your own state. */
export function Controlled() {
    const [value, setValue] = useState<string | null>(null);
    return (
        <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
            <Text variant="caption" tone="muted">
                Open: {value ?? "none"}
            </Text>
            <NavigationMenu label="Docs" value={value} onValueChange={setValue}>
                <NavigationMenuItem value="guides" trigger="Guides">
                    <NavigationMenuLink
                        href="#/components/navigation-menu"
                        title="Getting started"
                        description="Install it and add your first component."
                    />
                    <NavigationMenuLink
                        href="#/components/navigation-menu"
                        title="Theming"
                        description="Brand colour, light and dark."
                    />
                </NavigationMenuItem>
                <NavigationMenuItem value="reference" trigger="Reference">
                    <NavigationMenuLink href="#/components/navigation-menu" title="Components" />
                    <NavigationMenuLink href="#/components/navigation-menu" title="Tokens" />
                </NavigationMenuItem>
            </NavigationMenu>
        </div>
    );
}
Controlled.layout = { align: "start" as const, minHeight: 260 };
