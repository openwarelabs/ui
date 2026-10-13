import { useEffect, useId, useState } from "react";

import { Badge, Button, buttonClassName, Chip, cx, Link, Menu, MenuItem, MenuSeparator, Popover, Text } from "@openwarelabs/ui";
import {
    Activity,
    ArrowRight,
    BookOpen,
    Bot,
    ChevronDown,
    CodeXml,
    GitPullRequest,
    GraduationCap,
    History,
    Menu as MenuIcon,
    MessagesSquare,
    Rocket,
    SquareKanban,
    X,
} from "lucide-react";

import "./HeaderFullWidth.css";

const product = [
    { icon: SquareKanban, title: "Planning", text: "Projects, cycles and a board that keeps itself current.", href: "#planning" },
    { icon: Bot, title: "Agents", text: "Routine tickets, done by agents and sent back for review.", href: "#agents" },
    { icon: GitPullRequest, title: "Reviews", text: "Every change beside the reasoning behind it.", href: "#reviews" },
    { icon: Rocket, title: "Deploys", text: "Ship from the review, and roll back in one click.", href: "#deploys" },
];

const resources = [
    { icon: BookOpen, label: "Documentation", href: "#docs" },
    { icon: GraduationCap, label: "Guides", href: "#guides" },
    { icon: CodeXml, label: "API reference", href: "#api" },
    { icon: History, label: "Changelog", href: "#changelog" },
];

const community = [
    { icon: MessagesSquare, label: "Community", href: "#community" },
    { icon: Activity, label: "Status", href: "#status" },
];

const links = [
    { label: "Customers", href: "#customers" },
    { label: "Pricing", href: "#pricing" },
];

/** Menu items are buttons, so send them where a link would go. Swap in your router's navigate(). */
function go(href: string) {
    window.location.hash = href;
}

function Brand() {
    return (
        <Link href="#" variant="standalone" className="header-full-width__brand">
            <span className="header-full-width__mark" aria-hidden="true" />
            Acme
        </Link>
    );
}

