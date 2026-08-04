import fs from "fs";
import { generateGraphData } from "./graph.js";

const graph = generateGraphData();

const {
  width,
  height,
  padding,
  graphHeight,
  points,
  max,
  currentWeek,
  last31Total
} = graph;

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

const linePath = smoothPath(points);

let area = linePath;
area += ` L ${points[points.length - 1].x} ${padding + graphHeight}`;
area += ` L ${points[0].x} ${padding + graphHeight} Z`;

let grid = "";

// Horizontal grid
for (let i = 0; i <= 5; i++) {
  const y = padding + (graphHeight / 5) * i;

  grid += `
<line
x1="${padding}"
y1="${y}"
x2="${width - padding}"
y2="${y}"
stroke="#2d2b55"
stroke-width="1"/>`;

  const value = Math.round(max - (max / 5) * i);

  grid += `
<text
x="${padding - 10}"
y="${y + 5}"
text-anchor="end"
font-size="11"
fill="#888">${value}</text>`;
}

// Vertical grid + dates
points.forEach((p, index) => {
  grid += `
<line
x1="${p.x}"
y1="${padding}"
x2="${p.x}"
y2="${padding + graphHeight}"
stroke="#23203d"
stroke-width=".7"/>`;

  if (index % 2 === 0) {
    const day = new Date(p.date).getDate();

    grid += `
<text
x="${p.x}"
y="${padding + graphHeight + 20}"
text-anchor="middle"
font-size="11"
fill="#999">${day}</text>`;
  }
});

const circles = points
  .map(
    (p) => `
<circle
cx="${p.x}"
cy="${p.y}"
r="4"
fill="#FFF245"/>`
  )
  .join("");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg"
width="${width}"
height="${height}"
viewBox="0 0 ${width} ${height}">

<defs>

<linearGradient id="gradient"
x1="0"
y1="0"
x2="0"
y2="1">

<stop offset="0%" stop-color="#F8EEDF" stop-opacity=".35"/>
<stop offset="100%" stop-color="#F8EEDF" stop-opacity="0"/>

</linearGradient>

</defs>

<rect
width="${width}"
height="${height}"
rx="18"
fill="#171522"/>

${grid}

<path
d="${area}"
fill="url(#gradient)"/>

<path
d="${linePath}"
fill="none"
stroke="#EA2F14"
stroke-width="4"
stroke-linecap="round"
stroke-linejoin="round"/>

${circles}

<text
x="${width / 2}"
y="30"
text-anchor="middle"
font-size="22"
font-weight="bold"
fill="#FFF245">

Contribution Activity

</text>

<line
x1="60"
y1="${height - 55}"
x2="${width - 60}"
y2="${height - 55}"
stroke="#2d2b55"/>

<text
x="180"
y="${height - 25}"
text-anchor="middle"
font-size="16"

fill="#FFFFFF"
font-weight="bold">

Current Week: ${currentWeek} commits

</text>

<text
x="${width - 180}"
y="${height - 25}"
text-anchor="middle"
font-size="16"
fill="#FFFFFF"
font-weight="bold">

Last 31 Days: ${last31Total} commits

</text>

</svg>
`;

fs.writeFileSync("./assets/activity.svg", svg);

export default function generateGraph() {
  fs.writeFileSync("./assets/activity.svg", svg);
  console.log("✔ activity.svg generated");
}