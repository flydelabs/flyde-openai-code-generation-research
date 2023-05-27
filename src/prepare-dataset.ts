import { writeFileSync } from "fs";
import { codePartToCompactString } from "./utils/codePartToCompactString";
import { getFlydeFiles, readVersionResult } from "./utils/fs-helpers";
import { preprocessStdLibParts } from "./utils/preprocessStdLibParts";
import { join } from "path";
import { chunkArray } from "./utils";

(async function () {
  const files = getFlydeFiles();
  const parts = preprocessStdLibParts(files);

  const partsWithVersions = parts.map((part) => {
    const bob = readVersionResult(part);
    return { ...part, ...bob };
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

    const compactParts = [part.original.runFnString, part.alternativeFunction]
      .map((code) => ({ ...part.original, runFnString: code }))
      .map(codePartToCompactString);

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

    const compactParts = [part.original.runFnString, part.alternativeFunction]
      .map((code) => ({ ...part.original, runFnString: code }))
      .map(codePartToCompactString);

    return part.prompts.map((desc, idx) => {
      return {
        prompt: desc + "\n\n###\n\n",
        completion: " " + compactParts[idx % 2] + "###",
      };
    });
  });

  console.log(
    partsWithVersions.length,
    trainingDataset.length,
    validationDataset.length
  );

  const datasetFileLocation = join(__dirname, `../dataset.json`);

  writeFileSync(
    datasetFileLocation,
    JSON.stringify([...trainingDataset, ...validationDataset], null, 2)
  );

  console.log(
    `Dataset written to: ${datasetFileLocation}. Remember, the last ${validationDataset.length} entries are validation data.`
  );
})();
