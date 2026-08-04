import fs from "fs";

import {
    getCurrentStreak,
    getLongestStreak,
    getTotalContributions,
    getActiveDays
} from "./streak.js";

import {
    terminalWindow,
    terminalPrompt,
    statRow,
    closingPrompt,
    theme
} from "../components/terminal.js";

// ---- layout -------------------------------------------------------------

const width = 560;

const promptY = 46;

const labelX = 32;
const valueX = 300;

const rowGap = 40;
const firstRowY = 92;
const rows = 5; // total, current streak, longest streak, active days, generated

const lastRowY = firstRowY + rowGap * (rows - 1);

const closingGap = 44;
const closingY = lastRowY + closingGap;

const bottomPadding = 30;
const height = closingY + bottomPadding;

function formatGenerated(date) {
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

export default function generateCard() {
    const current = getCurrentStreak();
    const longest = getLongestStreak();
    const total = getTotalContributions();
    const active = getActiveDays();
    const generated = formatGenerated(new Date());

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"
viewBox="0 0 ${width} ${height}">

${terminalWindow(width, height)}
${terminalPrompt(labelX, promptY, "github stats")}

${statRow(labelX, firstRowY, valueX, "Total Contributions", total, theme.blue)}
${statRow(labelX, firstRowY + rowGap, valueX, "Current Streak", `${current.streak} days`, theme.yellow)}
${statRow(labelX, firstRowY + rowGap * 2, valueX, "Longest Streak", `${longest.streak} days`, theme.green)}
${statRow(labelX, firstRowY + rowGap * 3, valueX, "Active Days", active, theme.blue)}
${statRow(labelX, firstRowY + rowGap * 4, valueX, "Generated", generated, theme.blue)}

${closingPrompt(labelX, closingY)}

</svg>
`;

    fs.mkdirSync("./assets", { recursive: true });
    fs.writeFileSync("./assets/stats.svg", svg, "utf8");

    console.log("✔ stats.svg generated");
}
