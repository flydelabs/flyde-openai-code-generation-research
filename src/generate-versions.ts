import "dotenv/config";

import { batchProcessor } from "./utils";
import { generatePartVersions } from "./utils/generatePartVersions";
import {
  getFlydeFiles,
  saveVersionsResult,
  versionResultExists,
} from "./utils/fs-helpers";
import { preprocessStdLibParts } from "./utils/preprocessStdLibParts";

(async () => {
  const stdLibFiles = getFlydeFiles();
  const processedStdLibParts = preprocessStdLibParts(stdLibFiles);

  console.log(`Total parts: ${processedStdLibParts.length}`);

  const remainingParts = processedStdLibParts.filter(
    (version) => !versionResultExists(version)
  );

  console.log(`Remaining parts: ${remainingParts.length}`);

  /* generate part versions using OpenAI API.
    In reality I had to run this a few times. Got some timeouts, some code came corrupted, etc.
  */

  let totalTokens = 0;
  batchProcessor({
    items: remainingParts,
    batchSize: 4,
    processItem: generatePartVersions,
    onItemStart: (item) => {
      console.log(`Going to process ${item.original.id}`);
    },
    onCompleteItem: (item, result) => {
      totalTokens += result.tokensUsed;
      console.log(
        `Done with ${item.original.id} | tokens used: ${result.tokensUsed}`
      );
      saveVersionsResult(result);
    },
    onErrorItem: (item, error) => {
      console.error(`Failed ${item.original.id}`, error);
    },
  });
})();
