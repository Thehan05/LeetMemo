import { formatNumber } from "../utils/format.js";

export function renderProfile(matchedUser, elements) {
    const stats =
        matchedUser.submitStatsGlobal?.acSubmissionNum ?? [];
    const totals = matchedUser.allQuestionsCount ?? [];

    const getCount = (items, difficulty, fallback) =>
        items.find(item => item.difficulty === difficulty)?.count
            ?? fallback;

    const easyCount = getCount(stats, "Easy", 0);
    const mediumCount = getCount(stats, "Medium", 0);
    const hardCount = getCount(stats, "Hard", 0);

    elements.username.textContent = matchedUser.username;
    elements.ranking.textContent = matchedUser.profile?.ranking
        ? formatNumber(matchedUser.profile.ranking)
        : "-";
    elements.easyCount.textContent = formatNumber(easyCount);
    elements.mediumCount.textContent = formatNumber(mediumCount);
    elements.hardCount.textContent = formatNumber(hardCount);
    elements.easyTotal.textContent = formatTotal(
        getCount(totals, "Easy", null)
    );
    elements.mediumTotal.textContent = formatTotal(
        getCount(totals, "Medium", null)
    );
    elements.hardTotal.textContent = formatTotal(
        getCount(totals, "Hard", null)
    );
    elements.totalSolved.textContent = formatNumber(
        easyCount + mediumCount + hardCount
    );

    renderAvatar(
        matchedUser.username,
        matchedUser.profile?.userAvatar,
        elements
    );
}

function formatTotal(value) {
    return value === null ? "—" : formatNumber(value);
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
