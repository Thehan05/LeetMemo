import {
    fetchCalendar,
    fetchProfile,
    fetchRecentSubmissions
} from "./api/leetcode.js";
import { renderCalendar } from "./features/heatmap.js";
import { initNotes } from "./features/notes.js";
import { renderProfile } from "./features/profile.js";
import { initSettings } from "./features/settings.js";
import { initTheme } from "./features/theme.js";
import {
    getStoredValues,
    setStoredValues
} from "./services/storage.js";

document.addEventListener("DOMContentLoaded", async () => {
    const elements = getElements();
    let activeUsername = null;

    const settings = initSettings({
        settingsToggle: elements.settingsToggle,
        settingsMenu: elements.settingsMenu,
        changeUserButton: elements.changeUserButton,
        onChangeUsername() {
            elements.usernameInput.value = activeUsername ?? "";
            showSetup("", true);
            elements.usernameInput.focus();
            elements.usernameInput.select();
        }
    });

    const notes = initNotes({
        recentListView: elements.recentListView,
        noteEditor: elements.noteEditor,
        noteTitle: elements.noteTitle,
        noteBackButton: elements.noteBackButton,
        notesInput: elements.notesInput,
        notesStatus: elements.notesStatus,
        saveNotesButton: elements.saveNotesButton,
        submissionsList: elements.submissionsList
    });

    function showSetup(message = "", canGoBack = false) {
        elements.profileSetup.style.display = "block";
        elements.profileDashboard.style.display = "none";
        elements.setupStatus.textContent = message;
        elements.backButton.hidden = !canGoBack;
        elements.settingsWrapper.hidden = canGoBack;
        elements.changeUserButton.hidden = !activeUsername;
        settings.close();
    }

    function showDashboard(showLoading = true) {
        elements.profileSetup.style.display = "none";
        elements.profileDashboard.style.display = "block";
        elements.setupStatus.textContent = "";
        elements.backButton.hidden = true;
        elements.settingsWrapper.hidden = false;
        elements.changeUserButton.hidden = !activeUsername;
        settings.close();

        if (showLoading) {
            elements.status.textContent = "Loading profile...";
        }
    }

    async function loadProfile(username) {
        showDashboard();

        try {
            const matchedUser = await fetchProfile(username);

            if (!matchedUser) {
                showSetup(
                    "Profile not found. Check the username.",
                    Boolean(activeUsername)
                );
                return;
            }

            renderProfile(matchedUser, elements);
            activeUsername = matchedUser.username;
            elements.changeUserButton.hidden = false;
            await setStoredValues({ username: matchedUser.username });

            const currentYear = new Date().getFullYear();
            const [calendarResult, submissionsResult] =
                await Promise.allSettled([
                    fetchCalendar(username, currentYear),
                    fetchRecentSubmissions(username)
                ]);

            if (calendarResult.status === "fulfilled") {
                renderCalendar(calendarResult.value, elements);
            }

            if (submissionsResult.status === "fulfilled") {
                notes.renderSubmissions(submissionsResult.value);
            }

            const failedResult = [calendarResult, submissionsResult]
                .find(result => result.status === "rejected");

            if (failedResult) {
                console.error(
                    "Some profile data could not be loaded:",
                    failedResult.reason
                );
                elements.status.textContent =
                    "Some profile information could not be loaded.";
            } else {
                elements.status.textContent = "";
            }
        } catch (error) {
            console.error("Could not load profile:", error);
            showSetup(
                "Could not load this profile. Please try again.",
                Boolean(activeUsername)
            );
        }
    }

    elements.loadProfileButton.addEventListener("click", () => {
        const username = elements.usernameInput.value.trim();
        elements.setupStatus.textContent = "";

        if (!username) {
            elements.setupStatus.textContent =
                "Please enter a valid username.";
            elements.usernameInput.focus();
            return;
        }

        loadProfile(username);
    });

    elements.usernameInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            elements.loadProfileButton.click();
        }
    });

    elements.backButton.addEventListener("click", () => {
        if (activeUsername) {
            elements.setupStatus.textContent = "";
            showDashboard(false);
        }
    });

    try {
        await initTheme({
            root: document.documentElement,
            themeSwitch: elements.themeSwitch
        });

        const { username } = await getStoredValues("username");

        if (username) {
            await loadProfile(username);
        } else {
            showSetup();
        }
    } catch (error) {
        console.error("Could not initialize LeetMemo:", error);
        showSetup("Could not initialize the extension.");
    }
});

function getElements() {
    return {
        settingsWrapper: document.getElementById("settings-wrapper"),
        settingsToggle: document.getElementById("settings-toggle"),
        settingsMenu: document.getElementById("settings-menu"),
        themeSwitch: document.getElementById("theme-switch"),
        backButton: document.getElementById("back-button"),
        changeUserButton: document.getElementById("change-user"),
        profileSetup: document.getElementById("profile-setup"),
        profileDashboard: document.getElementById("profile-dashboard"),
        usernameInput: document.getElementById("username-input"),
        loadProfileButton: document.getElementById("load-profile"),
        setupStatus: document.getElementById("setup-status"),
        status: document.getElementById("status"),
        username: document.getElementById("username"),
        ranking: document.getElementById("ranking"),
        easyCount: document.getElementById("easy-count"),
        mediumCount: document.getElementById("medium-count"),
        hardCount: document.getElementById("hard-count"),
        totalSolved: document.getElementById("total-solved"),
        avatarImage: document.getElementById("profile-avatar"),
        avatarInitials: document.getElementById("avatar-initials"),
        streak: document.getElementById("streak"),
        activeDays: document.getElementById("active-days"),
        heatmap: document.getElementById("heatmap"),
        heatmapMonths: document.getElementById("heatmap-months"),
        heatmapScroll: document.getElementById("heatmap-scroll"),
        tooltip: document.getElementById("heatmap-tooltip"),
        recentListView: document.getElementById("recent-list-view"),
        noteEditor: document.getElementById("note-editor"),
        noteTitle: document.getElementById("note-title"),
        noteBackButton: document.getElementById("note-back"),
        notesInput: document.getElementById("notes-input"),
        notesStatus: document.getElementById("notes-status"),
        saveNotesButton: document.getElementById("save-notes"),
        submissionsList: document.getElementById("recent-submissions")
    };
}
