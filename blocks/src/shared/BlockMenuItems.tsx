import { Fragment } from "react";

import { MenuItem, MenuSeparator } from "@openwarelabs/ui";

import type { BlockMenuItemsProps } from "@blocks/shared/shared.types";

/** A menu's items, each a MenuItem, with a separator before those that start a new group. */
export function BlockMenuItems({ items, onAfterSelect }: BlockMenuItemsProps) {
    return (
        <>
            {items.map((item, index) => (
                <Fragment key={index}>
                    {item.separatorBefore ? <MenuSeparator /> : null}
                    <MenuItem
                        icon={item.icon}
                        disabled={item.disabled}
                        destructive={item.destructive}
                        onSelect={
                            item.onSelect || onAfterSelect
                                ? () => {
                                      item.onSelect?.();
                                      onAfterSelect?.(item);
                                  }
                                : undefined
                        }
                    >
                        {item.label}
                    </MenuItem>
                </Fragment>
            ))}
        </>
    );
}
