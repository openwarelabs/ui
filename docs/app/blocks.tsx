import type { CSSProperties, ReactNode } from "react";

/*
 * Blocks: ready-made page sections built from Openware components, to copy into a project and change.
 * Each category lists its blocks, the components they're made from, and a wireframe sketch for the index.
 * A block's code lives in docs/blocks/<category slug>/<id>.tsx and <id>.css; see docs/blocks/README.md.
 */

export type BlockGroup = "Marketing" | "Application";

export type SketchKind =
    | "header"
    | "hero"
    | "section-heading"
    | "hero-split"
    | "features"
    | "features-alternating"
    | "features-bento"
    | "logos"
    | "stats"
    | "testimonials"
    | "pricing"
    | "pricing-table"
    | "faq"
    | "cta"
    | "newsletter"
    | "blog"
    | "team"
    | "contact"
    | "footer"
    | "shell"
    | "shell-topbar"
    | "shell-three-pane"
    | "page-heading"
    | "dashboard"
    | "table"
    | "list"
    | "form"
    | "steps"
    | "settings"
    | "auth"
    | "auth-split"
    | "onboarding"
    | "empty"
    | "error"
    | "notifications"
    | "chat";

export interface BlockVariant {
    /** The block's component and file name: docs/blocks/<category slug>/<id>.tsx exports function <id>. */
    id: string;
    name: string;
    description: string;
    /** Defaults to the category's sketch. */
    sketch?: SketchKind;
    /** Its component in @openwarelabs/blocks, which takes the content as props. Without one, the block is code to copy. */
    component?: string;
    /**
     * A fixed height for the preview, in pixels, for blocks that fill the window (app shells, sign-in pages) or
     * open something over the page. Without it the preview grows to fit the block.
     */
    height?: number;
}

export interface BlockCategory {
    slug: string;
    title: string;
    group: BlockGroup;
    description: string;
    sketch: SketchKind;
    /** The Openware components the blocks are made from. */
    uses: string[];
    /**
     * A component from the package that these blocks are built around. Its page lives here rather than under
     * Components: its examples and props show after the blocks, and links to it come here.
     */
    component?: string;
    variants: BlockVariant[];
}

export const blockGroups: Array<{ name: BlockGroup; description: string }> = [
    { name: "Marketing", description: "Sections for a product's site: what it is, why it's good, what it costs and how to start." },
    { name: "Application", description: "Screens inside an app: the frame around everything, and the pages people spend their time in." },
];

