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

    const VISIBLE = 5;
    let expanded = false;

    async function renderDueReviews() {
        const due = await getDueReviews();
        dueCount.textContent = `(${due.length})`;
        dueList.innerHTML = ""; 
        if (due.length === 0) {
            dueEmpty.hidden = false;
            return;
        }
        dueEmpty.hidden = true;

        const visible = expanded ? due : due.slice(0, VISIBLE);
        dueList.classList.toggle("expanded", expanded);
        visible.forEach(review => {
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

        if (due.length > VISIBLE) {
            const item = document.createElement("li");
            item.className = "due-toggle";

            const button = document.createElement("button");
            button.textContent = expanded ? "Show less" : `View more (${due.length - VISIBLE})`;
            button.addEventListener("click", () => {
                expanded = !expanded;
                renderDueReviews();
            });

            item.appendChild(button);
            dueList.appendChild(item);
        }
    }

    return {
        renderDueReviews
    };
}