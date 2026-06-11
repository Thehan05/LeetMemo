export function initSettings({
    settingsToggle,
    settingsMenu,
    changeUserButton,
    onChangeUsername
}) {
    function open() {
        settingsMenu.hidden = false;
        settingsToggle.setAttribute("aria-expanded", "true");
    }

    function close() {
        settingsMenu.hidden = true;
        settingsToggle.setAttribute("aria-expanded", "false");
    }

    settingsToggle.addEventListener("click", event => {
        event.stopPropagation();
        settingsMenu.hidden ? open() : close();
    });

    settingsMenu.addEventListener("click", event => {
        event.stopPropagation();
    });

    changeUserButton.addEventListener("click", () => {
        close();
        onChangeUsername();
    });

    document.addEventListener("click", close);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !settingsMenu.hidden) {
            close();
            settingsToggle.focus();
        }
    });

    return { close };
}
