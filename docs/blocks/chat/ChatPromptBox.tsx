import { Chat02 } from "@openwarelabs/blocks";
import { toast, type PromptAttachment } from "@openwarelabs/ui";
import { BookOpen, Bug, FlaskConical, FolderGit2, Sparkles } from "lucide-react";

const projects = ["marketing-site", "billing-api", "mobile-app", "docs", "design-system"];

const models = [
    { id: "quick", label: "Quick", description: "Small fixes and questions" },
    { id: "balanced", label: "Balanced", description: "Most tasks" },
    { id: "thorough", label: "Thorough", description: "Large changes across many files" },
];

const suggestions = [
    { label: "Write tests for invoice dates", icon: <FlaskConical size={16} /> },
    { label: "Update the API reference", icon: <BookOpen size={16} /> },
    { label: "Why did mobile-app fail?", icon: <Bug size={16} /> },
];

const attached: PromptAttachment[] = [
    { id: "format", name: "format.ts", type: "text/typescript", size: 2_140 },
    { id: "invoice", name: "invoice-0412.pdf", type: "application/pdf", size: 184_320 },
];

export function ChatPromptBox() {
    return (
        <Chat02
            title="What should the agent work on?"
            description="Describe the task in plain words. The agent plans it first, and asks before it pushes anything."
            pickers={[
                {
                    id: "project",
                    label: "Project",
                    icon: <FolderGit2 size={14} />,
                    options: projects.map((project) => ({ value: project, label: project })),
                    defaultValue: "billing-api",
                },
                {
                    id: "model",
                    label: "Model",
                    icon: <Sparkles size={14} />,
                    options: models.map((model) => ({ value: model.id, label: model.label, description: model.description })),
                    defaultValue: "balanced",
                },
            ]}
            defaultAttachments={attached}
            suggestions={suggestions}
            onSend={({ attachments, choices }) => {
                const model = models.find((option) => option.id === choices.model)!;
                const extra = attachments.length ? ` and ${attachments.length} attached file${attachments.length === 1 ? "" : "s"}` : "";
                toast.success("Task sent to the agent", {
                    description: `It's planning the work in ${choices.project} now, using the ${model.label} model${extra}.`,
                });
            }}
            labels={{ placeholder: "Fix the invoice dates for customers outside the UTC time zone…" }}
        />
    );
}
