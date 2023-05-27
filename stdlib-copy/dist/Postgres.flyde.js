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
exports.Query = exports.Disconnect = exports.Connect = void 0;
const namespace = "Postgres";
exports.Connect = {
    id: "Connect",
    defaultStyle: {
        icon: "fa-database",
    },
    namespace,
    description: 'Connects to a Postgres database and returns a client. Uses the "pg" package.',
    inputs: {
        host: { description: "Host" },
        port: { description: "Port" },
        database: { description: "Database" },
        user: { description: "User" },
        password: { description: "Password" },
    },
    outputs: { connection: { description: "Postgres connected client" } },
    run: async ({ host, port, database, user, password }, { connection }) => {
        const { Client } = await Promise.resolve().then(() => __importStar(require("pg")));
        const client = new Client({
            host,
            port,
            database,
            user,
            password,
        });
        await client.connect();
        connection.next(client);
    },
};
exports.Disconnect = {
    id: "Disconnect",
    defaultStyle: {
        icon: "fa-database",
    },
    namespace,
    description: "Disconnects from a Postgres database",
    inputs: { connection: { description: "Postgres connection" } },
    outputs: {},
    run: async ({ connection }) => {
        var _a;
        await ((_a = connection.value) === null || _a === void 0 ? void 0 : _a.end());
    },
};
exports.Query = {
    id: "Query",
    defaultStyle: {
        icon: "fa-database",
    },
    namespace,
    description: 'Queries a Postgres database. Query receives a valid "pg" QueryConfig object.',
    inputs: {
        connection: { description: "Postgres connection" },
        query: { description: "Query" },
    },
    outputs: {
        result: {
            description: 'valid "pg" <a href="https://node-postgres.com/apis/client#queryconfig">QueryConfig object</a>',
        },
    },
    run: async ({ connection, query }, { result }) => {
        var _a;
        const queryResult = await ((_a = connection.value) === null || _a === void 0 ? void 0 : _a.query(query));
        result.next(queryResult === null || queryResult === void 0 ? void 0 : queryResult.rows);
    },
};