export const blockCategories: BlockCategory[] = [
    {
        slug: "headers",
        title: "Headers",
        group: "Marketing",
        description: "The bar along the top of a site: the logo, a few links and one call to action.",
        sketch: "header",
        uses: ["SiteHeader", "Button", "Menu", "Drawer"],
        component: "SiteHeader",
        variants: [
            { id: "HeaderFloatingPill", component: "Header01", name: "Floating pill", description: "Commandr's header: a blurred pill that floats above the page and follows it down.", height: 440 },
            { id: "HeaderFullWidth", component: "Header02", name: "Full-width bar", description: "A bar across the top with menus that open on product and resources.", height: 460 },
            { id: "HeaderCentredLogo", component: "Header03", name: "Centred logo", description: "The logo in the middle with links either side, for a brand-led site." },
            { id: "HeaderAnnouncement", component: "Header04", name: "With an announcement", description: "A slim line above the header for a launch or an update, with a link and a close button." },
            { id: "HeaderPhoneMenu", component: "Header05", name: "Phone menu", description: "Links folded into a drawer behind a menu button on narrow screens.", height: 560 },
        ],
    },
    {
        slug: "heroes",
        title: "Heroes",
        group: "Marketing",
        description: "The first screen: what the product is, who it's for and the one thing to do next.",
        sketch: "hero",
        uses: ["SectionHeading", "Chip", "Button", "Input", "DotGrid"],
        variants: [
            { id: "HeroCentred", component: "Hero01", name: "Centred with a screenshot", description: "A headline, a line under it, two buttons, and the product below in a framed screenshot." },
            { id: "HeroSplit", component: "Hero02", name: "Split with an image", description: "Words on the left, the product on the right; they stack on phones.", sketch: "hero-split" },
            { id: "HeroEmail", component: "Hero03", name: "With an email field", description: "A headline and a field to join a waitlist or start a trial in one step." },
            { id: "HeroDotGrid", component: "Hero04", name: "On a dot grid", description: "The headline on Openware's dot grid, with the dots turning brass under the pointer." },
            { id: "HeroLogos", component: "Hero05", name: "With logos below", description: "The usual hero, then a row of customers' logos as the first proof." },
            { id: "HeroDownload", component: "Hero06", name: "Download buttons", description: "For a desktop app: buttons for each platform, with the one for this computer first.", sketch: "hero-split" },
        ],
    },
    {
        slug: "section-headings",
        title: "Section headings",
        group: "Marketing",
        description: "How a section opens: a small label, a big light title and a line or two under it.",
        sketch: "section-heading",
        uses: ["SectionHeading", "Chip", "Button", "Link"],
        component: "SectionHeading",
        variants: [
            { id: "SectionHeadingCentred", component: "SectionHeading01", name: "Centred", description: "The label, the title and the intro centred over the section, for features and pricing." },
            { id: "SectionHeadingWithLink", component: "SectionHeading02", name: "With a link", description: "The heading on the left and a link to the rest on the right, for a preview of posts or releases." },
            { id: "SectionHeadingSplit", component: "SectionHeading03", name: "Split", description: "The title on the left; the intro and a button on the right, for a wide section." },
        ],
    },
    {
        slug: "features",
        title: "Features",
        group: "Marketing",
        description: "What the product does, in a handful of short claims with something to look at.",
        sketch: "features",
        uses: ["SectionHeading", "Card", "Tabs", "Badge"],
        variants: [
            { id: "FeaturesColumns", component: "Features01", name: "Three columns with icons", description: "An icon, a short title and a sentence each, in a grid that drops to one column on phones." },
            { id: "FeaturesAlternating", component: "Features02", name: "Alternating image and text", description: "Rows that swap sides, each with a screenshot and a few lines.", sketch: "features-alternating" },
            { id: "FeaturesBento", component: "Features03", name: "Bento grid", description: "Cards of different sizes, the biggest for the feature that matters most.", sketch: "features-bento" },
            { id: "FeaturesTabs", component: "Features04", name: "Tabs that change the screenshot", description: "A row of tabs; each one shows its part of the product." },
            { id: "FeaturesChecklist", component: "Features05", name: "Checklist beside a screenshot", description: "A list of what's included next to one large image.", sketch: "features-alternating" },
        ],
    },
    {
        slug: "logo-clouds",
        title: "Logo clouds",
        group: "Marketing",
        description: "Who uses it: a quiet row of customers' or partners' logos.",
        sketch: "logos",
        uses: ["SectionHeading"],
        variants: [
            { id: "LogosRow", component: "Logos01", name: "Single row", description: "Five or six logos in one row under a small heading." },
            { id: "LogosGrid", component: "Logos02", name: "Grid", description: "Logos in tiles, for a longer list." },
            { id: "LogosMarquee", component: "Logos03", name: "Scrolling", description: "A slow, endless row that pauses on hover and stands still with reduced motion." },
        ],
    },
    {
        slug: "stats",
        title: "Stats",
        group: "Marketing",
        description: "A few numbers that make the case, with what each one counts.",
        sketch: "stats",
        uses: ["Stat", "SectionHeading"],
        variants: [
            { id: "StatsRow", component: "Stats01", name: "Row of numbers", description: "Three or four large numbers, each with a short label." },
            { id: "StatsCards", component: "Stats02", name: "On cards", description: "Each number on its own card, with a trend line." },
            { id: "StatsSplit", component: "Stats03", name: "Beside a heading", description: "A heading and a paragraph on the left, numbers on the right." },
        ],
    },
    {
        slug: "testimonials",
        title: "Testimonials",
        group: "Marketing",
        description: "What customers say, with their name, role and face. The quotes here are samples, marked as such.",
        sketch: "testimonials",
        uses: ["Card", "User", "Avatar"],
        variants: [
            { id: "TestimonialSingle", component: "Testimonial01", name: "Single quote", description: "One large quote with the person under it." },
            { id: "TestimonialGrid", component: "Testimonial02", name: "Grid of quotes", description: "Several short quotes in cards, in columns." },
            { id: "TestimonialLogo", component: "Testimonial03", name: "With a company logo", description: "A quote, the person, and their company's logo." },
        ],
    },
    {
        slug: "pricing",
        title: "Pricing",
        group: "Marketing",
        description: "Plans side by side, with the recommended one raised and the price easy to compare.",
        sketch: "pricing",
        uses: ["Card", "Badge", "Button", "SegmentedControl", "Table"],
        variants: [
            { id: "PricingPlans", component: "Pricing01", name: "Three plans", description: "Three cards, the middle one marked as the one most people pick." },
            { id: "PricingToggle", component: "Pricing02", name: "Monthly or yearly", description: "The same plans with a switch between monthly and yearly prices." },
            { id: "PricingComparison", component: "Pricing03", name: "Comparison table", description: "Every feature down the side and a tick or a limit for each plan.", sketch: "pricing-table" },
            { id: "PricingSingle", component: "Pricing04", name: "One plan", description: "A single price with what's included, for a simple product." },
            { id: "PricingUsage", component: "Pricing05", name: "Pay as you go", description: "A price per unit with a slider to estimate the monthly cost." },
        ],
    },
    {
        slug: "faq",
        title: "FAQs",
        group: "Marketing",
        description: "The questions people ask before they buy, answered in a sentence or two.",
        sketch: "faq",
        uses: ["Accordion", "SectionHeading", "Link"],
        variants: [
            { id: "FaqAccordion", component: "Faq01", name: "Accordion", description: "Questions that open one at a time." },
            { id: "FaqColumns", component: "Faq02", name: "Two columns", description: "A heading on the left, the questions on the right." },
            { id: "FaqContact", component: "Faq03", name: "With a contact card", description: "The questions, and a card for anything they don't cover." },
        ],
    },
    {
        slug: "calls-to-action",
        title: "Calls to action",
        group: "Marketing",
        description: "The last push near the end of a page: one sentence and one button.",
        sketch: "cta",
        uses: ["Button", "SectionHeading", "DotGrid"],
        variants: [
            { id: "CtaBanner", component: "Cta01", name: "Banner", description: "A wide panel with a headline and a button." },
            { id: "CtaBrand", component: "Cta02", name: "On the brand colour", description: "The same panel in the brand colour, with white text." },
            { id: "CtaSplit", component: "Cta03", name: "Split with an image", description: "Words and a button beside a screenshot." },
        ],
    },
    {
        slug: "newsletter",
        title: "Newsletter sign-up",
        group: "Marketing",
        description: "An email field and a button, with what people will get and how often.",
        sketch: "newsletter",
        uses: ["Input", "Button", "Field"],
        variants: [
            { id: "NewsletterInline", component: "Newsletter01", name: "Inline", description: "A heading, a field and a button in one row." },
            { id: "NewsletterCard", component: "Newsletter02", name: "Card", description: "The same in a card, for the end of a post." },
        ],
    },
    {
        slug: "blog",
        title: "Blog and changelog",
        group: "Marketing",
        description: "Lists of posts and releases, and the page each one opens.",
        sketch: "blog",
        uses: ["Card", "Badge", "User", "Tag"],
        variants: [
            { id: "BlogGrid", component: "Blog01", name: "Post grid", description: "Cards with an image, a title, a date and the author." },
            { id: "BlogFeatured", component: "Blog02", name: "Featured post", description: "One large post on top, smaller ones below." },
            { id: "Changelog", component: "Blog03", name: "Changelog", description: "Releases down a timeline, each with New, Improved and Fixed.", sketch: "list" },
            { id: "BlogArticle", component: "Blog04", name: "Article", description: "A post's page: title, author, the text at a readable width, and an On this page list.", sketch: "list" },
        ],
    },
    {
        slug: "team",
        title: "Team",
        group: "Marketing",
        description: "The people behind the product, with their roles.",
        sketch: "team",
        uses: ["Avatar", "Card"],
        variants: [
            { id: "TeamGrid", component: "Team01", name: "Avatar grid", description: "Faces, names and roles in a grid." },
            { id: "TeamCards", component: "Team02", name: "Cards", description: "A card each, with a line about what they do." },
        ],
    },
    {
        slug: "contact",
        title: "Contact",
        group: "Marketing",
        description: "Ways to get in touch: a form, an email address, and where to find help first.",
        sketch: "contact",
        uses: ["Field", "Input", "Textarea", "Select", "Button", "Card"],
        variants: [
            { id: "ContactForm", component: "Contact01", name: "Form with details", description: "A short form beside an email address and a reply time." },
            { id: "ContactSupport", component: "Contact02", name: "Support options", description: "Cards for docs, community and email, before any form." },
        ],
    },
    {
        slug: "footers",
        title: "Footers",
        group: "Marketing",
        description: "The end of every page: links in columns, the legal line and the theme switch.",
        sketch: "footer",
        uses: ["Link", "Separator", "SegmentedControl", "Input"],
        variants: [
            { id: "FooterColumns", component: "Footer01", name: "Columns of links", description: "The logo and a line, then three or four columns of links." },
            { id: "FooterSimple", component: "Footer02", name: "Simple", description: "One line of links and the copyright, centred." },
            { id: "FooterNewsletter", component: "Footer03", name: "With a newsletter field", description: "Columns of links and a sign-up field." },
            { id: "FooterBrand", component: "Footer04", name: "Big brand mark", description: "The product's name set very large across the bottom." },
        ],
    },
    {
        slug: "app-shells",
        title: "App shells",
        group: "Application",
        description: "The frame around an app: navigation, the header and where the page goes.",
        sketch: "shell",
        uses: ["NavList", "NavItem", "Avatar", "Menu", "CommandPalette", "Drawer", "ScrollShadow"],
        variants: [
            { id: "ShellSidebar", name: "Sidebar", description: "Navigation down the left, the account at the bottom, the page on a raised panel.", height: 640 },
            { id: "ShellTopBar", name: "Top bar", description: "Navigation across the top, for apps with a few sections.", sketch: "shell-topbar", height: 640 },
            { id: "ShellThreePane", name: "Three panes", description: "A list, the item open beside it and an inspector on the right, like Commandr's projects.", sketch: "shell-three-pane", height: 640 },
            { id: "ShellCollapsible", name: "Collapsible sidebar", description: "A sidebar that folds down to icons, and into a drawer on phones.", height: 640 },
        ],
    },
    {
        slug: "page-headings",
        title: "Page headings",
        group: "Application",
        description: "The top of a page in an app: where you are, what it is and what you can do.",
        sketch: "page-heading",
        uses: ["Breadcrumbs", "Button", "Tabs", "Badge", "SearchField"],
        variants: [
            { id: "PageHeadingActions", name: "Title and actions", description: "The page's name with one primary action and a menu for the rest." },
            { id: "PageHeadingTabs", name: "With breadcrumbs and tabs", description: "Where it sits above, and tabs for its views below." },
            { id: "PageHeadingFilters", name: "With search and filters", description: "A search field and filter tags for the list under it." },
        ],
    },
    {
        slug: "dashboards",
        title: "Dashboards",
        group: "Application",
        description: "A page of what's happening: a few numbers, a chart and what changed recently.",
        sketch: "dashboard",
        uses: ["Stat", "Card", "Table", "ProgressBar", "Badge"],
        variants: [
            { id: "DashboardChart", name: "Stats and a chart", description: "A row of stats, then a chart across the page." },
            { id: "DashboardActivity", name: "Activity", description: "Recent events in a feed beside the numbers." },
            { id: "DashboardUsage", name: "Usage and billing", description: "Spend against a budget, by project, with the next invoice." },
        ],
    },
    {
        slug: "lists-and-tables",
        title: "Lists and tables",
        group: "Application",
        description: "Many records at once, with ways to find, sort and act on them.",
        sketch: "table",
        uses: ["Table", "Pagination", "SearchField", "Tag", "Menu", "EmptyState", "Checkbox"],
        variants: [
            { id: "TableToolbar", name: "Table with a toolbar", description: "Search, filters and a primary action above a sortable table." },
            { id: "TableBulkActions", name: "Bulk actions", description: "Select rows and a bar appears with what you can do to all of them." },
            { id: "ListStacked", name: "Stacked list", description: "Rows with a title, a line of detail and a status, for phones too.", sketch: "list" },
            { id: "ListCards", name: "Grid of cards", description: "Projects or files as cards, with a menu on each." },
        ],
    },
    {
        slug: "forms",
        title: "Form layouts",
        group: "Application",
        description: "How fields sit together on a page: labels, hints, sections and the buttons at the end.",
        sketch: "form",
        uses: ["Field", "Fieldset", "Input", "Select", "Textarea", "Checkbox", "Button", "Steps"],
        variants: [
            { id: "FormSingle", name: "Single column", description: "Fields stacked under their labels, one action at the end." },
            { id: "FormSections", name: "Sections with descriptions", description: "Each section's title and purpose on the left, its fields on the right." },
            { id: "FormSteps", name: "Multi-step", description: "A longer form split into steps, with progress at the top.", sketch: "steps" },
        ],
    },
    {
        slug: "settings",
        title: "Settings",
        group: "Application",
        description: "Where people change how things work: grouped, labelled, and saved as they go.",
        sketch: "settings",
        uses: ["Dialog", "NavList", "SettingsRow", "Card", "Switch", "Select", "ConfirmDialog"],
        variants: [
            { id: "SettingsDialog", name: "Settings dialog", description: "Commandr's: sections down the left of a dialog, rows of settings on an inset panel.", height: 680 },
            { id: "SettingsPage", name: "Settings page", description: "The same sections as a full page, for web apps." },
            { id: "SettingsApiKeys", name: "API keys", description: "Keys in a table, each with a copy button, the date it was last used and a way to revoke it.", height: 600 },
            { id: "SettingsMembers", name: "Members and roles", description: "People with their role and a menu to change it or remove them." },
            { id: "SettingsDanger", name: "Danger zone", description: "Deleting the account or a project, with a confirmation that names what goes.", height: 560 },
        ],
    },
    {
        slug: "sign-in",
        title: "Sign in and sign up",
        group: "Application",
        description: "Getting into the app, with as little to type as possible.",
        sketch: "auth",
        uses: ["Card", "Field", "Input", "Button", "Separator", "InputOTP", "Link"],
        variants: [
            { id: "SignInCard", name: "Sign-in card", description: "Email and password on a card, with GitHub and Google above them.", height: 720 },
            { id: "SignInSplit", name: "Split with a picture", description: "The form on one side, the product or a quote on the other.", sketch: "auth-split", height: 720 },
            { id: "SignInMagicLink", name: "Magic link", description: "An email field, then a page saying where the link went.", height: 600 },
            { id: "SignInTwoFactor", name: "Two-factor code", description: "Six boxes for the code from an authenticator app.", height: 600 },
            { id: "SignInReset", name: "Reset password", description: "Ask for the email, then a new password with what it needs.", height: 640 },
        ],
    },
    {
        slug: "onboarding",
        title: "Onboarding",
        group: "Application",
        description: "The first few minutes: getting set up and to the first useful thing.",
        sketch: "onboarding",
        uses: ["Steps", "ChoiceCard", "Button", "ProgressBar", "Dialog"],
        variants: [
            { id: "OnboardingChecklist", name: "Checklist", description: "Commandr's first-run steps, with the current one open and its action beside it." },
            { id: "OnboardingChoice", name: "Choose how to start", description: "Two or three ChoiceCards: from scratch, from a template, or import." },
            { id: "OnboardingWelcome", name: "Welcome dialog", description: "A short dialog for what's new, with one button to carry on.", height: 560 },
        ],
    },
    {
        slug: "empty-states",
        title: "Empty states",
        group: "Application",
        description: "What a page shows before there's anything in it, and the way to add the first thing.",
        sketch: "empty",
        uses: ["EmptyState", "Button", "ChoiceCard"],
        variants: [
            { id: "EmptyFirstRun", name: "First run", description: "What will be here and the button that makes the first one." },
            { id: "EmptyNoResults", name: "No results", description: "What was searched for and a way back." },
            { id: "EmptyError", name: "Couldn't load", description: "What went wrong and a button to try again." },
        ],
    },
    {
        slug: "error-pages",
        title: "Error pages",
        group: "Application",
        description: "Pages for when something's missing or broken, with a way home.",
        sketch: "error",
        uses: ["Button", "Link", "DotGrid"],
        variants: [
            { id: "ErrorNotFound", name: "Not found", description: "A 404 with a search field and links to the main places.", height: 600 },
            { id: "ErrorServer", name: "Something went wrong", description: "A 500 with a button to try again and how to report it.", height: 600 },
            { id: "ErrorMaintenance", name: "Down for maintenance", description: "When it'll be back, and where to follow the status.", height: 600 },
        ],
    },
    {
        slug: "notifications",
        title: "Notifications and activity",
        group: "Application",
        description: "What happened and what needs you, in a list or a popover.",
        sketch: "notifications",
        uses: ["Popover", "Badge", "Avatar", "Tabs", "Switch"],
        variants: [
            { id: "NotificationsInbox", name: "Inbox popover", description: "A bell with a count that opens the latest, with Mark all as read.", height: 560 },
            { id: "NotificationsFeed", name: "Activity feed", description: "Events in order, each with who, what and when." },
            { id: "NotificationsSettings", name: "Notification settings", description: "Which events reach email, push or nowhere, in a grid of switches." },
        ],
    },
    {
        slug: "chat",
        title: "Chat and agents",
        group: "Application",
        description: "Conversations with people or AI agents: messages, the prompt box and what an agent is doing.",
        sketch: "chat",
        uses: ["Textarea", "Button", "Avatar", "CodeBlock", "Steps", "Badge"],
        variants: [
            { id: "ChatThread", name: "Chat thread", description: "Messages with avatars and times, code in blocks, and a box to reply.", height: 640 },
            { id: "ChatPromptBox", name: "Prompt box", description: "A growing text box with attachments, a model menu and a send button." },
            { id: "ChatAgentRun", name: "Agent run", description: "An agent's steps as they happen, each with its status and what it changed.", sketch: "list" },
        ],
    },
];

