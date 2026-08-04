import fs from "fs";

const DATA_FILE = "./assets/data.json";

export function loadData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

export function sortDays(days) {
    return [...days].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

export function calculateTotal(days) {
    return days.reduce(
        (sum, day) => sum + day.contributionCount,
        0
    );
}

export function getActiveDays(days) {
    return days.filter(day => day.contributionCount > 0).length;
}

export function getMaxDailyContribution(days) {
    return Math.max(
        ...days.map(day => day.contributionCount)
    );
}
