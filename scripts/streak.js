import fs from "fs";

const data = JSON.parse(
    fs.readFileSync("./assets/data.json", "utf8")
);

const days = [...data.contributionDays].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
);

export function getCurrentStreak() {

    const reverse = [...days].reverse();

    let streak = 0;

    let start = null;
    let end = null;

    let started = false;

    for (const day of reverse) {

        if (!started && day.contributionCount === 0) {
            continue;
        }

        if (day.contributionCount > 0) {

            if (!end)
                end = day.date;

            start = day.date;

            streak++;

            started = true;

        } else {

            break;

        }

    }

    return {
        streak,
        start,
        end
    };

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

            if (!currentStart)
                currentStart = day.date;

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

    return {

        streak: longest,

        start: longestStart,

        end: longestEnd

    };

}

export function getWeeklyData() {

    const weeks = [];

    for (let i = 0; i < days.length; i += 7) {

        const week = days.slice(i, i + 7);

        weeks.push({

            start: week[0].date,

            end: week[week.length - 1].date,

            total: week.reduce(
                (sum, d) => sum + d.contributionCount,
                0
            )

        });

    }

    return weeks;

}

export function getTotalContributions() {

    return data.totalContributions;

}

export function getMaxWeekContribution() {

    const weeks = getWeeklyData();

    return Math.max(
        ...weeks.map(w => w.total)
    );

}

export function getAverageContribution() {

    const total =
        data.totalContributions;

    return Math.round(
        total / days.length
    );

}

export function getContributionDays() {

    return days;

}