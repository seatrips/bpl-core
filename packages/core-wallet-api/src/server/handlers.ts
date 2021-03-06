import { app } from "@blockpool-io/core-container";
import { Plugins } from "@blockpool-io/core-utils";

export const config = {
    async handler() {
        const appConfig = app.getConfig();

        return {
            data: {
                version: app.getVersion(),
                network: {
                    version: appConfig.get("network.pubKeyHash"),
                    name: appConfig.get("network.name"),
                    nethash: appConfig.get("network.nethash"),
                    explorer: appConfig.get("network.client.explorer"),
                    token: {
                        name: appConfig.get("network.client.token"),
                        symbol: appConfig.get("network.client.symbol"),
                    },
                },
                plugins: Plugins.transformPlugins(appConfig.config.plugins),
            },
        };
    },
    config: {
        cors: true,
    },
};
