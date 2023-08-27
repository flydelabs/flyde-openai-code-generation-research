import { openai } from "../utils/open-ai";
import { flydeExamples } from "./chat-completion-instructions";

const qualityPrompt = `
Your job is to receive user prompts and a Flyde part that was based on the prompt. You reply with a JSON object containing a score of 1 to 5, and remarks. Do not add further explanations, just the JSON.
The score is on the scale of 1 to 5, where 1 is the worst and 5 is the best.
Examples:
1- The generated part has nothing to do with the request and doesn't conform to the part's format
2- The part is in valid format but has nothing to do with the request
3- The part works and is relevant to the request, but will require some tweaks to make it usable
4- it does the job pretty well, but might require minor tweaks to make perfect
5- does the job well, uses good names and properly uses Flyde's features

More context about Flyde:
Flyde is a flow-based programming tool that uses TypeScript to declare nodes.
Each node as an id, 0 or more inputs, 0 or more outputs, and a function that is called when the node is executed.
The function receives the inputs and returns the outputs. The function can be synchronous or asynchronous. The function has access to the input values, and output objects (RxJS Subjects) and can trigger any output by calling \`outputs.outputName.next(value)\`. The function may return a cleanup function.
The function haa the following signature: (inputs: Record<string, any>, outputs: Record<string, Output>, advanced: AdvancedContext) => void | Promise<void> | () => void | Promise<() => void>.
The advanced context has the following properties: "state", "globalState", "onCleanup", "onError" and a "externalContext".  state is a key-value store that is persisted between executions. globalState is a key-value store that is persisted between executions and is shared between all flows. onError is a function that can be called with an error to trigger the error output. externalContext contains data passed by the user to the flow's execution.
Flyde parts can be in one of 2 states: "pending values" or "processing". A part starts processing once it has all required inputs. 
Parts can have implicit completion or explicit completion. Implicit completion means that the part will complete once the function has returned a value. If the value is a promise, it'll wait for the promise to be resolved.
Explicit completion means that the user defines 1 or more outputs that once a value is emitted from them, they will trigger the completion of the part.
Once a part is processing, new inputs will be queued and processed only when it is done. In order for a part to receive new inputs while it is processing, the inputs need to be marked as "reactive inputs".
For example, a debounce node will receive a value and emit it after a delay. If it receives a new value before the delay is over, it will cancel the previous delay and start a new one. In order to do that, it needs to receive the new value while it is processing. Therefore, it needs to mark the input as "reactive input".

Flyde parts start with a metadata line that defines the part's ID, inputs, outputs, completion type and reactive inputs, followed by the function declaration.
The metadata looks like this:
ID | Inputs separated by a comma (or "None" for 0) | Outputs separated by a comma (or "None" for 0) | Completion type: IMPLICIT or the name of the output that triggers the completion | Reactive inputs separated by a comma (or "NONE" for 0)

Here are some examples, separated by "-----":
${flydeExamples}

You will receive a prompt followed by a part. You will need to reply with a JSON object containing a score of 1 to 5, and remarks. Do not add further explanations, just the JSON.
`;

export interface QualityResult {
  score: 1 | 2 | 3 | 4 | 5;
  remarks: string;
}

export async function measureQuality(
  prompt: string,
  result: string
): Promise<QualityResult> {
  const firstLine = result.split("\n")[0];
  if (firstLine.split("|").length !== 5) {
    console.error(firstLine);
    return {
      score: 1,
      remarks: `Invalid metadata row ${firstLine}`,
    };
  }
  const res = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    messages: [
      {
        role: "system",
        content: qualityPrompt,
      },
      {
        role: "user",
        content: `Prompt: ${prompt}\n${result}`,
      },
    ],
  });
  const rawString = res.choices[0].message?.content;
  if (!rawString) {
    throw new Error("No response from OpenAI");
  }
  try {
    const obj = JSON.parse(rawString);
    if (typeof obj.score !== "number") {
      throw new Error("Score is not a number");
    }
    if (typeof obj.remarks !== "string") {
      throw new Error("Remarks is not a string");
    }
    return obj;
  } catch (e) {
    throw new Error(`Invalid response from OpenAI: ${rawString}`);
  }
}
