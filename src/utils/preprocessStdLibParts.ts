import { BasePart, CodePart, isCodePart } from "@flyde/core";
import * as allStdlib from "@flyde/stdlib/dist/all"; // secret export used by the documentation website to auto-generate the API reference

import {
  fileToTypescriptAst,
  extractRawFunctionCode,
  getFunctionDetails,
} from "./ast-helpers";
import { codePartToCompactString } from "./codePartToCompactString";

export interface ProcessedPart {
  original: CodePart & { runFnString: string };
  stringified: string;
}

export function preprocessStdLibParts(files: string[]): ProcessedPart[] {
  const asts = files.map(fileToTypescriptAst);

  const partObjects = Object.values(allStdlib).filter(isCodePart);

  const partFunctionBodies = asts
    .flatMap(extractRawFunctionCode)
    .sort((a, b) => {
      return (
        partObjects.findIndex((part) => part.id === a.id) -
        partObjects.findIndex((part) => part.id === b.id)
      );
    })
    .map((part, idx) => {
      if (part.type === "partFromSimpleFunction") {
        const outputName = Object.keys(partObjects[idx]?.outputs)[0];
        const { params, body } = getFunctionDetails(part.run);
        return `function ({ ${params.join(", ")} }, {${
          outputName ?? ""
        }}) {\n\t${body}\n}`;
      } else {
        return part.run;
      }
    });

  const partWithFnString = partFunctionBodies.map((functionBody, idx) => {
    const part = partObjects[idx];
    return { ...part, runFnString: functionBody };
  });

  return partWithFnString.map((part) => {
    return { stringified: codePartToCompactString(part), original: part };
  });
}