export const blockVariantCount = blockCategories.reduce((sum, category) => sum + category.variants.length, 0);

/** "heroes/HeroCentred": where a block's files are, and how the frame finds it. */
export const blockId = (category: BlockCategory, variant: BlockVariant) => `${category.slug}/${variant.id}`;

/* Wireframes: lines for text, boxes for images and cards, pills for buttons. */

const w = (width: string | number): CSSProperties => ({ width: typeof width === "number" ? `${width}%` : width });

/** A width in percent that still shows in a row sized by its content, where a percentage alone comes to nothing. */
const sized = (width: number, floor: number): CSSProperties => ({ width: `${width}%`, minWidth: Math.min(width * 2.2, floor) });

function L({ width = 60, strong = false }: { width?: number; strong?: boolean }) {
    return <span className={`sk-line${strong ? " sk-line--strong" : ""}`} style={sized(width, 26)} />;
}

function T({ width = 50 }: { width?: number }) {
    return <span className="sk-title" style={w(width)} />;
}

function B({ primary = false, width = 18 }: { primary?: boolean; width?: number }) {
    return <span className={`sk-button${primary ? " sk-button--primary" : ""}`} style={sized(width, 40)} />;
}

function Box({ children, className = "", style }: { children?: ReactNode; className?: string; style?: CSSProperties }) {
    return (
        <span className={`sk-box ${className}`} style={style}>
            {children}
        </span>
    );
}

