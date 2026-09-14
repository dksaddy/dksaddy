import fs from "fs";

import {
    getCurrentStreak,
    getLongestStreak,
    getStreaks,
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
    textWidth,
    theme,
    font
} from "../components/terminal.js";

// ---- layout -------------------------------------------------------------

const width = 680;

const sideMargin = 28;
const valueOffset = 142; // label x -> value x, shared by both columns

// Widest thing a column holds: either a worst-case date-range caption or
// a value + DAYS suffix. The right column is placed so it still ends
// sideMargin from the edge, mirroring the left column.
const columnWidth = Math.max(
    textWidth("30 SEPT 26 __ 30 SEPT 26", 10),
    valueOffset + textWidth("9999", 19) + 10 + textWidth("DAYS", 9) + 4
);

const colLeftLabelX = sideMargin;
const colLeftValueX = colLeftLabelX + valueOffset;

const colRightLabelX = Math.floor(width - sideMargin - columnWidth);
const colRightValueX = colRightLabelX + valueOffset;

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

// Runner-up streaks (2nd, 3rd, 4th longest) along the bottom, in evenly
// spaced slots across the card — value + DAYS, date range, commits badge.
const runnerUpCount = 3;
const runnerUpValueY = row3CommitsY + 38;
const runnerUpDateY = runnerUpValueY + 16;
const runnerUpCommitsY = runnerUpDateY + 18;
const runnerUpSlotWidth = (width - sideMargin * 2) / runnerUpCount;
const runnerUpSlotGap = 12;

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

// Peak Day stays centered on the stat grid, not the runner-up row below it.
const gridHeight = Math.max(
    peakMeterBlockSpan + bottomPadding * 2,
    contentBottom + bottomPadding
);

const height = runnerUpCommitsY + 6 + bottomPadding; // + badge descent/padding

const peakLabelY = gridHeight / 2 - peakMeterBlockSpan / 2;
const peakValueY = peakLabelY + 38;
const peakUnitY = peakLabelY + 58;
const peakDateY = peakLabelY + peakBlockSpan;
const meterY = peakDateY + meterTopMargin;

function formatGenerated(date) {
    const datePart = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Dhaka"
    });

    const timePart = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Dhaka"
    });

    return `${datePart} ${timePart}`;
}

const shortMonths = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC"];

// e.g. "2026-09-08" -> "8 SEPT 26"
function formatShortDate(dateStr) {
    if (!dateStr) return "—";

    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "numeric",
            year: "2-digit",
            timeZone: "Asia/Dhaka"
        })
            .formatToParts(new Date(dateStr))
            .map(({ type, value }) => [type, value])
    );

    return `${Number(parts.day)} ${shortMonths[parts.month - 1]} ${parts.year}`;
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
        `${formatShortDate(range.start)} __ ${formatShortDate(range.end)}`;

    const lifetimeRangeText = formatRange(lifetimeRange);
    const last365RangeText = formatRange(last365Range);
    const currentRangeText = formatRange(current);
    const longestRangeText = formatRange(longest);
    const currentCommitsText = `${current.commits} commits`;
    const longestCommitsText = `${longest.commits} commits`;

    const peakDay = getPeakDay();
    const peakDayDateText = formatShortDate(peakDay.date);

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

    // Bottom row — 2nd/3rd/4th longest streaks. Date text shrinks if a long
    // month pair would spill past its slot.
    const runnerUps = getStreaks().slice(1, 1 + runnerUpCount).map((streak, i) => {
        const cx = sideMargin + runnerUpSlotWidth * (i + 0.5);

        const valueWidth = textWidth(String(streak.streak), 19);
        const unitWidth = textWidth("DAYS", 9) + 4; // + letter-spacing
        const valueX = cx - (valueWidth + 10 + unitWidth) / 2;
        const value = plainValue(valueX, runnerUpValueY, streak.streak, theme.green);

        const rangeText = formatRange(streak);
        const dateFontSize = Math.min(10, (runnerUpSlotWidth - runnerUpSlotGap) / textWidth(rangeText, 1));

        const commitsText = `${streak.commits} commits`;
        const commitsWidth = badge(0, 0, commitsText, theme.green).width;
        const commitsBadge = badge(cx - commitsWidth / 2, runnerUpCommitsY, commitsText, theme.green);

        return `
${value.markup}
${unitLabel(valueX + value.width + 10, runnerUpValueY, "DAYS", theme.green)}
${dateRangeLabel(cx, runnerUpDateY, rangeText, theme.green, { anchor: "middle", fontSize: dateFontSize })}
${commitsBadge.markup}
`;
    }).join("");

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

${runnerUps}

</svg>
`;

    fs.mkdirSync("./assets", { recursive: true });
    fs.writeFileSync("./assets/stats.svg", svg, "utf8");

    console.log("✔ stats.svg generated");
}
