"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exists = exports.DeleteFile = exports.AppendFile = exports.WriteFile = exports.ReadFile = void 0;
const fs = __importStar(require("fs"));
const namespace = "File System";
exports.ReadFile = {
    id: "Read File",
    defaultStyle: {
        icon: "fa-file",
    },
    namespace,
    description: "Reads a file from the file system",
    inputs: {
        path: { description: "Path to the file" },
        encoding: {
            description: "Encoding of the file",
            mode: "optional",
            defaultValue: "utf8",
        },
    },
    outputs: { contents: { description: "Contents of the file" } },
    run: async ({ path, encoding }, { contents }) => {
        return contents.next(await fs.promises.readFile(path, encoding));
    },
};
exports.WriteFile = {
    id: "Write File",
    defaultStyle: {
        icon: "fa-file",
    },
    namespace,
    description: "Writes a file to the file system",
    inputs: {
        path: { description: "Path to the file" },
        contents: { description: "Contents of the file" },
        encoding: {
            description: "Encoding of the file",
            mode: "optional",
            defaultValue: "utf8",
        },
    },
    outputs: {},
    run: ({ path, contents, encoding }) => {
        return fs.promises.writeFile(path, contents, encoding);
    },
};
exports.AppendFile = {
    id: "Append File",
    defaultStyle: {
        icon: "fa-file",
    },
    namespace,
    description: "Appends a file to the file system",
    inputs: {
        path: { description: "Path to the file" },
        contents: { description: "Contents of the file" },
        encoding: {
            description: "Encoding of the file",
            mode: "optional",
            defaultValue: "utf8",
        },
    },
    outputs: {},
    run: ({ path, contents, encoding }) => {
        return fs.promises.appendFile(path, contents, encoding);
    },
};
exports.DeleteFile = {
    id: "Delete File",
    defaultStyle: {
        icon: "fa-file",
    },
    namespace,
    description: "Deletes a file from the file system",
    inputs: { path: { description: "Path to the file" } },
    outputs: {},
    run: async ({ path }, {}) => {
        await fs.promises.unlink(path);
    },
};
exports.Exists = {
    id: "Exists",
    defaultStyle: {
        icon: "fa-file",
    },
    namespace,
    description: "Checks if a file exists",
    inputs: { path: { description: "Path to the file" } },
    outputs: { exists: { description: "Whether the file exists" } },
    run: async ({ path }, { exists }) => {
        // check if file in path exists
        return exists.next(await fs.promises.access(path, fs.constants.F_OK));
    },
};
