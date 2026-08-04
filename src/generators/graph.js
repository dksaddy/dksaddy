import fs from "fs";

import { loadData, sortDays } from "../utils/svg.js";

import {
    getCurrentWeekContributions,
    getLast31DaysContributions,
    getPeakDayContribution
} from "./streak.js";

import {
    terminalWindow,
    terminalPrompt,
    closingPrompt,
    theme,
    font
} from "../components/terminal.js";

// ---- layout -----------------------------------------------------------

const width = 820;

const promptY = 46;

const plotTop = 90;
const plotHeight = 200;
const plotPaddingX = 76;
const plotBottom = plotTop + plotHeight;

const axisLabelGap = 28;
const dividerGap = 26;

const labelX = 24;

const statsRowGap = 34;
const statsRowY = plotBottom + axisLabelGap + dividerGap + statsRowGap;

const closingGap = 40;
const closingY = statsRowY + closingGap;

const bottomPadding = 30;
const height = closingY + bottomPadding;

const axisLabelY = plotBottom + axisLabelGap;
const dividerY = axisLabelY + dividerGap;

// ---- axis scaling ---------------------------------------------------------
// A "nice numbers" tick calculation so the y-axis reads in clean, round
// steps instead of whatever fraction a naive division happens to produce.

function niceNumber(range, round) {
    const exponent = Math.floor(Math.log10(range));
    const fraction = range / Math.pow(10, exponent);

    let niceFraction;

    if (round) {
        if (fraction < 1.5) niceFraction = 1;
        else if (fraction < 3) niceFraction = 2;
        else if (fraction < 7) niceFraction = 5;
        else niceFraction = 10;
    } else {
        if (fraction <= 1) niceFraction = 1;
        else if (fraction <= 2) niceFraction = 2;
        else if (fraction <= 5) niceFraction = 5;
        else niceFraction = 10;
    }

    return niceFraction * Math.pow(10, exponent);
}

function niceScale(max, maxTicks = 4) {
    if (max <= 0) return { niceMax: maxTicks, step: 1, tickCount: maxTicks };

    const range = niceNumber(max, false);
    const step = niceNumber(range / maxTicks, true) || 1;
    const niceMax = Math.ceil(max / step) * step;
    const tickCount = Math.round(niceMax / step);

    return { niceMax, step, tickCount };
}

// ---- data ---------------------------------------------------------------

function generateGraphData() {
    const data = loadData();
    const days = sortDays(data.contributionDays);
    const last31 = days.slice(-31);

    const graphWidth = width - plotPaddingX * 2;
    const max = Math.max(...last31.map(d => d.contributionCount), 1);
    const { niceMax, step, tickCount } = niceScale(max);

    const stepX = graphWidth / (last31.length - 1);

    const points = last31.map((day, index) => ({
        x: plotPaddingX + index * stepX,
        y: plotTop + plotHeight - (day.contributionCount / niceMax) * plotHeight,
        value: day.contributionCount,
        date: day.date
    }));

    return { niceMax, step, tickCount, points };
}

function smoothPath(points) {
    if (points.length < 2) return "";

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cx = (p0.x + p1.x) / 2;

        d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    return d;
}

// Day-of-month labels under every other point, e.g. 5, 7, 9 …
function dayLabels(points) {
    return points.map((p, index) => {
        if (index % 2 !== 0) return "";

        const label = new Date(p.date).getDate();

        return `
<text x="${p.x}" y="${axisLabelY}" text-anchor="middle"
fill="${theme.muted}" fill-opacity="0.6" font-size="11" font-family="${font}">${label}</text>
`;
    }).join("");
}

export default function generateGraph() {
    const { niceMax, step, tickCount, points } = generateGraphData();

    const linePath = smoothPath(points);

    let area = linePath;
    area += ` L ${points[points.length - 1].x} ${plotBottom}`;
    area += ` L ${points[0].x} ${plotBottom} Z`;

    // Horizontal grid — one line per nice tick (0, step, 2*step … niceMax).
    let grid = "";

    for (let i = 0; i <= tickCount; i++) {
        const value = niceMax - step * i;
        const y = plotTop + (plotHeight / tickCount) * i;

        grid += `
<line x1="${plotPaddingX}" y1="${y}" x2="${width - plotPaddingX}" y2="${y}"
stroke="${theme.border}" stroke-opacity="0.2" stroke-width="1"/>

<text x="${plotPaddingX - 16}" y="${y + 4}" text-anchor="end"
fill="${theme.muted}" fill-opacity="0.6" font-size="11" font-family="${font}">${value}</text>
`;
    }

    // Single accent dot on the peak day.
    const peakPoint = points.reduce((a, b) => (b.value > a.value ? b : a));

    const peakDot = `
<circle cx="${peakPoint.x}" cy="${peakPoint.y}" r="9" fill="${theme.graphGlow}" opacity="0.15"/>
<circle cx="${peakPoint.x}" cy="${peakPoint.y}" r="4.5" fill="${theme.background}"
stroke="${theme.graphGlow}" stroke-width="2.5"/>
`;

    const currentWeek = getCurrentWeekContributions();
    const last31Days = getLast31DaysContributions();
    const peakDay = getPeakDayContribution();

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"
viewBox="0 0 ${width} ${height}">

<defs>
<linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="${theme.graphFill}" stop-opacity="0.28"/>
<stop offset="100%" stop-color="${theme.graphFill}" stop-opacity="0"/>
</linearGradient>
</defs>

${terminalWindow(width, height)}
${terminalPrompt(labelX + 8, promptY, "github activity --last 31")}

${grid}

<path d="${area}" fill="url(#gradient)"/>
<path d="${linePath}" fill="none" stroke="${theme.graph}"
stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
${peakDot}

${dayLabels(points)}

<line x1="${labelX}" y1="${dividerY}" x2="${width - labelX}" y2="${dividerY}"
stroke="${theme.border}" stroke-opacity="0.2" stroke-width="1"/>

<text x="${labelX}" y="${statsRowY}" fill="${theme.yellow}" font-size="15"
font-family="${font}" font-weight="700">&gt; Current Week <tspan fill="${theme.yellow}" fill-opacity="0.85" font-weight="400">${currentWeek} commits</tspan></text>

<text x="330" y="${statsRowY}" fill="${theme.green}" font-size="15"
font-family="${font}" font-weight="700">&gt; Last 31 Days <tspan fill="${theme.green}" fill-opacity="0.85" font-weight="400">${last31Days} commits</tspan></text>

<text x="590" y="${statsRowY}" fill="${theme.blue}" font-size="15"
font-family="${font}" font-weight="700">&gt; Peak Day <tspan fill="${theme.blue}" fill-opacity="0.85" font-weight="400">${peakDay} commits</tspan></text>

${closingPrompt(labelX + 8, closingY)}

</svg>
`;

    fs.mkdirSync("./assets", { recursive: true });
    fs.writeFileSync("./assets/activity.svg", svg, "utf8");

    console.log("✔ activity.svg generated");
}
