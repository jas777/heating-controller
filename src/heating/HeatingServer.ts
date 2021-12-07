import fastify from "fastify";
import Heater from "./Heater";
import Configuration from "../config/Configuration";
import * as fs from "fs";
import * as Path from "path";

let allHeaters: undefined | Map<number, Heater>;
let loop: undefined | NodeJS.Timer;
let heatersAuto = [] as number[];
let heatersManual = [] as number[];

interface ConfigDTO {
    duration: number;
    interval: number;
}

export const startServer = async (config: Configuration, heaters: Heater[]) => {

    allHeaters = new Map<number, Heater>(heaters.map(h => [h.gpio, h]));

    allHeaters.forEach(h => heatersAuto.push(h.gpio));

    const app = fastify();

    app.register(require("fastify-cors"));

    app.addContentTypeParser(
        "application/json",
        { parseAs: "string" },
        function (_req, body, done) {
            try {
                const json = JSON.parse(body as string);
                done(null, json);
            } catch (err: any) {
                err.statusCode = 400;
                done(err, undefined);
            }
        }
    );

    app.post('/disable/:io', (req, res) => {

        const gpio = Number.parseInt((req.params as any).io);

        if (allHeaters!!.has(gpio)) {
            heatersAuto = heatersAuto.filter(h => h != gpio);
            allHeaters!!.get(gpio)?.disable();
            heatersManual.includes(gpio) ? () => {} : () => heatersManual.push(gpio);
            res.code(200).send('OK');
            app.log.info(`Removed heater ${gpio} from auto loop and force-disabled`);
        } else {
            res.code(404).send({ message: 'Heater not found!' });
            return;
        }

    });

    app.post('/enable/:io', (req, res) => {

        const gpio = Number.parseInt((req.params as any).io);

        if (allHeaters!!.has(gpio)) {
            heatersAuto = heatersAuto.filter(h => h != gpio);
            allHeaters!!.get(gpio)?.enable();
            heatersManual.includes(gpio) ? () => {} : () => heatersManual.push(gpio);
            res.code(200).send('OK');
            app.log.info(`Removed heater ${gpio} from auto loop and force-enabled`);
        } else {
            res.code(404).send({ message: 'Heater not found!' });
            return;
        }

    });

    app.post('/toggle/:io', (req, res) => {
        const gpio = Number.parseInt((req.params as any).io);

        if (allHeaters!!.has(gpio)) {
            if (heatersAuto.includes(gpio)) {
                heatersAuto = heatersAuto.filter(h => h != gpio);
                heatersManual.push(gpio);
            } else {
                heatersManual = heatersManual.filter(h => h != gpio);
                heatersAuto.push(gpio);
            }

            res.code(200).send({
                success: true,
                auto: heatersAuto.includes(gpio)
            })
        }

        res.code(404).send({
            message: 'Heater not found!'
        });
    });

    app.put('/update', (req, res) => {

        const data = req.body as ConfigDTO;

        if (data) {
            config.interval = data.interval;
            config.duration = data.duration;

            fs.writeFileSync(Path.resolve('ogrzewanie.config.json'), JSON.stringify(config, null, 4));

            clearInterval(<NodeJS.Timeout>loop);
            startLoop(config.interval, config.duration);

            res.code(200).send('OK');
        } else {
            res.code(400).send({ message: 'Invalid config data' });
        }

    });

    app.get('/config', (_req, res) => {
        res.code(200).send(config);
    });

    app.get('/inloop', (_req, res) => {
        res.code(200).send({ in_loop: heatersAuto });
    })

    app.listen(2137, '0.0.0.0', (err: any, addr: string) => {
        if (err) {
            console.error(err);
            process.exit(1); 
        }
        app.log.info(`Server listening on ${addr}`);
    });

    startLoop(config.interval, config.duration);

};

const startLoop = (interval: number, duration: number) => {
    loop = setInterval(() => {
        console.log(`Enabling - ${new Date().toISOString()}`)
        heatersAuto.forEach(h => allHeaters?.get(h)?.enable());
        setTimeout(() => {
            console.log(`Disabling - ${new Date().toISOString()}`)
            heatersAuto.forEach(h => allHeaters?.get(h)?.disable());
        }, duration);
    }, interval);
}
