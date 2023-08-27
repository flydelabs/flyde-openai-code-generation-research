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

  const partsPerNamespace = partsWithVersions.reduce<
    Record<string, typeof parts>
  >((acc, part) => {
    const namespace = part.original.namespace ?? "n/a";
    if (!acc[namespace]) {
      acc[namespace] = [];
    }
    acc[namespace].push(part);
    return acc;
  }, {});

  const trainingIds = new Set<string>();
  const validationIds = new Set<string>();

  Object.entries(partsPerNamespace).forEach(([k, parts]) => {
    const chunks = chunkArray(parts, 10);
    chunks.forEach((chunk) => {
      chunk.forEach((part, idx) => {
        if (idx === 0 && chunk.length > 4) {
          validationIds.add(part.original.id);
        } else {
          trainingIds.add(part.original.id);
        }
      });
    });
  });

  const validationDataset = partsWithVersions.flatMap((part) => {
    if (!validationIds.has(part.original.id)) {
      return [];
    }

    const compactParts = codePartToCompactString({
      ...part.original,
      runFnString: part.original.runFnString,
    });

    return part.prompts.map((desc, idx) => {
      return {
        prompt: desc + "\n\n###\n\n",
        completion: " " + compactParts[idx % 2] + "###",
      };
    });
  });

  const trainingDataset = partsWithVersions.flatMap((part) => {
    if (!trainingIds.has(part.original.id)) {
      return [];
    }

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

  writeFileSync(
    datasetFileLocation,
    JSON.stringify([...trainingDataset, ...validationDataset], null, 2)
  );

  console.log(
    `${trainingDataset.length} examples written to: ${datasetFileLocation}. Remember, the last ${validationDataset.length} entries are validation data.`
  );
})();
