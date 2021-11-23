import { loadConfig } from "./config/Configuration";
import Heater, { isHeaterNode } from "./heater/Heater";

const heaters = [] as Heater[];

const main = async () => {
    const config = await loadConfig();

    if (!config) {
        console.log("Nieprawidłowa konfiguracja!");
        process.exit(1);
    }

    config.heaters.forEach((heaterNode) => {
        if (!isHeaterNode(heaterNode)) {
            console.log("Nieprawidłowa konfiguracja!");
            process.exit(1);
        } else {
            heaters.push(new Heater(heaterNode.name, heaterNode.gpio, heaterNode.active))
        }
    });
};

main();
