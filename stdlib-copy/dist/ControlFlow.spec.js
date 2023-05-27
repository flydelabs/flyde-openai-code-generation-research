"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@flyde/core");
const chai_1 = require("chai");
const test_utils_1 = require("@flyde/core/dist/test-utils");
const ControlFlow_flyde_1 = require("./ControlFlow.flyde");
describe("ControlFlow", () => {
    describe("Publish & Subscribe", () => {
        it("publishes and subscribes to a key", async () => {
            const key = "bla";
            const value = (0, core_1.randomInt)(42);
            const visualPart = (0, test_utils_1.concisePart)({
                id: "test",
                inputs: ["a"],
                outputs: ["b"],
                instances: [
                    (0, core_1.inlinePartInstance)("i1", ControlFlow_flyde_1.Publish, { key: (0, core_1.staticInputPinConfig)(key) }),
                    (0, core_1.inlinePartInstance)("i2", ControlFlow_flyde_1.Subscribe, {
                        key: (0, core_1.staticInputPinConfig)(key),
                    }),
                ],
                connections: [
                    ["a", "i1.value"],
                    ["i2.value", "b"],
                ],
            });
            const [s, b] = (0, test_utils_1.spiedOutput)();
            const input = (0, core_1.dynamicPartInput)();
            (0, core_1.execute)({
                part: visualPart,
                outputs: { b },
                inputs: { a: input },
                resolvedDeps: {},
                ancestorsInsIds: "bob",
            });
            input.subject.next(value);
            await (0, core_1.eventually)(() => {
                chai_1.assert.equal(s.callCount, 1);
                chai_1.assert.equal(s.lastCall.args[0], value);
            });
        });
    });
});
