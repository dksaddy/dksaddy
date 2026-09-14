import { loadData, sortDays } from "../utils/svg.js";

function getData() {
    const data = loadData();

    return {
        data,
        days: sortDays(data.contributionDays)
    };
}

export function getCurrentStreak() {

    const { days } = getData();

    const reverse = [...days].reverse();

    let streak = 0;
    let commits = 0;
    let start = null;
    let end = null;
    let started = false;

    for (const day of reverse) {

        if (!started && day.contributionCount === 0) continue;

        if (day.contributionCount > 0) {

            if (!end) end = day.date;

            start = day.date;

            streak++;
            commits += day.contributionCount;

            started = true;

        } else {

            break;

        }

    }

    return { streak, commits, start, end };

}

// Every streak in the data, longest first. Ties keep chronological order,
// so the earliest of equally long streaks ranks higher.
export function getStreaks() {

    const { days } = getData();

    const streaks = [];
    let current = null;

    for (const day of days) {

        if (day.contributionCount > 0) {

            if (!current) {

                current = { streak: 0, commits: 0, start: day.date, end: day.date };
                streaks.push(current);

            }

            current.streak++;
            current.commits += day.contributionCount;
            current.end = day.date;

        } else {

            current = null;

        }

    }

    return streaks.sort((a, b) => b.streak - a.streak);

}

export function getLongestStreak() {

    return getStreaks()[0] ?? {
        streak: 0,
        commits: 0,
        start: null,
        end: null
    };

}

export function getWeeklyData() {

    const { days } = getData();

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

    return getData().data.totalContributions;

}

export function getMaxWeekContribution() {

    return Math.max(
        ...getWeeklyData().map(w => w.total)
    );

}

export function getAverageContribution() {

    const { data, days } = getData();

    return Math.round(
        data.totalContributions / days.length
    );

}

export function getContributionDays() {

    return getData().days;

}

export function getActiveDays() {

    return getData().days.filter(
        day => day.contributionCount > 0
    ).length;

}

export function getCurrentWeekContributions() {

    const { days } = getData();

    const today = new Date();

    const weekAgo = new Date();

    weekAgo.setDate(today.getDate() - 6);

    return days
        .filter(day => {

            const date = new Date(day.date);

            return date >= weekAgo && date <= today;

        })
        .reduce(
            (sum, day) => sum + day.contributionCount,
            0
        );

}

export function getLast31DaysContributions() {

    const { days } = getData();

    const today = new Date();

    const start = new Date();

    start.setDate(today.getDate() - 30);

    return days
        .filter(day => {

            const date = new Date(day.date);

            return date >= start && date <= today;

        })
        .reduce(
            (sum, day) => sum + day.contributionCount,
            0
        );

}

export function getPeakDayContribution() {

    const { days } = getData();

    return Math.max(
        ...days.map(day => day.contributionCount)
    );
}

export function getPeakDay() {

    const { days } = getData();

    return days.reduce(
        (peak, day) => (day.contributionCount > peak.contributionCount ? day : peak),
        days[0]
    );

}

export function getLast365DaysContributions() {

    const { days } = getData();

    const today = new Date();

    const start = new Date();

    start.setDate(today.getDate() - 364);

    return days
        .filter(day => {

            const date = new Date(day.date);

            return date >= start && date <= today;

        })
        .reduce(
            (sum, day) => sum + day.contributionCount,
            0
        );

}

export function getLast365DaysActiveDays() {

    const { days } = getData();

    const today = new Date();

    const start = new Date();

    start.setDate(today.getDate() - 364);

    return days.filter(day => {

        const date = new Date(day.date);

        return (
            date >= start &&
            date <= today &&
            day.contributionCount > 0
        );

    }).length;

}

// Full lifetime span covered by the loaded data — used as the date range
// for the lifetime stats (Total Contribution, Total Active Days).
export function getDateRange() {

    const { days } = getData();

    if (!days.length) return { start: null, end: null };

    return {
        start: days[0].date,
        end: days[days.length - 1].date
    };

}

// The rolling 365-day window used by getLast365Days* — used as the date
// range for the "last year" stats (Last Year, Active Day).
export function getLast365DaysRange() {

    const today = new Date();

    const start = new Date();

    start.setDate(today.getDate() - 364);

    return {
        start: start.toISOString().slice(0, 10),
        end: today.toISOString().slice(0, 10)
    };

}