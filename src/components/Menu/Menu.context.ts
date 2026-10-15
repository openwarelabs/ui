import { createContext } from "react";

import type { MenuContextValue } from "./Menu.types";

/** Lets a MenuItem close the menu around it. Menu and ContextMenu both provide it. */
export const MenuContext = createContext<MenuContextValue | null>(null);
