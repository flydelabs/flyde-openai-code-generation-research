import { readFile, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { GeneratedPartWithScore } from "./score-results";

function calculateCost(result: GeneratedPartWithScore) {
  const { tokens, generatorName } = result;
  let price1k = 0;

  if (generatorName.includes("davinci")) {
    price1k = 0.12;
  } else if (generatorName.includes("curie")) {
    price1k = 0.012;
  } else if (generatorName.includes("babbage")) {
    price1k = 0.0024;
  } else if (generatorName.includes("ada")) {
    price1k = 0.0016;
  } else if (generatorName.includes("gpt-3.5")) {
    price1k = 0.002;
  } else if (generatorName.includes("gpt-4")) {
    price1k = 0.06;
  } else {
    throw new Error("Unknown generator name: " + generatorName);
  }
  return (tokens / 1000) * price1k;
}

(async function () {
  const promptMap = new Map<string, GeneratedPartWithScore[]>();

  const allResults: GeneratedPartWithScore[] = [];
  const promptResults = readdirSync(join(__dirname, "../../prompt-results"));
  for (const file of promptResults) {
    const fullPath = join(__dirname, "../../prompt-results", file);
    const content = readFileSync(fullPath, "utf-8");
    const result: GeneratedPartWithScore = JSON.parse(content);
    const existing = promptMap.get(result.prompt) ?? [];
    allResults.push(result);
    promptMap.set(
      result.prompt,
      [...existing, result].sort((a, b) =>
        a.generatorName.localeCompare(b.generatorName)
      )
    );
  }
})();
