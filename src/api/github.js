import { graphql } from "@octokit/graphql";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const graphqlWithAuth = graphql.defaults({
    headers: {
        authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    }
});

// Step 1: find every year this account has contribution history for.
const yearsQuery = `
query($login:String!){
  user(login:$login){
    login
    name
    avatarUrl
    contributionsCollection{
      contributionYears
    }
  }
}
`;

// Step 2: pull the full daily calendar for one specific year.
const yearQuery = `
query($login:String!, $from:DateTime!, $to:DateTime!){
  user(login:$login){
    contributionsCollection(from:$from, to:$to){
      contributionCalendar{
        totalContributions
        weeks{
          contributionDays{
            contributionCount
            date
            color
          }
        }
      }
    }
  }
}
`;

async function fetchYear(login, year) {
    const now = new Date();
    const isCurrentYear = year === now.getFullYear();

    const from = `${year}-01-01T00:00:00Z`;
    const to = isCurrentYear ? now.toISOString() : `${year}-12-31T23:59:59Z`;

    const response = await graphqlWithAuth(yearQuery, { login, from, to });
    const calendar = response.user.contributionsCollection.contributionCalendar;

    return {
        total: calendar.totalContributions,
        days: calendar.weeks.flatMap(week => week.contributionDays)
    };
}

async function fetchData() {
    const login = process.env.GITHUB_USERNAME;

    const base = await graphqlWithAuth(yearsQuery, { login });
    const years = base.user.contributionsCollection.contributionYears;

    // GitHub's API caps each query to one year of history, so lifetime
    // totals/streaks/active-days need every year fetched and merged.
    let allDays = [];
    let lifetimeTotal = 0;

    for (const year of years) {
        const { total, days } = await fetchYear(login, year);
        lifetimeTotal += total;
        allDays = allDays.concat(days);
    }

    allDays.sort((a, b) => new Date(a.date) - new Date(b.date));

    fs.mkdirSync("./assets", { recursive: true });

    fs.writeFileSync(
        "./assets/data.json",
        JSON.stringify({
            username: base.user.login,
            name: base.user.name,
            avatar: base.user.avatarUrl,
            totalContributions: lifetimeTotal,
            contributionDays: allDays,
            generated: new Date().toISOString()
        }, null, 4)
    );

    console.log(`✔ data.json created — ${years.length} year(s), ${lifetimeTotal} lifetime contributions`);
}

export default fetchData;

// Only run automatically when this file is executed directly
// (e.g. `node src/api/github.js` / `npm run fetch`), not when imported.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    fetchData().catch(err => {
        console.error("✖ failed to fetch GitHub data:", err.message);
        process.exit(1);
    });
}
