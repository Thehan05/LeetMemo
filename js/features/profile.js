import { formatNumber } from "../utils/format.js";

export function renderProfile(matchedUser, elements) {
    const stats =
        matchedUser.submitStatsGlobal?.acSubmissionNum ?? [];

    const getCount = difficulty =>
        stats.find(item => item.difficulty === difficulty)?.count ?? 0;

    const easyCount = getCount("Easy");
    const mediumCount = getCount("Medium");
    const hardCount = getCount("Hard");

    elements.username.textContent = matchedUser.username;
    elements.ranking.textContent = matchedUser.profile?.ranking
        ? formatNumber(matchedUser.profile.ranking)
        : "-";
    elements.easyCount.textContent = formatNumber(easyCount);
    elements.mediumCount.textContent = formatNumber(mediumCount);
    elements.hardCount.textContent = formatNumber(hardCount);
    elements.totalSolved.textContent = formatNumber(
        easyCount + mediumCount + hardCount
    );

    renderAvatar(
        matchedUser.username,
        matchedUser.profile?.userAvatar,
        elements
    );
}

function renderAvatar(username, avatarUrl, elements) {
    const { avatarImage, avatarInitials } = elements;

    avatarInitials.textContent =
        username.slice(0, 2).toUpperCase();

    function showInitials() {
        avatarImage.hidden = true;
        avatarImage.removeAttribute("src");
        avatarInitials.hidden = false;
    }

    if (!avatarUrl) {
        showInitials();
        return;
    }

    let normalizedUrl;

    try {
        normalizedUrl = new URL(avatarUrl, "https://leetcode.com");

        if (!["https:", "http:"].includes(normalizedUrl.protocol)) {
            showInitials();
            return;
        }
    } catch (error) {
        console.error("Invalid avatar URL:", error);
        showInitials();
        return;
    }

    avatarImage.onload = () => {
        avatarInitials.hidden = true;
        avatarImage.hidden = false;
    };

    avatarImage.onerror = showInitials;
    avatarImage.alt = `${username}'s LeetCode avatar`;
    avatarImage.hidden = true;
    avatarImage.src = normalizedUrl.href;
}
