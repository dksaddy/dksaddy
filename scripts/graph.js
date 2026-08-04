import { loadData, sortDays } from "./utils.js";

export function generateGraphData() {

    const data = loadData();

    const days = sortDays(data.contributionDays);

    // last 31 days
    const last31 = days.slice(-31);

    const width = 820;
    const height = 300;

    const padding = 60;

    const graphWidth = width - padding * 2;
    const graphHeight = 170;

    const max = Math.max(
        ...last31.map(d => d.contributionCount),
        1
    );

    const stepX = graphWidth / (last31.length - 1);

    const points = [];

    last31.forEach((day, index) => {

        const x = padding + index * stepX;

        const y =
            padding +
            graphHeight -
            (day.contributionCount / max) * graphHeight;

        points.push({
            x,
            y,
            value: day.contributionCount,
            date: day.date
        });

    });

    // current week
    const currentWeek = last31
        .slice(-7)
        .reduce((sum, d) => sum + d.contributionCount, 0);

    // last 31 days
    const last31Total = last31
        .reduce((sum, d) => sum + d.contributionCount, 0);

    return {
        width,
        height,
        padding,
        graphWidth,
        graphHeight,
        max,
        points,
        currentWeek,
        last31Total
    };

}