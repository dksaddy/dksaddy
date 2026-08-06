import fs from "fs";

import {
    getCurrentStreak,
    getLongestStreak,
    getTotalContributions,
    getActiveDays,
    getLast365DaysContributions,
    getLast365DaysActiveDays,
    getDateRange,
    getLast365DaysRange,
    getPeakDay
} from "./streak.js";

import {
    terminalWindow,
    twoLineLabel,
    plainValue,
    unitLabel,
    dateRangeLabel,
    badge,
    rpmMeter,
    theme,
    font
} from "../components/terminal.js";

// ---- layout -------------------------------------------------------------

const width = 640;

const colLeftLabelX = 28;
const colLeftValueX = 170;

const colRightLabelX = 420;
const colRightValueX = 560;

// The generated-at timestamp sits at the top of the card; everything
// else is pushed down by topOffset to make room for it.
const timestampY = 20;
const topOffset = 2; // 26 - 30%, then -20% twice more

// Every row now carries the same three lines: two-line label, value,
// and a small date-range caption underneath — so all three rows share
// one consistent vertical rhythm.
const row1LabelY = 35 + topOffset;
const row1ValueY = 45 + topOffset;
const row1DateRangeY = 70 + topOffset;

const row2LabelY = 103 + topOffset;
const row2ValueY = 113 + topOffset;
const row2DateRangeY = 138 + topOffset;

const row3LabelY = 171 + topOffset;
const row3ValueY = 181 + topOffset;
const row3DateRangeY = 206 + topOffset;
const row3CommitsY = row3DateRangeY + 18; // 15 + 20% top margin above the badge

const contentBottom = row3CommitsY + 20;

// Activity meter — a row of blinking boxes, one per 5 commits, sitting
// right under the Peak Day date as part of that centered block.
const meterBoxWidth = 6;
const meterBoxHeight = 10;
const meterGap = 2;
const meterPerBox = 5;
const meterTopMargin = 16;

const bottomPadding = 14;

// Peak Day (+ the meter trailing it) sits dead center of the card —
// horizontally in the gap between the two columns, and vertically
// centered as one block rather than following the left/right row grid
// the other stats use.
const centerX = width / 2;
const peakBlockSpan = 81; // label -> date-line offset, kept fixed below
const peakMeterBlockSpan = peakBlockSpan + meterTopMargin + meterBoxHeight;

const height = Math.max(
    peakMeterBlockSpan + bottomPadding * 2,
    contentBottom + bottomPadding
);

const peakLabelY = height / 2 - peakMeterBlockSpan / 2;
const peakValueY = peakLabelY + 38;
const peakUnitY = peakLabelY + 58;
const peakDateY = peakLabelY + peakBlockSpan;
const meterY = peakDateY + meterTopMargin;

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
    const currentCommitsText = `${current.commits} commits`;
    const longestCommitsText = `${longest.commits} commits`;

    const peakDay = getPeakDay();
    const peakDayDateText = formatLongDate(peakDay.date);

    // Row 1 — Total Contribution (lifetime) | Last Year (365-day window)
    const totalValue = plainValue(colLeftValueX, row1ValueY, lifetimeTotal, theme.orange);
    const lastYearValue = plainValue(colRightValueX, row1ValueY, last365Total, theme.orange);

    // Row 2 — Total Active Days (lifetime) | Active Day (365-day window)
    const activeLifetimeValue = plainValue(colLeftValueX, row2ValueY, lifetimeActiveDays, theme.yellow);
    const activeYearValue = plainValue(colRightValueX, row2ValueY, last365ActiveDays, theme.blue);

    // Row 3 — Current Streak | Longest Streak (both with date range)
    const currentValue = plainValue(colLeftValueX, row3ValueY, current.streak, theme.green);
    const longestValue = plainValue(colRightValueX, row3ValueY, longest.streak, theme.green);

    const currentCommitsBadge = badge(colLeftLabelX, row3CommitsY, currentCommitsText, theme.green);
    const longestCommitsBadge = badge(colRightLabelX, row3CommitsY, longestCommitsText, theme.green);

    // Bottom activity meter — one box per 5 commits on the peak day, centered.
    const meterBoxCount = Math.max(1, Math.ceil(peakDay.contributionCount / meterPerBox));
    const meterWidth = meterBoxCount * meterBoxWidth + (meterBoxCount - 1) * meterGap;
    const meterX = (width - meterWidth) / 2;
    const meter = rpmMeter(meterX, meterY, peakDay.contributionCount, {
        boxWidth: meterBoxWidth,
        boxHeight: meterBoxHeight,
        gap: meterGap,
        perBox: meterPerBox
    });

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"
viewBox="0 0 ${width} ${height}">

${terminalWindow(width, height, theme.cardBackground)}

<text x="${width / 2}" y="${timestampY}" text-anchor="middle"
fill="#ffffff" fill-opacity="0.85" font-size="12" font-family="${font}">
${generated}
</text>

${twoLineLabel(colLeftLabelX, row1LabelY, ["Total", "Contribution"], theme.orange)}
${totalValue.markup}
${dateRangeLabel(colLeftLabelX, row1DateRangeY, lifetimeRangeText, theme.orange)}

${twoLineLabel(colRightLabelX, row1LabelY, ["Last Year", "Contribution"], theme.orange)}
${lastYearValue.markup}
${dateRangeLabel(colRightLabelX, row1DateRangeY, last365RangeText, theme.orange)}

${twoLineLabel(colLeftLabelX, row2LabelY, ["Total Active", "Days"], theme.yellow)}
${activeLifetimeValue.markup}
${dateRangeLabel(colLeftLabelX, row2DateRangeY, lifetimeRangeText, theme.yellow)}

${twoLineLabel(colRightLabelX, row2LabelY, ["Active", "Days"], theme.blue)}
${activeYearValue.markup}
${dateRangeLabel(colRightLabelX, row2DateRangeY, last365RangeText, theme.blue)}

${twoLineLabel(colLeftLabelX, row3LabelY, ["Current", "Streak"], theme.green)}
${currentValue.markup}
${unitLabel(colLeftValueX + currentValue.width + 10, row3ValueY, "DAYS", theme.green)}
${dateRangeLabel(colLeftLabelX, row3DateRangeY, currentRangeText, theme.green)}
${currentCommitsBadge.markup}

${twoLineLabel(colRightLabelX, row3LabelY, ["Longest", "Streak"], theme.green)}
${longestValue.markup}
${unitLabel(colRightValueX + longestValue.width + 10, row3ValueY, "DAYS", theme.green)}
${dateRangeLabel(colRightLabelX, row3DateRangeY, longestRangeText, theme.green)}
${longestCommitsBadge.markup}

<text x="${centerX}" y="${peakLabelY}" text-anchor="middle" fill="${theme.green}" fill-opacity="0.85"
font-size="13" font-family="${font}">Peak Day</text>

<text x="${centerX}" y="${peakValueY}" text-anchor="middle" fill="${theme.green}" font-size="24"
font-family="${font}" font-weight="700">${peakDay.contributionCount}</text>

<text x="${centerX}" y="${peakUnitY}" text-anchor="middle" fill="${theme.green}" fill-opacity="0.8"
font-size="11" font-family="${font}">Commits</text>

<text x="${centerX}" y="${peakDateY}" text-anchor="middle" fill="${theme.green}" fill-opacity="0.9"
font-size="10" font-family="${font}">${peakDayDateText}</text>

${meter.markup}

</svg>
`;

    fs.mkdirSync("./assets", { recursive: true });
    fs.writeFileSync("./assets/stats.svg", svg, "utf8");

    console.log("✔ stats.svg generated");
}
