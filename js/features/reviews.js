import {
    getDueReviews,
    recordPass,
    recordFail
} from "../services/reviews.js";

export function initReviews(elements) {
    const {
        dueSection,
        dueList,
        dueCount,
        dueEmpty
    } = elements;

    async function renderDueReviews() {
        const due = await getDueReviews();
        dueCount.textContent = `(${due.length})`;
        dueList.innerHTML = ""; 
        if (due.length === 0) {
            dueEmpty.hidden = false;
            return;
        }
        dueEmpty.hidden = true;

        due.forEach(review => {
            const item = document.createElement("li");

            const title = document.createElement("span");
            title.textContent = review.title;

            title.addEventListener("click", () => {
                chrome.tabs.create({
                    url: `https://leetcode.com/problems/${review.slug}/`
                });
            });
            
            const failButton = document.createElement("button");
            failButton.textContent = "✕";
            failButton.addEventListener("click", async () => {
                await recordFail(review.slug);
                renderDueReviews();
            });

            const passButton = document.createElement("button");
            passButton.textContent = "✓";
            passButton.addEventListener("click", async () => {
                await recordPass(review.slug);
                renderDueReviews();
            });
            
            item.append(title, failButton, passButton);
            dueList.appendChild(item);
        });
    }

    return {
        renderDueReviews
    };
}