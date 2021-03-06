import { Container, Logger } from "@blockpool-io/core-interfaces";
import { isWhitelisted } from "@blockpool-io/core-utils";
import ip from "ip";
import { defaults } from "./defaults";
import { startServer } from "./server";

export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    alias: "wallet-api",
    depends: "@blockpool-io/core-api",
    async register(container: Container.IContainer, options) {
        if (!isWhitelisted(container.resolveOptions("api").whitelist, ip.address())) {
            container.resolvePlugin<Logger.ILogger>("logger").info("Wallet API is disabled");

            return undefined;
        }

        return startServer(options.server);
    },
    async deregister(container: Container.IContainer, options) {
        try {
            container.resolvePlugin<Logger.ILogger>("logger").info("Stopping Wallet API");

            await container.resolvePlugin("wallet-api").stop();
        } catch (error) {
            // do nothing...
        }
    },
};
