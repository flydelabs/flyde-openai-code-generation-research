const chatInstructions = [
  `Flyde is a flow-based programming tool that uses TypeScript to declare nodes.
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

  HEre are some examples, separated by "-----":

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
  -----
  Add | n1,n2 | sum | IMPLICIT | NONE
  function (inputs, outputs, adv) {
    const { n1, n2 } = inputs;
    const { sum } = outputs;
    sum.next(n1 + n2);
  }
  -----
  POST Request | url,headers,params,data | data | IMPLICIT | NONE
  ({ url, headers, params, data: body }, { data }) => {
    const config: AxiosRequestConfig = { headers, params };
    return axios.post(url, body, config).then((res) => data.next(res.data));
  } 
  -----
  Split Pair | pair | item1,item2 | IMPLICIT | NONE
  (inputs, outputs) => {
    const { pair } = inputs;
    const { item1, item2 } = outputs;
    item1.next(pair[0]);
    item2.next(pair[1]);
  }
  -----
  `,
];
