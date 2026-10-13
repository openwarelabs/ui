// main.tsx, or wherever your app starts
import "@openwarelabs/ui/fonts.css"; // Inter and Geist Mono, self-hosted
import "@openwarelabs/ui/styles.css"; // the tokens and every component's styles

import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
