import { promptGpt } from "../utils";
import { ProcessedPart } from "./preprocessStdLibParts";

export interface PartVersionsPayload extends ProcessedPart {
  descriptions: string[];
  newCode: string;
  tokensUsed: number;
}

export async function generatePartVersions(
  part: ProcessedPart
): Promise<PartVersionsPayload> {
  const res = await promptGpt(
    `A Flyde function is a flow-based programming node description. It has the following format:
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
        
        Your job is to to receive a Flyde function help create 4 versions of descriptions for it, and a new version of the function's body.
        
        The result should have the following format:
        {"descriptions: ["description1", "description2", "description3", "description4"], "newCode": "NEW CODE HERE"}
        
        The descriptions 4 descriptions should be: 1 - super short ( a few words) 2-  very short ( 5-10 words), 3 - medium ( 10-15), and 4 - long (15+ words).
        Do not mention "Flyde" in the description
        Do not prefix the description
        The "code" property should be another version of the function's code body. Do not use console logs unless it is the requirement.
        Always use the "function" notation, such as:
        function (inputs, outputs, adv) {
          // your code here
        }
        never reply with "NEW CODE HERE" as the code, but use real code instead!
        `,
    part.stringified
  );
  if (!res.content) {
    throw new Error("No content");
  }
  const { newCode, descriptions } = JSON.parse(res.content);
  return {
    ...part,
    newCode,
    descriptions,
    tokensUsed: res.usage ?? 0,
  };
}