const Dot = ({ size = 8, brand = false }: { size?: number; brand?: boolean }) => (
    <span className={`sk-dot${brand ? " sk-dot--brand" : ""}`} style={{ width: size, height: size }} />
);

function Row({ children, gap = 6, justify, align = "center", style }: { children: ReactNode; gap?: number; justify?: CSSProperties["justifyContent"]; align?: CSSProperties["alignItems"]; style?: CSSProperties }) {
    return <span className="sk-row" style={{ gap, justifyContent: justify, alignItems: align, ...style }}>{children}</span>;
}

function Col({ children, gap = 5, align, style }: { children: ReactNode; gap?: number; align?: CSSProperties["alignItems"]; style?: CSSProperties }) {
    return <span className="sk-col" style={{ gap, alignItems: align, ...style }}>{children}</span>;
}

function Grid({ children, columns = 3, gap = 6, style }: { children: ReactNode; columns?: number; gap?: number; style?: CSSProperties }) {
    return <span className="sk-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap, ...style }}>{children}</span>;
}

const repeat = (count: number, render: (index: number) => ReactNode) => Array.from({ length: count }, (_, index) => render(index));

const NavBar = () => (
    <Row justify="space-between" style={{ width: "100%" }}>
        <Row gap={4}>
            <Dot brand size={7} />
            <L width={22} strong />
        </Row>
        <Row gap={5} style={{ flex: 1, justifyContent: "center" }}>
            <L width={12} />
            <L width={12} />
            <L width={12} />
        </Row>
        <B primary width={14} />
    </Row>
);

