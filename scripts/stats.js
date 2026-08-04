import fs from "fs";
import {
  loadData,
  calculateCurrentStreak,
  calculateLongestStreak,
  formatDate
} from "./utils.js";

const data = loadData();

const current = calculateCurrentStreak(data.contributionDays);
const longest = calculateLongestStreak(data.contributionDays);

const total = data.totalContributions;

const width = 900;
const height = 170;

const svg = `
<svg
xmlns="http://www.w3.org/2000/svg"
width="${width}"
height="${height}"
viewBox="0 0 ${width} ${height}">

<style>

.background{
fill:#171522;
}

.title{
fill:#ffffff;
font-size:32px;
font-weight:bold;
font-family:Segoe UI,Arial,sans-serif;
}

.subtitle{
fill:#9CA3AF;
font-size:16px;
font-family:Segoe UI,Arial,sans-serif;
}

.value{
fill:#ffffff;
font-size:38px;
font-weight:bold;
font-family:Segoe UI,Arial,sans-serif;
}

.date{
fill:#7DD3FC;
font-size:14px;
font-family:Segoe UI,Arial,sans-serif;
}

.divider{
stroke:#302d58;
stroke-width:1;
}

</style>

<rect
x="0"
y="0"
width="900"
height="170"
rx="18"
class="background"/>

<line
x1="300"
y1="20"
x2="300"
y2="150"
class="divider"/>

<line
x1="600"
y1="20"
x2="600"
y2="150"
class="divider"/>

<text
x="150"
y="60"
text-anchor="middle"
class="value">
${total}
</text>

<text
x="150"
y="95"
text-anchor="middle"
class="subtitle">
Total Contributions
</text>

<text
x="150"
y="125"
text-anchor="middle"
class="date">
Generated ${new Date().getFullYear()}
</text>

<text
x="450"
y="60"
text-anchor="middle"
class="value">
🔥 ${current.streak}
</text>

<text
x="450"
y="95"
text-anchor="middle"
class="subtitle">
Current Streak
</text>

<text
x="450"
y="125"
text-anchor="middle"
class="date">
${
current.startDate
? `${formatDate(current.startDate)} - ${formatDate(current.endDate)}`
: "No Active Streak"
}
</text>

<text
x="750"
y="60"
text-anchor="middle"
class="value">
${longest.streak}
</text>

<text
x="750"
y="95"
text-anchor="middle"
class="subtitle">
Longest Streak
</text>

<text
x="750"
y="125"
text-anchor="middle"
class="date">
${formatDate(longest.startDate)} - ${formatDate(longest.endDate)}
</text>

</svg>
`;

fs.writeFileSync(
  "./assets/stats.svg",
  svg
);

console.log("✔ stats.svg generated");