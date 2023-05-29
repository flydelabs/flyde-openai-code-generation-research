import {
  readFile,
  readFileSync,
  readdirSync,
  writeFile,
  writeFileSync,
} from "fs";
import { join } from "path";
import { GeneratedPartWithScore } from "./score-results";
import { calcAverage, calcPercentile, toCsv } from "../utils";

function formatModelName(name: string) {
  switch (name) {
    case "chat-completion-gpt-3.5-turbo-full":
      return "CC 3.5: L";
    case "chat-completion-gpt-3.5-turbo-condensed":
      return "CC 3.5: M";
    case "chat-completion-gpt-3.5-turbo-very-condensed":
      return "CC 3.5: S";
    case "chat-completion-gpt-4-full":
      return "CC 4: L";
    case "chat-completion-gpt-4-condensed":
      return "CC 4: M";
    case "chat-completion-gpt-4-very-condensed":
      return "CC 4: S";
    case "fine-tuned-ada:ft-personal-2023-05-24-22-58-24":
      return "FT Ada";
    case "fine-tuned-babbage:ft-personal-2023-05-24-22-40-27":
      return "FT Babbage";
    case "fine-tuned-curie:ft-personal-2023-05-24-22-48-46":
      return "FT Curie";
    case "fine-tuned-davinci:ft-personal-2023-05-24-23-14-18":
      return "FT Davinci";
    default: {
      throw new Error("Unknown model name: " + name);
    }
  }
}

const modelOrder = [
  "FT Ada",
  "FT Babbage",
  "FT Curie",
  "FT Davinci",
  "CC 3.5: S",
  "CC 3.5: M",
  "CC 3.5: L",
  "CC 4: S",
  "CC 4: M",
  "CC 4: L",
];

function sortGeneratorNames(
  a: GeneratedPartWithScore | string,
  b: GeneratedPartWithScore | string
) {
  const niceNameA = formatModelName(
    typeof a === "string" ? a : a.generatorName
  );
  const niceNameB = formatModelName(
    typeof b === "string" ? b : b.generatorName
  );
  const idxA = modelOrder.indexOf(niceNameA);
  const idxB = modelOrder.indexOf(niceNameB);
  return idxA - idxB;
}

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
  const promptToResultsMap = new Map<string, GeneratedPartWithScore[]>();
  const generatorToResultsMap = new Map<string, GeneratedPartWithScore[]>();

  const allResults: GeneratedPartWithScore[] = [];
  const promptResults = readdirSync(join(__dirname, "../../prompt-results"));
  for (const file of promptResults) {
    const fullPath = join(__dirname, "../../prompt-results", file);
    const content = readFileSync(fullPath, "utf-8");
    const result: GeneratedPartWithScore = JSON.parse(content);
    const existing = promptToResultsMap.get(result.prompt) ?? [];
    allResults.push(result);
    promptToResultsMap.set(
      result.prompt,
      [...existing, result].sort(sortGeneratorNames)
    );

    const existingGenerator =
      generatorToResultsMap.get(result.generatorName) ?? [];
    generatorToResultsMap.set(
      result.generatorName,
      [...existingGenerator, result].sort((a, b) =>
        a.prompt.localeCompare(b.prompt)
      )
    );
  }

  allResults.sort((a, b) => a.generatorName.localeCompare(b.generatorName));

  const generatorTypes = Array.from(
    new Set(allResults.map((r) => r.generatorName))
  );

  const allPrompts = Array.from(promptToResultsMap.keys());

  const header = [
    "type",
    ...generatorTypes.sort(sortGeneratorNames).map(formatModelName),
  ];

  const csvData = [
    header,
    ...generateRows(
      "cost (cents)",
      calculateCost,
      (v) => `${(v * 100).toFixed(2)}¢`
    ),
    ...generateRows(
      "time (seconds)",
      (r) => r.completionTime / 1000,
      (v) => v.toFixed(2)
    ),
    ...generateRows(
      "score",
      (r) => r.score,
      (v) => v.toFixed(2)
    ),
  ];

  writeFileSync(join(__dirname, "../../results.csv"), toCsv(csvData), "utf-8");

  function generateRows(
    name: string,
    valueExtractor: (r: GeneratedPartWithScore) => number,
    formatValue: (value: number) => string
  ): string[][] {
    const mainRows = allPrompts.map((prompt) => {
      const results = promptToResultsMap.get(prompt)!;
      const costs = results.map((r) => formatValue(valueExtractor(r)));
      return [prompt.substring(0, 15), ...costs];
    });

    const averageRow = [
      `${name} - average`,
      ...generatorTypes.map((generatorName) => {
        const costs = generatorToResultsMap.get(generatorName)!;
        return formatValue(calcAverage(costs.map((r) => valueExtractor(r))));
      }),
    ];

    const medianRow = [
      `${name} - median`,
      ...generatorTypes.map((generatorName) => {
        const costs = generatorToResultsMap.get(generatorName)!;
        return formatValue(
          calcPercentile(
            costs.map((r) => valueExtractor(r)),
            50
          )
        );
      }),
    ];

    const p80Row = [
      `${name} - p80`,
      ...generatorTypes.map((generatorName) => {
        const costs = generatorToResultsMap.get(generatorName)!;
        return formatValue(
          calcPercentile(
            costs.map((r) => valueExtractor(r)),
            80
          )
        );
      }),
    ];

    return [medianRow, p80Row, averageRow];
  }
})();
