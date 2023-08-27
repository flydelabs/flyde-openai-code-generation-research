import { writeFileSync } from "fs";
import { codePartToCompactString } from "./utils/codePartToCompactString";
import { getFlydeFiles } from "./utils/fs-helpers";
import { preprocessStdLibParts } from "./utils/preprocessStdLibParts";
import { join } from "path";
import { chunkArray } from "./utils";
import { readVersionResult } from "./utils/generatePartVersions";
import { fullChatInstructions } from "./benchmark/chat-completion-instructions";

(async function () {
  const files = getFlydeFiles();
  const parts = preprocessStdLibParts(files);

  const partsWithVersions = parts.map((part) => {
    const versionData = readVersionResult(part);
    return { ...part, ...versionData };
  });

  const trainingDataset = partsWithVersions.flatMap((part) => {
    const compactPart = codePartToCompactString({
      ...part.original,
      runFnString: part.original.runFnString,
    });

    const prompt = part.prompts[0];

    return {
      messages: [
        { role: "system", content: fullChatInstructions },
        { role: "user", content: prompt },
        { role: "assistant", content: compactPart },
      ],
    };
  });

  const datasetFileLocation = join(__dirname, `../dataset-cc.json`);

  writeFileSync(datasetFileLocation, JSON.stringify(trainingDataset, null, 2));

  console.log(
    `${trainingDataset.length} examples written to: ${datasetFileLocation}.`
  );
})();
