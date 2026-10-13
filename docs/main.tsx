import "@fontsource-variable/inter";
import "@fontsource-variable/geist-mono";
import "docs:styles";
import "./docs.css";

import { createRoot } from "react-dom/client";

import { App } from "./app/App";

createRoot(document.getElementById("root")!).render(<App />);
