import { formatNumber } from "../utils/format.js";

export function renderCalendar(calendar, elements) {
    elements.streak.textContent = formatNumber(calendar.streak);
    elements.activeDays.textContent =
        formatNumber(calendar.totalActiveDays);
    renderHeatmap(calendar.submissionCalendar, elements);
}

function getHeatmapLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
}

function formatHeatmapDate(date) {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
    });
}

function positionTooltip(event, tooltip) {
    const offset = 12;
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = event.clientX + offset;
    let top = event.clientY - tooltipRect.height - offset;

    if (left + tooltipRect.width > window.innerWidth - 8) {
        left = event.clientX - tooltipRect.width - offset;
    }

    if (top < 8) {
        top = event.clientY + offset;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

function renderHeatmap(submissionCalendar, elements) {
    const {
        heatmap,
        heatmapMonths,
        heatmapScroll,
        tooltip
    } = elements;

    const heatmapChart =
        heatmapScroll.querySelector(".heatmap-chart");

    heatmap.innerHTML = "";
    heatmapMonths.innerHTML = "";

    let activity = {};

    try {
        activity = JSON.parse(submissionCalendar || "{}");
    } catch (error) {
        console.error("Could not parse activity calendar:", error);
    }

    const today = new Date();
    const currentYear = today.getUTCFullYear();
    const yearStart = new Date(Date.UTC(currentYear, 0, 1));
    const oneDay = 24 * 60 * 60 * 1000;
    const totalDays =
        Math.floor(
            (today.getTime() - yearStart.getTime()) / oneDay
        ) + 1;
    const startingWeekday = yearStart.getUTCDay();
    const totalWeeks = Math.ceil(
        (startingWeekday + totalDays) / 7
    );

    const weekdayLabelsWidth = 22;
    const bodyGap = 6;
    const cellGap = 2;
    const availableGridWidth =
        heatmapScroll.clientWidth -
        weekdayLabelsWidth -
        bodyGap;
    const calculatedCellSize = Math.floor(
        (
            availableGridWidth -
            (totalWeeks - 1) * cellGap
        ) / totalWeeks
    );
    const cellSize = Math.max(
        4,
        Math.min(12, calculatedCellSize)
    );

    heatmapChart.style.setProperty(
        "--cell-size",
        `${cellSize}px`
    );
    heatmapMonths.style.gridTemplateColumns =
        `repeat(${totalWeeks}, var(--cell-size))`;

    renderMonthLabels({
        heatmapMonths,
        today,
        currentYear,
        yearStart,
        oneDay,
        startingWeekday
    });

    for (let index = 0; index < startingWeekday; index++) {
        const placeholder = document.createElement("div");
        placeholder.className = "heatmap-placeholder";
        heatmap.appendChild(placeholder);
    }

    for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
        const date = new Date(
            yearStart.getTime() + dayIndex * oneDay
        );
        const timestamp = Math.floor(date.getTime() / 1000);
        const count = Number(activity[timestamp] ?? 0);
        const cell = document.createElement("div");
        const dateText = formatHeatmapDate(date);
        const submissionText =
            `${count} submission${count === 1 ? "" : "s"}`;

        cell.className = "heatmap-cell";
        cell.dataset.level = getHeatmapLevel(count);
        cell.setAttribute(
            "aria-label",
            `${submissionText} on ${dateText}`
        );

        cell.addEventListener("mouseenter", event => {
            tooltip.textContent =
                `${submissionText} on ${dateText}`;
            tooltip.hidden = false;
            positionTooltip(event, tooltip);
        });
        cell.addEventListener("mousemove", event => {
            positionTooltip(event, tooltip);
        });
        cell.addEventListener("mouseleave", () => {
            tooltip.hidden = true;
        });

        heatmap.appendChild(cell);
    }
}

function renderMonthLabels({
    heatmapMonths,
    today,
    currentYear,
    yearStart,
    oneDay,
    startingWeekday
}) {
    for (
        let month = 0;
        month <= today.getUTCMonth();
        month++
    ) {
        const firstDayOfMonth = new Date(
            Date.UTC(currentYear, month, 1)
        );
        const daysFromYearStart = Math.floor(
            (firstDayOfMonth.getTime() - yearStart.getTime()) /
            oneDay
        );
        const weekColumn =
            Math.floor(
                (startingWeekday + daysFromYearStart) / 7
            ) + 1;
        const monthLabel = document.createElement("span");

        monthLabel.textContent =
            firstDayOfMonth.toLocaleDateString("en-US", {
                month: "short",
                timeZone: "UTC"
            });
        monthLabel.style.gridColumn =
            `${weekColumn} / span 4`;
        heatmapMonths.appendChild(monthLabel);
    }
}
