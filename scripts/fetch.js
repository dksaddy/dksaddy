import { graphql } from "@octokit/graphql";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const graphqlWithAuth = graphql.defaults({
    headers: {
        authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    }
});

const query = `
query($login:String!){
  user(login:$login){

    login
    name
    avatarUrl

    contributionsCollection{

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

async function fetchData(){

    const response = await graphqlWithAuth(query,{
        login:process.env.GITHUB_USERNAME
    });

    const calendar =
        response.user
        .contributionsCollection
        .contributionCalendar;

    const days =
        calendar.weeks.flatMap(
            week=>week.contributionDays
        );

    fs.mkdirSync("./assets",{recursive:true});

    fs.writeFileSync(
        "./assets/data.json",
        JSON.stringify({

            username:response.user.login,

            name:response.user.name,

            avatar:response.user.avatarUrl,

            totalContributions:
                calendar.totalContributions,

            contributionDays:days,

            generated:new Date().toISOString()

        },null,4)
    );

    console.log("✔ data.json created");

}

export default fetchData;