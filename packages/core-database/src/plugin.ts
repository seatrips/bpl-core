import { Container, Logger } from "@blockpool-io/core-interfaces";
import { ConnectionManager } from "./manager";

export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    alias: "database-manager",
    async register(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Starting Database Manager");

        return new ConnectionManager();
    },
};
