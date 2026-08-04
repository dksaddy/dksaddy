// Shared visual language for every generated terminal-style SVG card.
// Palette: pure black background, three foreground accents only.

export const theme = {
    background: "#000000",
    border: "#3aa6d9",   // used at low opacity for hairlines/borders

    yellow: "#ffd60a",
    green: "#3ddc84",
    blue: "#5ec8f8",

    text: "#5ec8f8",      // default/body foreground (light blue)
    secondary: "#5ec8f8", // dimmed via fill-opacity where used
    muted: "#5ec8f8",     // dimmed via fill-opacity where used

    graph: "#3ddc84",     // line color (green)
    graphGlow: "#ffd60a", // accent highlight (yellow)
    graphFill: "#3ddc84"  // area fill (green)
};

export const font =
    "Cascadia Code, JetBrains Mono, Fira Code, Consolas, Courier New, monospace";

// Rough monospace advance width per 1px of font-size — used to place
// things (like a blinking cursor) after text without a canvas measurer.
export const CHAR_WIDTH_RATIO = 0.605;

export function textWidth(str, fontSize) {
    return str.length * fontSize * CHAR_WIDTH_RATIO;
}

export function terminalWindow(width, height) {
    return `
<rect
width="${width}"
height="${height}"
rx="16"
fill="${theme.background}"/>

<rect
width="${width}"
height="${height}"
rx="16"
fill="none"
stroke="${theme.border}"
stroke-opacity="0.35"
stroke-width="1"/>
`;
}

export function terminalPrompt(x, y, command) {
    return `
<text
x="${x}"
y="${y}"
fill="${theme.yellow}"
font-size="17"
font-family="${font}"
font-weight="600">
$ ${command}
</text>
`;
}

// A left-label / right-value row, e.g. "> Current Streak    18 days"
export function statRow(x, y, valueX, label, value, color = theme.text) {
    return `
<text x="${x}" y="${y}" fill="${theme.secondary}" fill-opacity="0.65" font-size="15"
font-family="${font}">&gt; ${label}</text>

<text x="${valueX}" y="${y}" fill="${color}" font-size="15"
font-family="${font}" font-weight="700">${value}</text>
`;
}

// A closing "$ _" line — a terminal left idling, ready for the next command.
export function closingPrompt(x, y) {
    return `
<text x="${x}" y="${y}" fill="${theme.yellow}" font-size="17"
font-family="${font}" font-weight="600">$</text>
${blinkingCursor(x + 20, y)}
`;
}

export function blinkingCursor(x, y, height = 18) {
    return `
<rect
x="${x}"
y="${y - height + 3}"
width="8"
height="${height}"
rx="1.5"
fill="${theme.yellow}">
<animate
attributeName="opacity"
values="1;0;1"
dur="1s"
repeatCount="indefinite"/>
</rect>
`;
}
