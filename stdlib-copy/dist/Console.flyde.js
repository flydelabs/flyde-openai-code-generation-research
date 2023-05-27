"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Error = exports.Log = void 0;
const namespace = "Console";
exports.Log = {
    id: "Log",
    defaultStyle: {
        icon: "fa-terminal",
    },
    namespace,
    description: "Logs a value to the console",
    inputs: {
        value: { description: "Value to log" },
    },
    outputs: {},
    run: ({ value }) => console.log(value),
};
exports.Error = {
    id: "Error",
    defaultStyle: {
        icon: "fa-terminal",
    },
    namespace,
    description: "Logs an error to the console",
    inputs: {
        value: { description: "Value to log" },
    },
    outputs: {},
    run: ({ value }) => console.error(value),
};
