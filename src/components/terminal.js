// Shared visual language for every generated terminal-style SVG card.

export const theme = {
    background: "#000000",
    cardBackground: "#0d1117", // warm dark card used by the stats card
    border: "#3aa6d9",

    yellow: "#ffd60a",
    green: "#3ddc84",
    blue: "#5ec8f8",
    orange: "#ff9f43",
    red: "#ff4d4d",
    cyan: "#22d3ee", // used for the value highlight boxes

    text: "#3fb2ff",
    secondary: "#5ec8f8",
    muted: "#5ec8f8",

    graph: "#3ddc84",
    graphGlow: "#ffd60a",
    graphFill: "#3ddc84"
};

export const font =
    "Cascadia Code, JetBrains Mono, Fira Code, Consolas, Courier New, monospace";

// Rough monospace advance width per 1px of font-size — used to place
// things (like a blinking cursor) after text without a canvas measurer.
export const CHAR_WIDTH_RATIO = 0.605;

export function textWidth(str, fontSize) {
    return str.length * fontSize * CHAR_WIDTH_RATIO;
}

// Escapes XML-reserved characters so dynamic text (dates, labels, etc.)
// never breaks the SVG's document structure — e.g. "<>" as a literal
// separator would otherwise be parsed as an empty tag.
export function escapeXml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// Flat rectangle — no border radius.
export function terminalWindow(width, height, bg = theme.background) {
    return `
<rect width="${width}" height="${height}" fill="${bg}"/>
<rect width="${width}" height="${height}" fill="none"
stroke="${theme.border}" stroke-opacity="0.25" stroke-width="1"/>
`;
}

export function terminalPrompt(x, y, command) {
    return `
<text
x="${x}"
y="${y}"
fill="${theme.yellow}"
font-size="12"
font-family="${font}"
font-weight="600">
$ ${command}
</text>
`;
}

// A left-label / right-value row, e.g. "> Current Streak    18 days"
export function statRow(x, y, valueX, label, value, color = theme.text) {
    return `
<text x="${x}" y="${y}" fill="${theme.secondary}" fill-opacity="0.85" font-size="12"
font-family="${font}">&gt; ${label}</text>

<text x="${valueX}" y="${y}" fill="${color}" font-size="12"
font-family="${font}" font-weight="700">${value}</text>
`;
}

// A stacked label-over-value pair for the two-column card layout.
export function statBlock(x, y, label, value, color) {
    return `
<text x="${x}" y="${y}" fill="${color}" fill-opacity="0.8" font-size="10"
font-family="${font}">${label}</text>

<text x="${x + textWidth(label, 14) + 12}" y="${y}" fill="${color}" font-size="12"
font-family="${font}" font-weight="700">${value}</text>
`;
}

// A label split across two lines, e.g. ["Total", "Contribution"].
export function twoLineLabel(x, y, lines, color, lineHeight = 14, fontSize = 13) {
    return lines.map((line, i) => `
<text x="${x}" y="${y + i * lineHeight}" fill="${color}" fill-opacity="0.85"
font-size="${fontSize}" font-family="${font}">${line}</text>
`).join("");
}

// A bold value with no decoration. Returns markup + the width consumed,
// so callers can chase it with a unit suffix.
export function plainValue(x, y, text, color, fontSize = 19) {
    return {
        markup: `
<text x="${x}" y="${y}" fill="${color}" font-size="${fontSize}"
font-family="${font}" font-weight="700">${text}</text>
`,
        width: textWidth(String(text), fontSize)
    };
}

// A bold value inside a highlight box (the cyan outline in the reference
// design). Returns markup + the total width consumed (box included).
export function boxedValue(x, y, text, color, options = {}) {
    const {
        fontSize = 19,
        boxColor = theme.cyan,
        padX = 7,
        padY = 6
    } = options;

    const textW = textWidth(String(text), fontSize);
    const boxWidth = textW + padX * 2;

    // Center the box on the glyph itself rather than the text baseline —
    // digits sit roughly 0.85em above baseline and ~0.15em below it for
    // this font at bold weight, so pad symmetrically around that.
    const ascent = fontSize * 0.82;
    const descent = fontSize * 0.2;
    const boxTop = y - ascent - padY;
    const boxHeight = ascent + descent + padY * 2;

    return {
        markup: `
<rect x="${x}" y="${boxTop}" width="${boxWidth}" height="${boxHeight}"
fill="none" stroke="${boxColor}" stroke-width="1.5"/>

<text x="${x + padX}" y="${y}" fill="${color}" font-size="${fontSize}"
font-family="${font}" font-weight="700">${text}</text>
`,
        width: boxWidth,
        height: boxHeight
    };
}

// A small uppercase suffix that trails a value, e.g. "DAYS".
export function unitLabel(x, y, text, color) {
    return `
<text x="${x}" y="${y}" fill="${color}" fill-opacity="1" font-size="9"
font-family="${font}" letter-spacing="1">${text}</text>
`;
}

// Fine-print date range under a stat, e.g. "6 July 2025 <> 16 July 2025".
export function dateRangeLabel(x, y, text, color) {
    return `
<text x="${x}" y="${y}" fill="${color}" fill-opacity="1" font-size="10"
font-family="${font}">${escapeXml(text)}</text>
`;
}

// A row of small blocks that fill/blink like a tachometer as the count
// climbs — green through the safe range, amber then red near the top.
export function rpmMeter(x, y, count, options = {}) {
    const {
        boxWidth = 8,
        boxHeight = 14,
        gap = 3,
        perBox = 2 // commits represented by one box
    } = options;

    const boxes = Math.max(1, Math.ceil(count / perBox));
    let out = "";

    for (let i = 0; i < boxes; i++) {
        const bx = x + i * (boxWidth + gap);
        const ratio = boxes <= 1 ? 0 : i / (boxes - 1);

        let color = theme.green;
        if (ratio > 0.85) color = theme.red;
        else if (ratio > 0.6) color = theme.yellow;

        const delay = (i * 0.045).toFixed(3);

        out += `
<rect x="${bx}" y="${y}" width="${boxWidth}" height="${boxHeight}" fill="${color}">
<animate attributeName="opacity" values="1;0.25;1" dur="0.9s"
begin="${delay}s" repeatCount="indefinite"/>
</rect>
`;
    }

    return { markup: out, boxes, width: boxes * boxWidth + (boxes - 1) * gap };
}

export function blinkingCursor(x, y, height = 18) {
    return `
<rect
x="${x}"
y="${y - height + 3}"
width="8"
height="${height}"
fill="${theme.yellow}">
<animate
attributeName="opacity"
values="1;0;1"
dur="1s"
repeatCount="indefinite"/>
</rect>
`;
}
