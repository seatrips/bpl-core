import { app } from "@blockpool-io/core-container";
import { ApiHelpers } from "../../../utils/helpers/api";

class Helpers {
    public headers: any;
    constructor() {
        this.headers = {
            port: 4000,
            version: "2.0.0",
        };
    }

    public async GET(endpoint, params = {}) {
        return this.request("GET", endpoint, params);
    }

    public async POST(endpoint, params) {
        return this.request("POST", endpoint, params);
    }

    public async request(method, path, params = {}) {
        const url = `http://localhost:4002/${path}`;
        const server = app.resolvePlugin("p2p").server;

        return ApiHelpers.request(server, method, url, this.headers, params);
    }
}

/**
 * @type {Helpers}
 */
export const utils = new Helpers();
