import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { ProcessedPart } from "./preprocessStdLibParts";
import { PartVersionsPayload } from "./generatePartVersions";

export function getFlydeFiles() {
  const baseFolder = join(__dirname, "../../node_modules/@flyde/stdlib/src");
  return readdirSync(baseFolder)
    .filter((file) => file.endsWith(".flyde.ts"))
    .map((file) => join(baseFolder, file));
}

const RESULTS_DIR = "results";

export interface PersistedVersionResult {
  newCode: string;
  descriptions: string[];
}

export function saveVersionsResult(result: PartVersionsPayload) {
  return writeFileSync(
    join(__dirname, `../..`, RESULTS_DIR, `${result.original.id}.json`),
    JSON.stringify(result, null, 2)
  );
}

export function versionResultExists(part: ProcessedPart) {
  return existsSync(
    join(__dirname, `../..`, RESULTS_DIR, `${part.original.id}.json`)
  );
}

export function readVersionResult(part: ProcessedPart): PartVersionsPayload {
  return JSON.parse(
    readFileSync(
      join(__dirname, `../..`, RESULTS_DIR, `${part.original.id}.json`),
      "utf-8"
    )
  );
}
