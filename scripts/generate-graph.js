import fs from "fs";
import { generateGraphData } from "./graph.js";

const graph = generateGraphData();

const {
    width,
    height,
    padding,
    graphHeight,
    points
} = graph;

const pointString = points
    .map(p => `${p.x},${p.y}`)
    .join(" ");

let area = `M ${padding} ${padding + graphHeight} `;

for (const p of points) {
    area += `L ${p.x} ${p.y} `;
}

area += `L ${points[points.length - 1].x} ${padding + graphHeight} Z`;

const grid = [];

for (let i = 0; i <= 5; i++) {

    const y =
        padding +
        (graphHeight / 5) * i;

    grid.push(`
<line
x1="${padding}"
y1="${y}"
x2="${width-padding}"
y2="${y}"
stroke="#2d2b55"
stroke-width="1"/>
`);

}

const circles = points
    .map(p => `
<circle
cx="${p.x}"
cy="${p.y}"
r="4"
fill="#FFF245"/>
`)
    .join("");

const svg = `
<svg
xmlns="http://www.w3.org/2000/svg"
width="${width}"
height="${height}"
viewBox="0 0 ${width} ${height}">

<defs>

<linearGradient
id="gradient"
x1="0"
y1="0"
x2="0"
y2="1">

<stop
offset="0%"
stop-color="#F8EEDF"
stop-opacity=".55"/>

<stop
offset="100%"
stop-color="#F8EEDF"
stop-opacity="0"/>

</linearGradient>

</defs>

<rect
width="${width}"
height="${height}"
rx="18"
fill="#171522"/>

${grid.join("")}

<path
d="${area}"
fill="url(#gradient)"/>

<polyline
points="${pointString}"
fill="none"
stroke="#EA2F14"
stroke-width="4"
stroke-linecap="round"
stroke-linejoin="round"/>

${circles}

<text
x="${width/2}"
y="28"
fill="#FFF245"
font-size="18"
font-family="Segoe UI"
font-weight="bold"
text-anchor="middle">

Contribution Activity

</text>

</svg>
`;

fs.writeFileSync(
    "./assets/activity.svg",
    svg
);

export default function generateGraph() {

    fs.writeFileSync(
        "./assets/activity.svg",
        svg
    );

    console.log("✔ activity.svg generated");

}