import { Header02 } from "@openwarelabs/blocks";
import { Chip, Text } from "@openwarelabs/ui";
import { Activity, BookOpen, Bot, CodeXml, GitPullRequest, GraduationCap, History, MessagesSquare, Rocket, SquareKanban } from "lucide-react";

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

export function HeaderFullWidth() {
    // On wide screens the product menu opens as the preview loads, to show it.
    const wide = typeof window !== "undefined" && window.matchMedia("(min-width: 761px)").matches;
    return (
        <div className="header-full-width">
            <Header02
                brand={{ name: "Acme", href: "#", logo: <span className="header-full-width__mark" aria-hidden="true" /> }}
                panel={{
                    label: "Product",
                    features: product.map(({ icon: Icon, title, text, href }) => ({ title, description: text, href, icon: <Icon size={16} /> })),
                    highlight: { badge: "New", title: "Agents now open their own pull requests", linkLabel: "Read the announcement", href: "#announcement" },
                }}
                menus={[
                    {
                        label: "Resources",
                        groups: [resources, community].map((group) => group.map(({ icon: Icon, label, href }) => ({ label, href, icon: <Icon size={15} /> }))),
                    },
                ]}
                links={links}
                secondaryLink={{ label: "Sign in", href: "#sign-in" }}
                primaryAction={{ label: "Start for free", href: "#start" }}
                onNavigate={go}
                defaultPanelOpen={wide}
            />

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
