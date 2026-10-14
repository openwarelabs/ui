import { MenuItem, MenuLabel, MenuSeparator } from "@openwarelabs/ui";

import { CheckIcon, PlusIcon } from "@blocks/shared/icons";
import type { AppWorkspaceItemsProps } from "@blocks/shared/shared.types";

/** The workspace menu's items: its heading, each workspace with the current one ticked, then a new one. */
export function AppWorkspaceItems({ workspaces, onNewWorkspace, heading, newWorkspace, spacerClassName }: AppWorkspaceItemsProps) {
    return (
        <>
            <MenuLabel>{heading}</MenuLabel>
            {workspaces.map((workspace) => (
                <MenuItem
                    key={workspace.name}
                    icon={workspace.current ? <CheckIcon size={15} /> : <span className={spacerClassName} />}
                    onSelect={workspace.onSelect}
                >
                    {workspace.name}
                </MenuItem>
            ))}
            <MenuSeparator />
            <MenuItem icon={<PlusIcon size={15} />} onSelect={onNewWorkspace}>
                {newWorkspace}
            </MenuItem>
        </>
    );
}
