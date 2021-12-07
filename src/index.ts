import Configuration, { loadConfig } from "./config/Configuration";
import Heater, { isHeaterNode } from "./heating/Heater";
import { startServer } from "./heating/HeatingServer";

const heaters = [] as Heater[];

const main = async () => {
    const loadedConfig = await loadConfig();

    if (!loadedConfig) {
        console.log("Nieprawidłowa konfiguracja!");
        process.exit(1);
    }

    const config = {
        interval: loadedConfig.interval,
        duration: loadedConfig.duration,
        heaters: loadedConfig.heaters
    }

    config.heaters.forEach((heaterNode) => {
        if (!isHeaterNode(heaterNode)) {
            console.log("Nieprawidłowa konfiguracja!");
            process.exit(1);
        } else {
            heaters.push(new Heater(heaterNode.name, heaterNode.gpio, heaterNode.active));
        }
    });

    await startServer(config, heaters);
};

process.on('SIGINT', () => {
    heaters.forEach(h => {
        h.disable();
        h.unregister();
    })
})

main();
