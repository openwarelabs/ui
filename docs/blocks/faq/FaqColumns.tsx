import { Faq02 } from "@openwarelabs/blocks";

const questions = [
    {
        id: "trial",
        question: "Is there a free trial of the paid plans?",
        answer: "Yes. Team and Business are free for 14 days, with no card needed. When the trial ends you pick a plan, or the workspace moves to Free and keeps every project.",
    },
    {
        id: "main",
        question: "Can agents push straight to our main branch?",
        answer: "No. Agents work on their own branches and open pull requests. Your branch rules apply to them like anyone else, so a person approves every change before it ships.",
    },
    {
        id: "keys",
        question: "Can we use our own model keys?",
        answer: "On Business and Enterprise, yes. Add a key for your provider in Settings and agent runs use it; we then charge for the run, not the tokens.",
    },
    {
        id: "import",
        question: "How do we bring our issues across?",
        answer: "Import a CSV, or connect GitHub Issues and pick the repositories. Labels, assignees and comments come with them, and nothing changes at the source.",
    },
    {
        id: "discounts",
        question: "Do you offer discounts?",
        answer: "Half price on Team and Business for registered non-profits, schools and open-source maintainers. Write to us with a link to the project and we'll apply it to your workspace.",
    },
    {
        id: "leaving",
        question: "What happens to our data if we leave?",
        answer: "Export everything as JSON and Git bundles whenever you like. When you delete a workspace we erase it within 30 days, backups included, and confirm by email.",
    },
];

export function FaqColumns() {
    return (
        <Faq02
            eyebrow="FAQ"
            title="Questions, answered"
            description="What teams usually ask before they move their work to Acme. If yours isn't here, the people who build Acme answer within a working day."
            links={[
                { label: "Contact support", href: "#support" },
                { label: "Read the docs", href: "#docs" },
            ]}
            questions={questions}
        />
    );
}
