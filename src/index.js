import fetchData from "./api/github.js";
import generateCard from "./generators/card.js";
import generateGraph from "./generators/graph.js";

async function main() {
    await fetchData();

    generateCard();
    generateGraph();

    console.log("✔ All assets generated");
}

main().catch(console.error);
