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
    case "chat-completion-gpt-3.5-turbo-condensed-3":
      return "CC 3.5: M3";
    case "chat-completion-gpt-3.5-turbo-very-condensed-2":
      return "CC 3.5: S2";
    case "chat-completion-gpt-3.5-turbo-very-condensed-no-examples":
      return "CC 3.5: S0";
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
    case "chat-completion-ft:gpt-3.5-turbo-0613:personal:flyde-23-08-27:7s9Gy7SR-full":
      return "FT CC 3.5: L";
    case "chat-completion-ft:gpt-3.5-turbo-0613:personal:flyde-23-08-27:7s9Gy7SR-condensed":
      return "FT CC 3.5: M";
    case "chat-completion-ft:gpt-3.5-turbo-0613:personal:flyde-23-08-27:7s9Gy7SR-very-condensed":
      return "FT CC 3.5: S";
    case "chat-completion-ft:gpt-3.5-turbo-0613:personal:flyde-23-08-27:7s9Gy7SR-condensed-3":
      return "FT CC 3.5: M3";
    case "chat-completion-ft:gpt-3.5-turbo-0613:personal:flyde-23-08-27:7s9Gy7SR-very-condensed-2":
      return "FT CC 3.5: S2";
    case "chat-completion-ft:gpt-3.5-turbo-0613:personal:flyde-23-08-27:7s9Gy7SR-very-condensed-no-examples":
      return "FT CC 3.5: S0";
    default: {
      throw new Error("Unknown model name: " + name);
    }
  }
}

const modelOrder = [
  "FT CC 3.5: S0",
  "CC 3.5: S0",
  "FT CC 3.5: S2",
  "CC 3.5: S2",
  "FT CC 3.5: S",
  "CC 3.5: S",
  "CC 4: S",
  "FT CC 3.5: M3",
  "CC 3.5: M3",
  "FT CC 3.5: M",
  "CC 3.5: M",
  "CC 4: M",
  "FT CC 3.5: L",
  "CC 3.5: L",
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
  if (idxA === -1 || idxB === -1) {
    throw new Error(`Unknown model name: [${niceNameA}] or [${niceNameB}]`);
  }
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
    if (generatorName.includes("ft")) {
      price1k = 0.014;
    } else {
      price1k = 0.002;
    }
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
    if (!file.includes("gpt-3.5") && !file.includes("gpt-4")) {
      console.log("Skipping", file);
      continue;
    }
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

  writeFileSync(
    join(__dirname, "../../results-ft.csv"),
    toCsv(csvData),
    "utf-8"
  );

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

    const percentiles = [10, 20, 30, 40, 50, 60, 70, 80, 90].map((p) => {
      return [
        `${name} - p${p}`,
        ...generatorTypes.map((generatorName) => {
          const costs = generatorToResultsMap.get(generatorName)!;
          return formatValue(
            calcPercentile(
              costs.map((r) => valueExtractor(r)),
              p
            )
          );
        }),
      ];
    });

    return [averageRow, medianRow, ...percentiles];
  }
})();
