import { useEffect, useState } from "react";

import { Link, SegmentedControl, Separator } from "@openwarelabs/ui";
import { Monitor, Moon, Sun } from "lucide-react";

import "./FooterColumns.css";

const columns = [
    { title: "Product", links: ["Overview", "Agents", "Reviews", "Deploys", "Pricing", "Changelog"] },
    { title: "Developers", links: ["Documentation", "API reference", "Command line", "Status"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Customers", "Contact"] },
    { title: "Legal", links: ["Privacy", "Terms", "Security", "Data processing"] },
];

const themes = [
    { value: "light", label: null, icon: <Sun size={15} />, "aria-label": "Light" },
    { value: "dark", label: null, icon: <Moon size={15} />, "aria-label": "Dark" },
    { value: "system", label: null, icon: <Monitor size={15} />, "aria-label": "Match the system" },
];

const currentTheme = () => (typeof document === "undefined" ? "system" : (document.documentElement.dataset.theme ?? "system"));

/** Light, dark or the system's choice, set on <html data-theme>. Save it wherever your app keeps preferences. */
function useTheme() {
    const [theme, setTheme] = useState(currentTheme);

    // Stay in step if something else changes the theme.
    useEffect(() => {
        const observer = new MutationObserver(() => setTheme(currentTheme()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        return () => observer.disconnect();
    }, []);

    const choose = (value: string) => {
        document.documentElement.dataset.theme = value;
        setTheme(value);
    };
    return [theme, choose] as const;
}

export function FooterColumns() {
    const [theme, setTheme] = useTheme();

    return (
        <footer className="footer-columns">
            <div className="footer-columns__inner">
                <div className="footer-columns__top">
                    <div className="footer-columns__brand">
                        <a className="footer-columns__logo" href="#" aria-label="Acme home">
                            <span className="footer-columns__mark" aria-hidden="true" />
                            Acme
                        </a>
                        <p className="footer-columns__line">The workspace where software teams plan the work, hand the routine parts to agents, and ship.</p>
                        <Link href="#" variant="standalone" className="footer-columns__status">
                            <span className="footer-columns__status-dot" aria-hidden="true" />
                            All systems normal
                        </Link>
                    </div>

                    {columns.map((column) => (
                        <nav key={column.title} aria-labelledby={`footer-columns-${column.title.toLowerCase()}`}>
                            <h2 id={`footer-columns-${column.title.toLowerCase()}`} className="footer-columns__heading">
                                {column.title}
                            </h2>
                            <ul className="footer-columns__links">
                                {column.links.map((link) => (
                                    <li key={link}>
                                        <Link href="#" variant="standalone">
                                            {link}
                                        </Link>
                                        {link === "Agents" ? <span className="footer-columns__new">New</span> : null}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <Separator />

                <div className="footer-columns__bottom">
                    <p className="footer-columns__legal">
                        <span>© 2026 Acme Ltd. Registered in Ireland, no. 712345.</span>
                        <Link href="#" variant="muted">
                            Cookie settings
                        </Link>
                    </p>
                    <div className="footer-columns__theme">
                        <span id="footer-columns-theme">Theme</span>
                        <SegmentedControl size="sm" aria-labelledby="footer-columns-theme" options={themes} value={theme} onChange={setTheme} />
                    </div>
                </div>
            </div>
        </footer>
    );
}
