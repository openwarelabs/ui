type Theme = "light" | "dark" | "system";

export function setTheme(theme: Theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
}

// In <head>, before the page paints, so it never flashes the wrong theme:
// <script>document.documentElement.dataset.theme = localStorage.getItem("theme") ?? "system";</script>
