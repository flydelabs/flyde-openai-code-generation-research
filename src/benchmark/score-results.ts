import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { GeneratedPart } from "./generate-parts";

import { measureQuality } from "./measure-quality";

export interface GeneratedPartWithScore extends GeneratedPart {
  score: number;
  remarks: string;
  newAttempt: boolean;
}

export async function withRetries<T>(fn: () => Promise<T>) {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn();
    } catch (e) {
      console.log("Retrying", e);
    }
  }
  throw new Error("Failed after 3 retries");
}

(async function () {
  const promptResults = readdirSync(join(__dirname, "../../prompt-results"));
  for (const file of promptResults) {
    const fullPath = join(__dirname, "../../prompt-results", file);
    const content = readFileSync(fullPath, "utf-8");

    const result: GeneratedPartWithScore = JSON.parse(content);

    let redid = result.newAttempt ?? false;
    if (result.score) {
      if (!result.generatorName.includes("ft") && !redid) {
        console.log("forcing recalculation of ", file);
        redid = true;
      } else {
        console.log("Skipping", result.generatorName, file);
        continue;
      }
    }

    if (result.generatorName.includes("gpt-4")) {
      console.log("Skipping gpt4");
      continue;
    }

    const score = await withRetries(() => {
      return measureQuality(result.prompt, result.result);
    });
    const merged = {
      ...result,
      ...score,
      redid,
      lastUpdated: new Date().toISOString(),
    };

    console.log(merged);

    console.log("Writing", result.generatorName, file);
    const newContent = JSON.stringify(merged, null, 2);
    writeFileSync(fullPath, newContent);
    console.log("written");
  }
})();
