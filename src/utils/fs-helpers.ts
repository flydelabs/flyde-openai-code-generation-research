import * as fs from "fs";
import { join } from "path";
import { ProcessedPart } from "./preprocessStdLibParts";
import { PartVersionsPayload } from "./generatePartVersions";

export function getFlydeFiles() {
  const baseFolder = join(__dirname, "../../stdlib-copy/src");
  return fs
    .readdirSync(baseFolder)
    .filter((file) => file.endsWith(".flyde.ts"))
    .map((file) => join(baseFolder, file));
}
