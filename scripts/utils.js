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
    year: "numeric",
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

export function calculateCurrentStreak(days) {

  const sorted = [...days].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  let streak = 0;
  let endDate = null;
  let startDate = null;

  // Skip today if today has no contribution.
  if (
    sorted.length &&
    sorted[0].contributionCount === 0
  ) {
    sorted.shift();
  }

  for (const day of sorted) {

    if (day.contributionCount > 0) {

      if (!endDate) {
        endDate = day.date;
      }

      startDate = day.date;
      streak++;

    } else {

      break;

    }

  }

  return {
    streak,
    startDate,
    endDate
  };

}

export function calculateLongestStreak(days) {

  const sorted = sortDays(days);

  let longest = 0;
  let current = 0;

  let currentStart = null;
  let currentEnd = null;

  let longestStart = null;
  let longestEnd = null;

  for (const day of sorted) {

    if (day.contributionCount > 0) {

      current++;

      if (!currentStart) {
        currentStart = day.date;
      }

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
    startDate: longestStart,
    endDate: longestEnd
  };

}

export function getWeeklyData(days) {

  const sorted = sortDays(days);

  const weeks = [];

  for (let i = 0; i < sorted.length; i += 7) {

    const chunk = sorted.slice(i, i + 7);

    weeks.push({

      start: chunk[0].date,

      end: chunk[chunk.length - 1].date,

      total: chunk.reduce(
        (sum, d) => sum + d.contributionCount,
        0
      )

    });

  }

  return weeks;

}

export function getMaxWeeklyContribution(weeks) {

  return Math.max(
    ...weeks.map(w => w.total)
  );

}