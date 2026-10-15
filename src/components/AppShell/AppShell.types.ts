import type { HTMLAttributes, ReactNode } from "react";

export interface AppShellProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** What goes down the left: a SidebarHeader, a SidebarContent with NavLists, a SidebarFooter. On narrow screens the same goes in a drawer. */
    sidebar: ReactNode;
    /** The page. It goes in a `main` landmark. */
    children: ReactNode;
    /** `inset` puts the page on a raised panel beside the sidebar, on the canvas; `flat` puts it straight on the surface, with a line between them.
     * @default "inset" */
    variant?: "inset" | "flat";
    /** Lets people fold the sidebar down to its icons, with a SidebarToggle. Labels show as tooltips while it's folded. @default false */
    collapsible?: boolean;
    /** Folded, when you control it. */
    collapsed?: boolean;
    /** Folded at first, when it controls itself. @default false */
    defaultCollapsed?: boolean;
    /** Called when it folds or unfolds: keep `collapsed` here, or save the choice. */
    onCollapsedChange?(collapsed: boolean): void;
    /** How narrow the shell gets before the sidebar folds into a drawer: `sm` under 560px, `md` under 900px, `lg` under
     * 1200px. It's the shell's own width, not the window's.
     * @default "md" */
    breakpoint?: "sm" | "md" | "lg";
    /** The left of the bar on narrow screens, beside the menu button: usually the logo and the app's name. */
    topbar?: ReactNode;
    /** The right of the bar on narrow screens: a search or an account button. */
    topbarActions?: ReactNode;
    /** The words it uses, for other languages. */
    labels?: {
        /** Names the sidebar for screen readers. @default "Main navigation" */
        navigation?: string;
        /** The menu button on narrow screens. @default "Open navigation" */
        openNavigation?: string;
        /** The drawer's title. @default "Menu" */
        menu?: string;
    };
}

export interface SidebarSectionProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export interface SidebarToggleProps {
    /** @default { collapse: "Collapse sidebar", expand: "Expand sidebar" } */
    labels?: { collapse?: string; expand?: string };
    className?: string;
}
