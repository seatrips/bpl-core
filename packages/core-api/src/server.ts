import { app } from "@blockpool-io/core-container";
import { createServer, mountServer, plugins } from "@blockpool-io/core-http-utils";
import { Logger } from "@blockpool-io/core-interfaces";
import Hapi from "@hapi/hapi";
import { get } from "dottie";

export class Server {
    private logger = app.resolvePlugin<Logger.ILogger>("logger");

    private http: any;
    private https: any;

    public constructor(private config: any) {}

    public async start(): Promise<void> {
        const options = {
            host: this.config.host,
            port: this.config.port,
        };

        if (this.config.enabled) {
            this.http = await createServer(options);
            this.http.app.config = this.config;

            this.registerPlugins("HTTP", this.http);
        }

        if (this.config.ssl.enabled) {
            this.https = await createServer({
                ...options,
                ...{ host: this.config.ssl.host, port: this.config.ssl.port },
                ...{ tls: { key: this.config.ssl.key, cert: this.config.ssl.cert } },
            });
            this.https.app.config = this.config;

            this.registerPlugins("HTTPS", this.https);
        }
    }

    public async stop(): Promise<void> {
        if (this.http) {
            this.logger.info(`Stopping Public HTTP API`);
            await this.http.stop();
        }

        if (this.https) {
            this.logger.info(`Stopping Public HTTPS API`);
            await this.https.stop();
        }
    }

    public async restart(): Promise<void> {
        if (this.http) {
            await this.http.stop();
            await this.http.start();
        }

        if (this.https) {
            await this.https.stop();
            await this.https.start();
        }
    }

    public instance(type: string): Hapi.Server {
        return this[type];
    }

    private async registerPlugins(name: string, server: Hapi.Server): Promise<void> {
        await server.register({ plugin: plugins.contentType });

        await server.register({
            plugin: plugins.corsHeaders,
        });

        await server.register({
            plugin: plugins.whitelist,
            options: {
                whitelist: this.config.whitelist,
            },
        });

        await server.register({
            plugin: require("./plugins/set-headers"),
        });

        await server.register(plugins.hapiAjv);

        await server.register({
            plugin: require("hapi-rate-limit"),
            options: this.config.rateLimit,
        });

        await server.register({
            plugin: require("./plugins/pagination"),
            options: {
                query: {
                    limit: {
                        default: get(this.config, "pagination.limit", 100),
                    },
                },
            },
        });

        await server.register({
            plugin: require("./handlers"),
            routes: { prefix: "/api" },
        });

        for (const plugin of this.config.plugins) {
            if (typeof plugin.plugin === "string") {
                plugin.plugin = require(plugin.plugin);
            }

            await server.register(plugin);
        }

        server.route({
            method: "GET",
            path: "/",
            handler() {
                return { data: "Hello World!" };
            },
        });

        // @TODO: remove this with the release of 3.0 - adds support for /api and /api/v2
        server.ext("onRequest", (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            if (request.url) {
                const path: string = request.url.pathname.replace("/v2", "");
                request.setUrl(request.url.search ? `${path}${request.url.search}` : path);
            }

            return h.continue;
        });

        await mountServer(`Public ${name.toUpperCase()} API`, server);
    }
}