function ProductPanel({ onNavigate }: { onNavigate: () => void }) {
    return (
        <div className="header-full-width__product">
            <ul className="header-full-width__features">
                {product.map(({ icon: Icon, title, text, href }) => (
                    <li key={title}>
                        <Link href={href} variant="standalone" className="header-full-width__feature" onClick={onNavigate}>
                            <span className="header-full-width__feature-icon" aria-hidden="true">
                                <Icon size={16} />
                            </span>
                            <span className="header-full-width__feature-text">
                                <Text variant="label">{title}</Text>
                                <Text variant="caption">{text}</Text>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Link href="#announcement" variant="standalone" className="header-full-width__news" onClick={onNavigate}>
                <Badge size="sm" variant="active">
                    New
                </Badge>
                <Text variant="label">Agents now open their own pull requests</Text>
                <Text as="span" tone="primary" className="header-full-width__news-link">
                    Read the announcement
                    <ArrowRight size={14} aria-hidden="true" />
                </Text>
            </Link>
        </div>
    );
}

export function HeaderFullWidth() {
    // On wide screens the product menu opens as the preview loads, to show it; on phones the links fold into a panel.
    const [productOpen, setProductOpen] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 761px)").matches);
    const [panelOpen, setPanelOpen] = useState(false);
    const panelId = useId();

    useEffect(() => {
        const wide = window.matchMedia("(min-width: 761px)");
        const onChange = () => (wide.matches ? setPanelOpen(false) : setProductOpen(false));
        wide.addEventListener("change", onChange);
        return () => wide.removeEventListener("change", onChange);
    }, []);

    return (
        <div className="header-full-width">
            <header className="header-full-width__bar">
                <div className="header-full-width__inner">
                    <Brand />
                    <nav className="header-full-width__nav" aria-label="Main">
                        <Popover
                            className="header-full-width__popover"
                            aria-label="Product"
                            width={720}
                            autoFocus={false}
                            open={productOpen}
                            onOpenChange={setProductOpen}
                            trigger={
                                <Button
                                    variant="ghost"
                                    shape="pill"
                                    size="sm"
                                    className="header-full-width__item"
                                    endIcon={<ChevronDown size={14} aria-hidden="true" />}
                                >
                                    Product
                                </Button>
                            }
                        >
                            <ProductPanel onNavigate={() => setProductOpen(false)} />
                        </Popover>
                        <Menu
                            label="Resources"
                            width={220}
                            trigger={
                                <Button
                                    variant="ghost"
                                    shape="pill"
                                    size="sm"
                                    className="header-full-width__item"
                                    endIcon={<ChevronDown size={14} aria-hidden="true" />}
                                >
                                    Resources
                                </Button>
                            }
                        >
                            {resources.map(({ icon: Icon, label, href }) => (
                                <MenuItem key={label} icon={<Icon size={15} />} onSelect={() => go(href)}>
                                    {label}
                                </MenuItem>
                            ))}
                            <MenuSeparator />
                            {community.map(({ icon: Icon, label, href }) => (
                                <MenuItem key={label} icon={<Icon size={15} />} onSelect={() => go(href)}>
                                    {label}
                                </MenuItem>
                            ))}
                        </Menu>
                        {links.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className={cx(buttonClassName({ variant: "ghost", shape: "pill", size: "sm" }), "header-full-width__item")}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <div className="header-full-width__actions">
                        <a
                            href="#sign-in"
                            className={cx(
                                buttonClassName({ variant: "ghost", shape: "pill", size: "sm" }),
                                "header-full-width__item header-full-width__sign-in",
                            )}
                        >
                            Sign in
                        </a>
                        <Button variant="primary" shape="pill" size="sm">
                            Start for free
                        </Button>
                        <Button
                            className="header-full-width__toggle"
                            variant="ghost"
                            size="sm"
                            iconOnly
                            aria-label="Menu"
                            aria-expanded={panelOpen}
                            aria-controls={panelId}
                            onClick={() => setPanelOpen((open) => !open)}
                        >
                            {panelOpen ? <X size={18} /> : <MenuIcon size={18} />}
                        </Button>
                    </div>
                </div>

                {/* Phones: everything in the bar, folded into a panel under it. */}
                <nav id={panelId} className="header-full-width__panel" aria-label="Main" hidden={!panelOpen}>
                    <Text variant="overline" as="p" className="header-full-width__panel-label">
                        Product
                    </Text>
                    <ul className="header-full-width__panel-list">
                        {product.map(({ icon: Icon, title, href }) => (
                            <li key={title}>
                                <Link href={href} variant="standalone" className="header-full-width__panel-link" onClick={() => setPanelOpen(false)}>
                                    <Icon size={16} aria-hidden="true" />
                                    {title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Text variant="overline" as="p" className="header-full-width__panel-label">
                        Resources
                    </Text>
                    <ul className="header-full-width__panel-list header-full-width__panel-list--columns">
                        {[...resources, ...community].map(({ label, href }) => (
                            <li key={label}>
                                <Link href={href} variant="standalone" className="header-full-width__panel-link" onClick={() => setPanelOpen(false)}>
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <ul className="header-full-width__panel-list header-full-width__panel-list--ruled">
                        {links.map((link) => (
                            <li key={link.label}>
                                <Link href={link.href} variant="standalone" className="header-full-width__panel-link" onClick={() => setPanelOpen(false)}>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Button shape="pill" fullWidth onClick={() => setPanelOpen(false)}>
                        Sign in
                    </Button>
                </nav>
            </header>

            {/* Your page */}
            <main className="header-full-width__page">
                <Chip>Reviews</Chip>
                <Text variant="page-title" className="header-full-width__title">
                    One queue for every change
                </Text>
                <Text variant="lead" className="header-full-width__lead">
                    Pull requests from your team and from agents land side by side, each with its diff, its tests and the reasoning behind it.
                </Text>
            </main>
        </div>
    );
}
