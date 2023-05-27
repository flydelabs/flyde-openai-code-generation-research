"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = exports.Put = exports.Post = exports.Get = void 0;
const axios_1 = __importDefault(require("axios"));
const namespace = "HTTP";
exports.Get = {
    id: "GET Request",
    defaultStyle: {
        icon: "fa-server",
    },
    namespace,
    description: "Performs a HTTP GET request to a URL and emits the response data",
    inputs: {
        url: { description: "URL to fetch data from" },
        headers: {
            description: "Headers to send with the request",
            mode: "required-if-connected",
        },
        params: {
            description: "Query parameters to send with the request",
            mode: "required-if-connected",
        },
    },
    outputs: { data: { description: "The response data" } },
    run: ({ url, headers, params }, { data }) => {
        return axios_1.default
            .get(url, { headers, params })
            .then((res) => data.next(res.data));
    },
};
exports.Post = {
    id: "POST Request",
    defaultStyle: {
        icon: "fa-server",
    },
    namespace,
    description: "Performs a HTTP POST request to a URL and emits the response data",
    inputs: {
        url: { description: "URL to fetch data from" },
        headers: {
            description: "Headers to send with the request",
            mode: "required-if-connected",
        },
        params: {
            description: "Query parameters to send with the request",
            mode: "required-if-connected",
        },
        data: {
            description: "Data to send with the request",
            mode: "required-if-connected",
        },
    },
    outputs: { data: { description: "The response data" } },
    run: ({ url, headers, params, data: body }, { data }) => {
        const config = { headers, params };
        return axios_1.default.post(url, body, config).then((res) => data.next(res.data));
    },
};
exports.Put = {
    id: "PUT Request",
    defaultStyle: {
        icon: "fa-server",
    },
    namespace,
    description: "Performs a HTTP PUT request to a URL and emits the response data",
    inputs: {
        url: { description: "URL to fetch data from" },
        headers: {
            description: "Headers to send with the request",
            mode: "required-if-connected",
        },
        params: {
            description: "Query parameters to send with the request",
            mode: "required-if-connected",
        },
        data: {
            description: "Data to send with the request",
            mode: "required-if-connected",
        },
    },
    outputs: { data: { description: "The response data" } },
    run: ({ url, headers, params, data: body }, { data }) => {
        const config = { headers, params };
        return axios_1.default.put(url, body, config).then((res) => data.next(res.data));
    },
};
exports.Request = {
    id: "Request",
    defaultStyle: {
        icon: "fa-server",
    },
    namespace,
    description: "Performs a HTTP request to a URL and emits the response data",
    inputs: {
        url: { description: "URL to fetch data from" },
        method: { description: "HTTP method to use" },
        headers: {
            description: "Headers to send with the request",
            mode: "required-if-connected",
        },
        params: {
            description: "Query parameters to send with the request",
            mode: "required-if-connected",
        },
        data: {
            description: "Data to send with the request",
            mode: "required-if-connected",
        },
    },
    outputs: { data: { description: "The response data" } },
    run: ({ url, method, headers, params, data: body }, { data }) => {
        const config = { method, headers, params };
        return axios_1.default
            .request({ url, data: body, ...config })
            .then((res) => data.next(res.data));
    },
};
