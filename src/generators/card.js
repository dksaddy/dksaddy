import fs from "fs";

import {
    getCurrentStreak,
    getLongestStreak,
    getTotalContributions,
    getActiveDays,
    getLast365DaysContributions,
    getLast365DaysActiveDays
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

const row1LabelY = 35;
const row1ValueY = 45;

const row2LabelY = 90;
const row2ValueY = 100;
const dateRangeY = 125;

const row3LabelY = 158;
const row3ValueY = 168;

const dividerTop = 20;
const dividerBottom = row3ValueY + 24;
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
    const generated = formatGenerated(new Date());

    const longestRange = `${formatLongDate(longest.start)} <> ${formatLongDate(longest.end)}`;

    // Row 1 — Total Contribution (lifetime) | Last Year (365-day window, boxed)
    const totalValue = plainValue(colLeftValueX, row1ValueY, lifetimeTotal, theme.orange);
    const lastYearValue = boxedValue(colRightValueX, row1ValueY, last365Total, theme.orange);

    // Row 2 — Current Streak (boxed) | Longest Streak + date range
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

${twoLineLabel(colRightLabelX, row1LabelY, ["Last", "Year"], theme.orange)}
${lastYearValue.markup}

${twoLineLabel(colLeftLabelX, row2LabelY, ["Current", "Streak"], theme.green)}
${currentValue.markup}
${unitLabel(colLeftValueX + currentValue.width + 10, row2ValueY, "DAYS", theme.green)}

${twoLineLabel(colRightLabelX, row2LabelY, ["Longest", "Streak"], theme.green)}
${longestValue.markup}
${unitLabel(colRightValueX + longestValue.width + 10, row2ValueY, "DAYS", theme.green)}
${dateRangeLabel(colRightLabelX, dateRangeY, longestRange, theme.green)}

${twoLineLabel(colLeftLabelX, row3LabelY, ["Total Active", "Days"], theme.yellow)}
${activeLifetimeValue.markup}

${twoLineLabel(colRightLabelX, row3LabelY, ["Active", "Day"], theme.blue)}
${activeYearValue.markup}

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
