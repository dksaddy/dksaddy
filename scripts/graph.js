import { getWeeklyData } from "./streak.js";

export function generateGraphData() {

    const weeks = getWeeklyData();

    const width = 820;
    const height = 220;

    const padding = 50;

    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    const max = Math.max(
        ...weeks.map(w => w.total),
        1
    );

    const stepX =
        graphWidth /
        (weeks.length - 1);

    const points = [];

    weeks.forEach((week, index) => {

        const x =
            padding +
            index * stepX;

        const y =
            padding +
            graphHeight -
            (week.total / max) *
            graphHeight;

        points.push({
            x,
            y,
            value: week.total
        });

    });

    return {
        width,
        height,
        padding,
        graphWidth,
        graphHeight,
        max,
        points
    };

}