import { CodePart } from "@flyde/core";

export function codePartToCompactString(
  codePart: CodePart & { runFnString: string }
) {
  const { id, inputs, outputs, completionOutputs, reactiveInputs } = codePart;
  return `${id} | ${Object.keys(inputs).join(",")} | ${Object.keys(
    outputs
  ).join(",")} | ${completionOutputs?.join(",") ?? "IMPLICIT"} | ${
    reactiveInputs?.join(",") ?? "NONE"
  }\n${codePart.runFnString}`;
}
