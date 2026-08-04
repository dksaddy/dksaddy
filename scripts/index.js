import fetchData from "./fetch.js";
import generateCard from "./generate-card.js";
import generateGraph from "./generate-graph.js";

async function main() {

    await fetchData();

    generateCard();

    generateGraph();

    console.log("✔ All assets generated");

}

main().catch(console.error);