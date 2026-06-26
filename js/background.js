import { getDueReviews } from "./services/reviews.js"
chrome.alarms.create("review-check", { periodInMinutes: 60 });

async function updateBadge() {
    const due = await getDueReviews();
    const count = due.length;
    chrome.action.setBadgeText({ text : count > 0 ? String(count) : ""});
    chrome.action.setBadgeBackgroundColor({ color: "#e63946" });
}

chrome.runtime.onInstalled.addListener(updateBadge);
chrome.runtime.onStartup.addListener(updateBadge);
chrome.alarms.onAlarm.addListener(updateBadge);

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.reviews) {
        updateBadge();
    }
});