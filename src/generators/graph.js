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
    rpmMeter,
    theme,
    font
} from "../components/terminal.js";

// ---- layout -----------------------------------------------------------
// Compact, flat (no border radius) layout — every day gets an x-axis
// label so the chart reads like a real terminal readout rather than a
// sampled sparkline.

const width = 820;

const promptY = 26;

const plotTop = 50;
const plotHeight = 150;
const plotPaddingX = 60;
const plotBottom = plotTop + plotHeight;

const axisLabelGap = 20;
const dividerGap = 15;

const labelX = 24;

const statsRowGap = 20;
const statsRowY = plotBottom + axisLabelGap + dividerGap + statsRowGap;

const meterGap = 30;
const meterBoxHeight = 12;
const meterY = statsRowY + meterGap - meterBoxHeight + 4;

const bottomPadding = 16;
const height = meterY + meterBoxHeight + bottomPadding;

const axisLabelY = plotBottom + axisLabelGap;
const dividerY = axisLabelY + dividerGap;

// ---- axis scaling ---------------------------------------------------------
// Y-axis always steps in units of 2 (per the reference design). If the
// data ever gets large enough that a step of 2 would produce a cluttered
// number of gridlines, the step doubles until the tick count is sane.

function computeYAxis(max) {
    let step = 2;
    let niceMax = Math.max(2, Math.ceil(max / step) * step);

    while (niceMax / step > 8) {
        step += 2;
        niceMax = Math.ceil(max / step) * step;
    }

    return { niceMax, step, tickCount: niceMax / step };
}

// ---- data ---------------------------------------------------------------

function generateGraphData() {
    const data = loadData();
    const days = sortDays(data.contributionDays);
    const last31 = days.slice(-31);

    const graphWidth = width - plotPaddingX * 2;
    const max = Math.max(...last31.map(d => d.contributionCount), 1);
    const { niceMax, step, tickCount } = computeYAxis(max);

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

// Every day gets a label — no skipping.
function dayLabels(points) {
    return points.map(p => `
<text x="${p.x}" y="${axisLabelY}" text-anchor="middle"
fill="${theme.yellow}" fill-opacity="0.85" font-size="10" font-family="${font}">
${new Date(p.date).getDate()}
</text>
`).join("");
}

export default function generateGraph() {
    const { niceMax, step, tickCount, points } = generateGraphData();

    const linePath = smoothPath(points);

    let area = linePath;
    area += ` L ${points[points.length - 1].x} ${plotBottom}`;
    area += ` L ${points[0].x} ${plotBottom} Z`;

    // Horizontal grid, step of 2 (or wider if the data demands it).
    let grid = "";

    for (let i = 0; i <= tickCount; i++) {
        const value = niceMax - step * i;
        const y = plotTop + (plotHeight / tickCount) * i;

        grid += `
<line x1="${plotPaddingX}" y1="${y}" x2="${width - plotPaddingX}" y2="${y}"
stroke="${theme.border}" stroke-opacity="0.1" stroke-width="1"/>

<text x="${plotPaddingX - 14}" y="${y + 4}" text-anchor="end"
fill="${theme.yellow}" fill-opacity="0.85" font-size="11" font-family="${font}">${value}</text>
`;
    }

    // A dot on every day with at least one commit.
    const dots = points
        .filter(p => p.value > 0)
        .map(p => `
<circle cx="${p.x}" cy="${p.y}" r="2.1" fill="${theme.yellow}"/>
`).join("");

    // Peak day gets a bigger ring plus its commit count printed above it.
    const peakPoint = points.reduce((a, b) => (b.value > a.value ? b : a));

    const peakMarker = `
<circle cx="${peakPoint.x}" cy="${peakPoint.y}" r="7" fill="${theme.yellow}" opacity="0.15"/>
<circle cx="${peakPoint.x}" cy="${peakPoint.y}" r="3.3" fill="${theme.background}"
stroke="${theme.yellow}" stroke-width="2"/>
<text x="${peakPoint.x}" y="${peakPoint.y - 10}" text-anchor="middle"
fill="${theme.yellow}" font-size="11" font-family="${font}" font-weight="700">
${peakPoint.value}
</text>
`;

    const currentWeek = getCurrentWeekContributions();
    const last31Days = getLast31DaysContributions();
    const peakDay = getPeakDayContribution();

    const meter = rpmMeter(labelX + 8, meterY, currentWeek, { boxHeight: meterBoxHeight });

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
${dots}
${peakMarker}

${dayLabels(points)}

<line x1="${labelX}" y1="${dividerY}" x2="${width - labelX}" y2="${dividerY}"
stroke="${theme.border}" stroke-opacity="0.9" stroke-width="1"/>

<text x="${labelX}" y="${statsRowY}" fill="${theme.yellow}" font-size="13"
font-family="${font}" font-weight="700">&gt; Current Week <tspan fill-opacity="0.85" font-weight="400">${currentWeek} commits</tspan></text>

<text x="330" y="${statsRowY}" fill="${theme.green}" font-size="13"
font-family="${font}" font-weight="700">&gt; Last 31 Days <tspan fill-opacity="0.85" font-weight="400">${last31Days} commits</tspan></text>

<text x="590" y="${statsRowY}" fill="${theme.blue}" font-size="13"
font-family="${font}" font-weight="700">&gt; Peak Day <tspan fill-opacity="0.85" font-weight="400">${peakDay} commits</tspan></text>

${meter.markup}
<text x="${labelX + 8 + meter.width + 12}" y="${meterY + meterBoxHeight - 2}"
fill="${theme.yellow}" font-size="13" font-family="${font}" font-weight="700"></text>

</svg>
`;

    fs.mkdirSync("./assets", { recursive: true });
    fs.writeFileSync("./assets/activity.svg", svg, "utf8");

    console.log("✔ activity.svg generated");
}
