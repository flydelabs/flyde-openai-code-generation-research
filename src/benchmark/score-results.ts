import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { GeneratedPart } from "./generate-parts";
import { withRetries } from "../utils";
import { measureQuality } from "./measure-quality";

export interface GeneratedPartWithScore extends GeneratedPart {
  score: number;
  remarks: string;
}

(async function () {
  const promptResults = readdirSync(join(__dirname, "../../prompt-results"));
  for (const file of promptResults) {
    const fullPath = join(__dirname, "../../prompt-results", file);
    const content = readFileSync(fullPath, "utf-8");
    const result: GeneratedPartWithScore = JSON.parse(content);

    if (result.score) {
      // console.log("Skipping", result.generatorName, file);
      // continue;
    }
    const score = await withRetries(() => {
      return measureQuality(result.prompt, result.result);
    });
    const merged = { ...result, ...score };

    console.log(merged);

    console.log("Writing", result.generatorName, file);
    const newContent = JSON.stringify(merged, null, 2);
    writeFileSync(fullPath, newContent);
    console.log("written");
  }
})();
