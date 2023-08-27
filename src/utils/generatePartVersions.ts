import { join } from "path";
import { promptGpt } from "../utils";
import { ProcessedPart } from "./preprocessStdLibParts";
import { writeFileSync, existsSync, readFileSync } from "fs";

export interface PartVersionsPayload extends ProcessedPart {
  prompts: string[];
  alternativeFunction: string;
  alternativeMetaData: string;
  tokensUsed: number;
}

export async function generatePartVersions(
  part: ProcessedPart
): Promise<PartVersionsPayload> {
  const res = await promptGpt(
    `A Flyde code part describes a flow-based programming node.
The definition starts with some meta-data followed by a function body (in TypeScript).
The metadata contains an id,  list of  inputs and outputs, a list of outputs that trigger an explicit completion, and a list of reactive inputs, that receive values even if the Flyde part is processing.

The function described after the meta-data as access to the inputs and outputs and also a third parameter, "adv", that has a built-in state (adv.state, which is a Map). 

The format looks as following:
ID | INPUTS | OUTPUTS | COMPLETION_OUTPUTS | REACTIVE_INPUTS
CODE (can be multiple lines)
----------

For example, a POST request node is:

POST Request | url,headers,params,data | data | IMPLICIT | 
({ url, headers, params, data }, {data}) => {
    return axios.post(url, data, { headers, params }).then((res) => res.data);
}
----------

Debounce looks like this:
Debounce | value,wait | result | result | value
function (inputs, outputs, adv) {
    const { value, wait } = inputs;
    const { result } = outputs;

    const timer = adv.state.get("timer");
    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      result.next(value);
    }, wait);

    adv.state.set("timer", newTimer);

    adv.onCleanup(() => {
      clearTimeout(timer);
    });
  }

----------

Your job is to to receive a Flyde function help create 4 versions of potential prompts that users may user to describe it, and a new version of the function's body.

For example, for the POST request node, the prompts could be:
- Part that sends HTTP POST requests
- Send POST Request to URL

A throttle node could be:
- A part that receives values and throttles them to a certain rate


The result should have the following format:
{"prompts: ["prompt1", "prompt2", "prompt3", "prompt4"], "alternativeFunction": "Alternative function code here", "alternativeMetaData" : "Alternative metadata here}

The 4 prompts should be: 1 - super short ( a few words) 2-  very short ( 5-10 words), 3 - medium ( 10-15), and 4 - long (15+ words).
Do not mention "Flyde" in the description
Do not prefix the prompt
the "alternativeMetaData" should suggest different different names for the ids, inputs and outputs (make sure to match reactive inputs / completion outputs as well).
The "alternativeFunction" property should be another version of the function. It should used the changed input/output names from "alternativeMetaData" and can use different code to achieve the same result. As long as the same functionality remains. Do not use console logs unless it is the requirement.
Always use the "function" notation, such as:
function (inputs, outputs, adv) {
  // your code here
}
- never reply with "NEW CODE HERE" as the code, but use real code instead
- do not add the "adv" param if it is not used
- return a json format only
        `,
    part.stringified
  );
  if (!res.content) {
    throw new Error("No content");
  }
  try {
    const { alternativeFunction, alternativeMetaData, prompts } = JSON.parse(
      res.content
    );
    return {
      ...part,
      alternativeFunction,
      alternativeMetaData,
      prompts,
      tokensUsed: res.usage ?? 0,
    };
  } catch (e) {
    console.error("Failed to parse", res.content);
    throw e;
  }
}

const VERSION_RESULTS_DIR = "version-results";

export interface PersistedVersionResult {
  newCode: string;
  descriptions: string[];
}

export function saveVersionsResult(result: PartVersionsPayload) {
  return writeFileSync(
    join(__dirname, `../..`, VERSION_RESULTS_DIR, `${result.original.id}.json`),
    JSON.stringify(result, null, 2)
  );
}

export function versionResultExists(part: ProcessedPart) {
  return existsSync(
    join(__dirname, `../..`, VERSION_RESULTS_DIR, `${part.original.id}.json`)
  );
}

export function readVersionResult(part: ProcessedPart): PartVersionsPayload {
  return JSON.parse(
    readFileSync(
      join(__dirname, `../..`, VERSION_RESULTS_DIR, `${part.original.id}.json`),
      "utf-8"
    )
  );
}
