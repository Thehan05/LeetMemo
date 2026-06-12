import {
    getStoredValues,
    setStoredValues
} from "../services/storage.js";

export async function initTheme({ root, themeSwitch }) {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    let hasSavedTheme = false;

    function applyTheme(theme) {
        root.dataset.theme = theme;
        themeSwitch.setAttribute(
            "aria-checked",
            String(theme === "dark")
        );
    }

    const { theme: savedTheme } = await getStoredValues("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
        hasSavedTheme = true;
        applyTheme(savedTheme);
    } else {
        applyTheme(systemTheme.matches ? "dark" : "light");
    }

    themeSwitch.addEventListener("click", async () => {
        const nextTheme =
            root.dataset.theme === "dark" ? "light" : "dark";

        hasSavedTheme = true;
        applyTheme(nextTheme);
        await setStoredValues({ theme: nextTheme });
    });

    systemTheme.addEventListener("change", event => {
        if (!hasSavedTheme) {
            applyTheme(event.matches ? "dark" : "light");
        }
    });
}
