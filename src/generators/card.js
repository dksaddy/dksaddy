import fs from "fs";

import {
    getCurrentStreak,
    getLongestStreak,
    getTotalContributions,
    getActiveDays,
    getLast365DaysContributions,
    getLast365DaysActiveDays,
    getDateRange,
    getLast365DaysRange
} from "./streak.js";

import {
    terminalWindow,
    twoLineLabel,
    plainValue,
    boxedValue,
    unitLabel,
    dateRangeLabel,
    theme,
    font
} from "../components/terminal.js";

// ---- layout -------------------------------------------------------------

const width = 640;

const colLeftLabelX = 28;
const colLeftValueX = 190;

const colRightLabelX = 380;
const colRightValueX = 550;

// Every row now carries the same three lines: two-line label, value,
// and a small date-range caption underneath — so all three rows share
// one consistent vertical rhythm.
const row1LabelY = 35;
const row1ValueY = 45;
const row1DateRangeY = 70;

const row2LabelY = 103;
const row2ValueY = 113;
const row2DateRangeY = 138;

const row3LabelY = 171;
const row3ValueY = 181;
const row3DateRangeY = 206;

const dividerTop = 20;
const dividerBottom = row3DateRangeY + 20;
const dividerX = width / 2;

const timestampY = dividerBottom + 32;
const bottomPadding = 14;
const height = timestampY + bottomPadding;

function formatGenerated(date) {
    const datePart = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    const timePart = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });

    return `${datePart} ${timePart}`;
}

function formatLongDate(dateStr) {
    if (!dateStr) return "—";

    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

export default function generateCard() {
    const current = getCurrentStreak();
    const longest = getLongestStreak();
    const lifetimeTotal = getTotalContributions();
    const lifetimeActiveDays = getActiveDays();
    const last365Total = getLast365DaysContributions();
    const last365ActiveDays = getLast365DaysActiveDays();
    const lifetimeRange = getDateRange();
    const last365Range = getLast365DaysRange();
    const generated = formatGenerated(new Date());

    const formatRange = (range) =>
        `${formatLongDate(range.start)} <> ${formatLongDate(range.end)}`;

    const lifetimeRangeText = formatRange(lifetimeRange);
    const last365RangeText = formatRange(last365Range);
    const currentRangeText = formatRange(current);
    const longestRangeText = formatRange(longest);

    // Row 1 — Total Contribution (lifetime) | Last Year (365-day window, boxed)
    const totalValue = plainValue(colLeftValueX, row1ValueY, lifetimeTotal, theme.orange);
    const lastYearValue = boxedValue(colRightValueX, row1ValueY, last365Total, theme.orange);

    // Row 2 — Current Streak (boxed) | Longest Streak (both with date range)
    const currentValue = boxedValue(colLeftValueX, row2ValueY, current.streak, theme.green);
    const longestValue = plainValue(colRightValueX, row2ValueY, longest.streak, theme.green);

    // Row 3 — Total Active Days (lifetime) | Active Day (365-day window, boxed)
    const activeLifetimeValue = plainValue(colLeftValueX, row3ValueY, lifetimeActiveDays, theme.yellow);
    const activeYearValue = boxedValue(colRightValueX, row3ValueY, last365ActiveDays, theme.blue);

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"
viewBox="0 0 ${width} ${height}">

${terminalWindow(width, height, theme.cardBackground)}

${twoLineLabel(colLeftLabelX, row1LabelY, ["Total", "Contribution"], theme.orange)}
${totalValue.markup}
${dateRangeLabel(colLeftLabelX, row1DateRangeY, lifetimeRangeText, theme.orange)}

${twoLineLabel(colRightLabelX, row1LabelY, ["Last", "Year"], theme.orange)}
${lastYearValue.markup}
${dateRangeLabel(colRightLabelX, row1DateRangeY, last365RangeText, theme.orange)}

${twoLineLabel(colLeftLabelX, row2LabelY, ["Current", "Streak"], theme.green)}
${currentValue.markup}
${unitLabel(colLeftValueX + currentValue.width + 10, row2ValueY, "DAYS", theme.green)}
${dateRangeLabel(colLeftLabelX, row2DateRangeY, currentRangeText, theme.green)}

${twoLineLabel(colRightLabelX, row2LabelY, ["Longest", "Streak"], theme.green)}
${longestValue.markup}
${unitLabel(colRightValueX + longestValue.width + 10, row2ValueY, "DAYS", theme.green)}
${dateRangeLabel(colRightLabelX, row2DateRangeY, longestRangeText, theme.green)}

${twoLineLabel(colLeftLabelX, row3LabelY, ["Total Active", "Days"], theme.yellow)}
${activeLifetimeValue.markup}
${dateRangeLabel(colLeftLabelX, row3DateRangeY, lifetimeRangeText, theme.yellow)}

${twoLineLabel(colRightLabelX, row3LabelY, ["Active", "Day"], theme.blue)}
${activeYearValue.markup}
${dateRangeLabel(colRightLabelX, row3DateRangeY, last365RangeText, theme.blue)}

<line x1="${dividerX}" y1="${dividerTop}" x2="${dividerX}" y2="${dividerBottom}"
stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.5"/>
<rect x="${dividerX - 4}" y="${dividerBottom}" width="8" height="8"
fill="#ffffff" fill-opacity="0.85"/>

<text x="${dividerX}" y="${timestampY}" text-anchor="middle"
fill="${theme.text}" fill-opacity="0.6" font-size="12" font-family="${font}">
${generated}
</text>

</svg>
`;

    fs.mkdirSync("./assets", { recursive: true });
    fs.writeFileSync("./assets/stats.svg", svg, "utf8");

    console.log("✔ stats.svg generated");
}
