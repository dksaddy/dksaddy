import { graphql } from "@octokit/graphql";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const USERNAME = process.env.GITHUB_USERNAME;
const TOKEN = process.env.GITHUB_TOKEN;

if (!USERNAME) {
  throw new Error("Missing GITHUB_USERNAME");
}

if (!TOKEN) {
  throw new Error("Missing GITHUB_TOKEN");
}

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `Bearer ${TOKEN}`,
  },
});

const QUERY = `
query ($login: String!) {
  user(login: $login) {

    login
    name
    avatarUrl

    contributionsCollection {

      contributionCalendar {

        totalContributions

        weeks {

          contributionDays {

            date

            contributionCount

            color
          }
        }
      }
    }
  }
}
`;

async function fetchContributionData() {
  const result = await graphqlWithAuth(QUERY, {
    login: USERNAME,
  });

  const calendar =
    result.user.contributionsCollection.contributionCalendar;

  const weeks = calendar.weeks;

  const contributionDays = weeks.flatMap(
    (week) => week.contributionDays
  );

  const output = {
    username: result.user.login,
    name: result.user.name,
    avatar: result.user.avatarUrl,
    totalContributions: calendar.totalContributions,
    contributionDays,
    generatedAt: new Date().toISOString(),
  };

  const outputDir = path.join(process.cwd(), "assets");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {
      recursive: true,
    });
  }

  fs.writeFileSync(
    path.join(outputDir, "data.json"),
    JSON.stringify(output, null, 2)
  );

  console.log("✔ assets/data.json generated");
}

fetchContributionData().catch((error) => {
  console.error(error);
  process.exit(1);
});