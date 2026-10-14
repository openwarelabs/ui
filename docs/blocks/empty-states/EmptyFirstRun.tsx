import { Empty01 } from "@openwarelabs/blocks";
import { FileUp, FolderKanban, GitBranch, LayoutTemplate } from "lucide-react";

export function EmptyFirstRun() {
    return (
        <Empty01
            title="Projects"
            description="Each project holds a repository's tasks, agent runs, reviews and deploys."
            icon={<FolderKanban size={20} />}
            emptyTitle="No projects yet"
            emptyDescription="Create a project for each thing your team ships. Agents, reviews and deploys all start from one."
            ways={[
                {
                    id: "repository",
                    title: "Connect a repository",
                    description: "Its code, branches and history.",
                    icon: <GitBranch size={20} />,
                    source: "Connected repository",
                    recommended: true,
                    dialogDescription: "Name the project; you'll pick the repository next.",
                },
                {
                    id: "template",
                    title: "Start from a template",
                    description: "A site, an API or a mobile app.",
                    icon: <LayoutTemplate size={20} />,
                    source: "From a template",
                    dialogDescription: "Name the project; you'll pick a template next.",
                },
                {
                    id: "import",
                    title: "Import issues",
                    description: "From a CSV or another tracker.",
                    icon: <FileUp size={20} />,
                    source: "Imported issues",
                    dialogDescription: "Name the project; you'll choose the file to import next.",
                },
            ]}
        />
    );
}
