import fs from "fs";
import {
  getCurrentStreak,
  getLongestStreak,
  getTotalContributions
} from "./streak.js";

function format(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

const current = getCurrentStreak();
const longest = getLongestStreak();
const total = getTotalContributions();

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="890" height="180" viewBox="0 0 890 180">

<style>

.title{
fill:#ffffff;
font-size:34px;
font-family:Segoe UI;
font-weight:bold;
}

.subtitle{
fill:#9ca3af;
font-size:16px;
font-family:Segoe UI;
}

.date{
fill:#7dd3fc;
font-size:14px;
font-family:Segoe UI;
}

.card{
fill:#171522;
}

.divider{
stroke:#302d58;
stroke-width:1;
}

</style>

<rect
x="0"
y="0"
width="890"
height="180"
rx="18"
class="card"/>

<line
x1="296"
y1="20"
x2="296"
y2="160"
class="divider"/>

<line
x1="593"
y1="20"
x2="593"
y2="160"
class="divider"/>

<!-- Total -->

<text
x="148"
y="70"
text-anchor="middle"
class="title">

${total}

</text>

<text
x="148"
y="105"
text-anchor="middle"
class="subtitle">

Total Contributions

</text>

<text
x="148"
y="135"
text-anchor="middle"
class="date">

Generated ${new Date().getFullYear()}

</text>

<!-- Current -->

<text
x="445"
y="70"
text-anchor="middle"
class="title">

🔥 ${current.streak}

</text>

<text
x="445"
y="105"
text-anchor="middle"
class="subtitle">

Current Streak

</text>

<text
x="445"
y="135"
text-anchor="middle"
class="date">

${format(current.start)} - ${format(current.end)}

</text>

<!-- Longest -->

<text
x="742"
y="70"
text-anchor="middle"
class="title">

${longest.streak}

</text>

<text
x="742"
y="105"
text-anchor="middle"
class="subtitle">

Longest Streak

</text>

<text
x="742"
y="135"
text-anchor="middle"
class="date">

${format(longest.start)} - ${format(longest.end)}

</text>

</svg>
`;

fs.mkdirSync("./assets", { recursive: true });

fs.writeFileSync("./assets/stats.svg", svg);

export default function generateCard() {

    fs.mkdirSync("./assets", {
        recursive: true
    });

    fs.writeFileSync(
        "./assets/stats.svg",
        svg
    );

    console.log("✔ stats.svg generated");

}