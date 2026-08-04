import { loadData, sortDays } from "../utils/svg.js";

const data = loadData();
const days = sortDays(data.contributionDays);

export function getCurrentStreak() {
    const reverse = [...days].reverse();

    let streak = 0;
    let start = null;
    let end = null;
    let started = false;

    for (const day of reverse) {
        if (!started && day.contributionCount === 0) continue;

        if (day.contributionCount > 0) {
            if (!end) end = day.date;
            start = day.date;
            streak++;
            started = true;
        } else {
            break;
        }
    }

    return { streak, start, end };
}

export function getLongestStreak() {
    let current = 0;
    let longest = 0;

    let currentStart = null;
    let currentEnd = null;
    let longestStart = null;
    let longestEnd = null;

    for (const day of days) {
        if (day.contributionCount > 0) {
            current++;
            if (!currentStart) currentStart = day.date;
            currentEnd = day.date;

            if (current > longest) {
                longest = current;
                longestStart = currentStart;
                longestEnd = currentEnd;
            }
        } else {
            current = 0;
            currentStart = null;
            currentEnd = null;
        }
    }

    return { streak: longest, start: longestStart, end: longestEnd };
}

export function getWeeklyData() {
    const weeks = [];

    for (let i = 0; i < days.length; i += 7) {
        const week = days.slice(i, i + 7);

        weeks.push({
            start: week[0].date,
            end: week[week.length - 1].date,
            total: week.reduce((sum, d) => sum + d.contributionCount, 0)
        });
    }

    return weeks;
}

export function getTotalContributions() {
    return data.totalContributions;
}

export function getMaxWeekContribution() {
    return Math.max(...getWeeklyData().map(w => w.total));
}

export function getAverageContribution() {
    return Math.round(data.totalContributions / days.length);
}

export function getContributionDays() {
    return days;
}

export function getActiveDays() {
    return days.filter(day => day.contributionCount > 0).length;
}

export function getCurrentWeekContributions() {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);

    return days
        .filter(day => {
            const date = new Date(day.date);
            return date >= weekAgo && date <= today;
        })
        .reduce((sum, day) => sum + day.contributionCount, 0);
}

export function getLast31DaysContributions() {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 30);

    return days
        .filter(day => {
            const date = new Date(day.date);
            return date >= start && date <= today;
        })
        .reduce((sum, day) => sum + day.contributionCount, 0);
}

export function getPeakDayContribution() {
    return Math.max(...days.map(day => day.contributionCount));
}