const sketches: Record<SketchKind, () => ReactNode> = {
    header: () => (
        <Col gap={10} style={{ width: "100%" }}>
            <Box className="sk-box--pill" style={{ padding: "6px 8px" }}>
                <NavBar />
            </Box>
            <Col gap={5} align="center" style={{ marginTop: 10 }}>
                <T width={56} />
                <L width={40} />
            </Col>
        </Col>
    ),
    hero: () => (
        <Col gap={6} align="center" style={{ width: "100%" }}>
            <span className="sk-chip" />
            <T width={70} />
            <T width={52} />
            <L width={46} />
            <Row gap={5} style={{ margin: "4px 0 6px" }}>
                <B primary />
                <B />
            </Row>
            <Box style={{ width: "86%", height: 34 }} />
        </Col>
    ),
    "hero-split": () => (
        <Row gap={10} style={{ width: "100%" }}>
            <Col gap={6} style={{ flex: 1 }}>
                <span className="sk-chip" />
                <T width={90} />
                <T width={70} />
                <L width={80} />
                <Row gap={5} style={{ marginTop: 4 }}>
                    <B primary width={34} />
                    <B width={28} />
                </Row>
            </Col>
            <Box style={{ flex: 1, height: 70 }} />
        </Row>
    ),
    features: () => (
        <Col gap={10} align="center" style={{ width: "100%" }}>
            <T width={44} />
            <Grid columns={3} gap={8} style={{ width: "100%" }}>
                {repeat(3, (index) => (
                    <Col key={index} gap={4}>
                        <span className="sk-icon" />
                        <L width={70} strong />
                        <L width={90} />
                        <L width={60} />
                    </Col>
                ))}
            </Grid>
        </Col>
    ),
    "features-alternating": () => (
        <Col gap={8} style={{ width: "100%" }}>
            {repeat(2, (index) => (
                <Row key={index} gap={10} style={{ flexDirection: index % 2 ? "row-reverse" : "row" }}>
                    <Col gap={4} style={{ flex: 1 }}>
                        <L width={60} strong />
                        <L width={90} />
                        <L width={70} />
                    </Col>
                    <Box style={{ flex: 1, height: 34 }} />
                </Row>
            ))}
        </Col>
    ),
    "features-bento": () => (
        <span className="sk-bento">
            <Box style={{ gridArea: "a" }} />
            <Box style={{ gridArea: "b" }} />
            <Box style={{ gridArea: "c" }} />
            <Box style={{ gridArea: "d" }} />
        </span>
    ),
    logos: () => (
        <Col gap={10} align="center" style={{ width: "100%" }}>
            <L width={36} />
            <Row gap={8} justify="center">
                {repeat(5, (index) => (
                    <span key={index} className="sk-logo" />
                ))}
            </Row>
        </Col>
    ),
    stats: () => (
        <Grid columns={3} gap={10} style={{ width: "100%" }}>
            {repeat(3, (index) => (
                <Col key={index} gap={5} align="center">
                    <span className="sk-number" />
                    <L width={70} />
                </Col>
            ))}
        </Grid>
    ),
    testimonials: () => (
        <Grid columns={2} gap={8} style={{ width: "100%" }}>
            {repeat(2, (index) => (
                <Box key={index} className="sk-box--card">
                    <Col gap={4}>
                        <L width={95} />
                        <L width={85} />
                        <L width={60} />
                        <Row gap={4} style={{ marginTop: 4 }}>
                            <Dot size={10} />
                            <L width={40} strong />
                        </Row>
                    </Col>
                </Box>
            ))}
        </Grid>
    ),
    pricing: () => (
        <Grid columns={3} gap={6} style={{ width: "100%", alignItems: "center" }}>
            {repeat(3, (index) => (
                <Box key={index} className={`sk-box--card${index === 1 ? " sk-box--raised" : ""}`}>
                    <Col gap={4}>
                        <L width={50} strong />
                        <span className="sk-number" style={{ width: "60%" }} />
                        <L width={80} />
                        <L width={70} />
                        <B primary={index === 1} width={100} />
                    </Col>
                </Box>
            ))}
        </Grid>
    ),
    "pricing-table": () => (
        <Col gap={5} style={{ width: "100%" }}>
            <Grid columns={4} gap={6}>
                <span />
                {repeat(3, (index) => (
                    <L key={index} width={60} strong />
                ))}
            </Grid>
            {repeat(4, (row) => (
                <Grid key={row} columns={4} gap={6} style={{ alignItems: "center" }}>
                    <L width={80} />
                    {repeat(3, (index) => (
                        <Dot key={index} size={6} brand={index >= row % 3} />
                    ))}
                </Grid>
            ))}
        </Col>
    ),
    faq: () => (
        <Col gap={5} style={{ width: "100%" }}>
            <T width={30} />
            {repeat(4, (index) => (
                <Box key={index} className="sk-box--row">
                    <Row justify="space-between" style={{ width: "100%" }}>
                        <L width={60} strong />
                        <span className="sk-chevron" />
                    </Row>
                </Box>
            ))}
        </Col>
    ),
    cta: () => (
        <Box className="sk-box--brand" style={{ width: "100%", padding: "16px 12px" }}>
            <Col gap={6} align="center">
                <span className="sk-title sk-title--on-brand" style={w(60)} />
                <span className="sk-line sk-line--on-brand" style={w(44)} />
                <span className="sk-button sk-button--on-brand" style={w(20)} />
            </Col>
        </Box>
    ),
    newsletter: () => (
        <Col gap={6} align="center" style={{ width: "100%" }}>
            <T width={50} />
            <L width={40} />
            <Row gap={5} style={{ width: "70%", marginTop: 4 }}>
                <span className="sk-input" style={{ flex: 1 }} />
                <B primary width={24} />
            </Row>
        </Col>
    ),
    blog: () => (
        <Grid columns={3} gap={6} style={{ width: "100%" }}>
            {repeat(3, (index) => (
                <Col key={index} gap={4}>
                    <Box style={{ height: 30 }} />
                    <L width={90} strong />
                    <L width={70} />
                    <Row gap={3}>
                        <Dot size={7} />
                        <L width={40} />
                    </Row>
                </Col>
            ))}
        </Grid>
    ),
    team: () => (
        <Grid columns={4} gap={8} style={{ width: "100%" }}>
            {repeat(4, (index) => (
                <Col key={index} gap={4} align="center">
                    <Dot size={20} />
                    <L width={70} strong />
                    <L width={50} />
                </Col>
            ))}
        </Grid>
    ),
    contact: () => (
        <Row gap={10} align="flex-start" style={{ width: "100%" }}>
            <Col gap={4} style={{ flex: 1 }}>
                <T width={70} />
                <L width={90} />
                <L width={60} />
            </Col>
            <Col gap={5} style={{ flex: 1.2 }}>
                <span className="sk-input" />
                <span className="sk-input" />
                <span className="sk-input sk-input--tall" />
                <B primary width={34} />
            </Col>
        </Row>
    ),
    footer: () => (
        <Col gap={8} style={{ width: "100%", marginTop: "auto" }}>
            <Grid columns={4} gap={8}>
                <Col gap={4}>
                    <Row gap={4}>
                        <Dot brand size={7} />
                        <L width={50} strong />
                    </Row>
                    <L width={80} />
                </Col>
                {repeat(3, (index) => (
                    <Col key={index} gap={4}>
                        <L width={50} strong />
                        <L width={70} />
                        <L width={60} />
                        <L width={65} />
                    </Col>
                ))}
            </Grid>
            <span className="sk-rule" />
            <Row justify="space-between">
                <L width={30} />
                <L width={16} />
            </Row>
        </Col>
    ),
    shell: () => (
        <Row gap={6} align="stretch" style={{ width: "100%", height: "100%" }}>
            <Col gap={5} style={{ width: "26%" }}>
                <Row gap={4}>
                    <Dot brand size={7} />
                    <L width={60} strong />
                </Row>
                {repeat(5, (index) => (
                    <span key={index} className={`sk-nav${index === 1 ? " sk-nav--active" : ""}`} />
                ))}
                <span style={{ flex: 1 }} />
                <Row gap={4}>
                    <Dot size={9} />
                    <L width={50} />
                </Row>
            </Col>
            <Box className="sk-box--panel" style={{ flex: 1 }}>
                <Col gap={5}>
                    <T width={40} />
                    <L width={70} />
                    <Box style={{ height: 30, marginTop: 4 }} />
                </Col>
            </Box>
        </Row>
    ),
    "shell-topbar": () => (
        <Col gap={6} style={{ width: "100%", height: "100%" }}>
            <NavBar />
            <Box className="sk-box--panel" style={{ flex: 1 }}>
                <Col gap={5}>
                    <T width={30} />
                    <Grid columns={3} gap={5}>
                        {repeat(3, (index) => (
                            <Box key={index} style={{ height: 22 }} />
                        ))}
                    </Grid>
                </Col>
            </Box>
        </Col>
    ),
    "shell-three-pane": () => (
        <Row gap={5} align="stretch" style={{ width: "100%", height: "100%" }}>
            <Col gap={4} style={{ width: "24%" }}>
                {repeat(5, (index) => (
                    <span key={index} className={`sk-nav${index === 0 ? " sk-nav--active" : ""}`} />
                ))}
            </Col>
            <Box className="sk-box--panel" style={{ flex: 1 }}>
                <Col gap={5}>
                    <T width={50} />
                    <L width={80} />
                    <L width={70} />
                </Col>
            </Box>
            <Col gap={4} style={{ width: "24%" }}>
                <L width={60} strong />
                <L width={90} />
                <L width={70} />
            </Col>
        </Row>
    ),
    "section-heading": () => (
        <Col gap={6} style={{ width: "100%" }}>
            <span className="sk-chip" />
            <T width={64} />
            <T width={44} />
            <L width={56} />
            <L width={40} />
        </Col>
    ),
    "page-heading": () => (
        <Col gap={7} style={{ width: "100%" }}>
            <Row gap={3}>
                <L width={10} />
                <L width={10} />
                <L width={12} strong />
            </Row>
            <Row justify="space-between">
                <T width={40} />
                <Row gap={4}>
                    <B width={14} />
                    <B primary width={18} />
                </Row>
            </Row>
            <Row gap={8}>
                <span className="sk-tab sk-tab--active" />
                <span className="sk-tab" />
                <span className="sk-tab" />
            </Row>
            <span className="sk-rule" />
        </Col>
    ),
    dashboard: () => (
        <Col gap={6} style={{ width: "100%" }}>
            <Grid columns={3} gap={6}>
                {repeat(3, (index) => (
                    <Box key={index} className="sk-box--card">
                        <Col gap={3}>
                            <L width={50} />
                            <span className="sk-number" style={{ width: "50%" }} />
                        </Col>
                    </Box>
                ))}
            </Grid>
            <Box className="sk-box--card" style={{ height: 40 }}>
                <svg className="sk-chart" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 24 L15 20 L30 22 L45 14 L60 16 L75 8 L90 10 L100 4" />
                </svg>
            </Box>
        </Col>
    ),
    table: () => (
        <Col gap={5} style={{ width: "100%" }}>
            <Row justify="space-between">
                <span className="sk-input" style={{ width: "40%" }} />
                <B primary width={18} />
            </Row>
            <Box className="sk-box--card" style={{ padding: 0 }}>
                <Col gap={0}>
                    {repeat(5, (index) => (
                        <span key={index} className={`sk-table-row${index === 0 ? " sk-table-row--head" : ""}`}>
                            <L width={index === 0 ? 40 : 60} strong={index === 0} />
                            <L width={50} />
                            <span className={index === 0 ? "sk-line" : "sk-badge"} style={w(index === 0 ? 30 : 40)} />
                        </span>
                    ))}
                </Col>
            </Box>
        </Col>
    ),
    list: () => (
        <Col gap={0} style={{ width: "100%" }}>
            {repeat(4, (index) => (
                <span key={index} className="sk-list-row">
                    <span className="sk-timeline-dot" />
                    <Col gap={3} style={{ flex: 1 }}>
                        <L width={50 + ((index * 13) % 30)} strong />
                        <L width={70} />
                    </Col>
                    <span className="sk-badge" style={w(14)} />
                </span>
            ))}
        </Col>
    ),
    form: () => (
        <Col gap={6} style={{ width: "62%", margin: "0 auto" }}>
            {repeat(3, (index) => (
                <Col key={index} gap={3}>
                    <L width={30} strong />
                    <span className="sk-input" />
                </Col>
            ))}
            <Row gap={4} justify="flex-end">
                <B width={22} />
                <B primary width={26} />
            </Row>
        </Col>
    ),
    steps: () => (
        <Col gap={10} style={{ width: "100%" }}>
            <span className="sk-steps">
                {repeat(4, (index) => (
                    <span key={index} className={`sk-step${index === 0 ? " sk-step--done" : index === 1 ? " sk-step--current" : ""}`} />
                ))}
            </span>
            <Col gap={5} style={{ width: "62%", margin: "0 auto" }}>
                <span className="sk-input" />
                <span className="sk-input" />
                <Row justify="flex-end">
                    <B primary width={30} />
                </Row>
            </Col>
        </Col>
    ),
    settings: () => (
        <Box className="sk-box--card" style={{ width: "100%", padding: 6 }}>
            <Row gap={6} align="stretch">
                <Col gap={4} style={{ width: "28%" }}>
                    {repeat(5, (index) => (
                        <span key={index} className={`sk-nav${index === 0 ? " sk-nav--active" : ""}`} />
                    ))}
                </Col>
                <Box className="sk-box--panel" style={{ flex: 1, padding: 0 }}>
                    <Col gap={0}>
                        {repeat(3, (index) => (
                            <span key={index} className="sk-settings-row">
                                <Col gap={3} style={{ flex: 1 }}>
                                    <L width={40} strong />
                                    <L width={60} />
                                </Col>
                                <span className={`sk-switch${index !== 1 ? " sk-switch--on" : ""}`} />
                            </span>
                        ))}
                    </Col>
                </Box>
            </Row>
        </Box>
    ),
    auth: () => (
        <Box className="sk-box--card" style={{ width: "52%", margin: "0 auto" }}>
            <Col gap={5} align="center">
                <Dot brand size={10} />
                <T width={60} />
                <B width={100} />
                <span className="sk-rule" />
                <span className="sk-input" style={{ width: "100%" }} />
                <span className="sk-input" style={{ width: "100%" }} />
                <B primary width={100} />
            </Col>
        </Box>
    ),
    "auth-split": () => (
        <Row gap={10} align="stretch" style={{ width: "100%", height: "100%" }}>
            <Col gap={5} style={{ flex: 1, justifyContent: "center" }}>
                <T width={60} />
                <span className="sk-input" />
                <span className="sk-input" />
                <B primary width={100} />
            </Col>
            <Box className="sk-box--brand" style={{ flex: 1 }} />
        </Row>
    ),
    onboarding: () => (
        <Box className="sk-box--card" style={{ width: "70%", margin: "0 auto" }}>
            <Col gap={5}>
                <L width={40} strong />
                {repeat(3, (index) => (
                    <Row key={index} gap={5}>
                        <span className={`sk-check${index === 0 ? " sk-check--done" : ""}`} />
                        <L width={index === 1 ? 60 : 50} strong={index === 1} />
                        {index === 1 ? <B primary width={18} /> : null}
                    </Row>
                ))}
            </Col>
        </Box>
    ),
    empty: () => (
        <Col gap={6} align="center" style={{ width: "100%" }}>
            <span className="sk-icon sk-icon--large" />
            <L width={36} strong />
            <L width={50} />
            <Row gap={5} style={{ marginTop: 4 }}>
                <B primary width={20} />
                <B width={18} />
            </Row>
        </Col>
    ),
    error: () => (
        <Col gap={6} align="center" style={{ width: "100%" }}>
            <span className="sk-error">404</span>
            <L width={40} strong />
            <L width={50} />
            <B primary width={22} />
        </Col>
    ),
    notifications: () => (
        <Box className="sk-box--card" style={{ width: "64%", margin: "0 auto", padding: 0 }}>
            <Col gap={0}>
                {repeat(4, (index) => (
                    <span key={index} className="sk-list-row sk-list-row--tight">
                        <Dot size={10} />
                        <Col gap={3} style={{ flex: 1 }}>
                            <L width={70} strong />
                            <L width={40} />
                        </Col>
                        {index < 2 ? <Dot brand size={5} /> : null}
                    </span>
                ))}
            </Col>
        </Box>
    ),
    chat: () => (
        <Col gap={5} style={{ width: "100%", height: "100%" }}>
            <Row gap={5} align="flex-start">
                <Dot size={10} />
                <Box className="sk-bubble">
                    <L width={90} />
                    <L width={60} />
                </Box>
            </Row>
            <Row gap={5} justify="flex-end">
                <Box className="sk-bubble sk-bubble--mine">
                    <span className="sk-line sk-line--on-brand" style={w(80)} />
                </Box>
            </Row>
            <span style={{ flex: 1 }} />
            <Row gap={5}>
                <span className="sk-input" style={{ flex: 1 }} />
                <span className="sk-send" />
            </Row>
        </Col>
    ),
};

/** A wireframe of a kind of block, for the index. */
export function Sketch({ kind, size = "card" }: { kind: SketchKind; size?: "card" | "large" }) {
    return (
        <span className={`sk sk--${size}`} aria-hidden="true">
            {sketches[kind]()}
        </span>
    );
}

export const blockHref = (slug?: string) => (slug ? `#/blocks/${slug}` : "#/blocks");
