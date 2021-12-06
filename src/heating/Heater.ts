import { BinaryValue, Gpio } from "onoff";
import { HeaterNode } from "src/config/Configuration";

export default class Heater {

    public name: string;
    public gpio: number;
    public active: BinaryValue;

    private _gpio: Gpio = {
        write: (num: number) => {
            console.log(num)
        }
    } as Gpio;

    constructor(name: string, gpio: number, active: 'high' | 'low') {
        this.name = name;
        this.gpio = gpio;
        // this._gpio = new Gpio(gpio, 'out');
        this.active = active == 'low' ? 0 : 1;

        // this.disable();
    }

    enable(): void {
        this._gpio.write(this.active)
    }

    disable(): void {
        this._gpio.write(this.active == 0 ? 1 : 0)
    }

    unregister(): void {
        this._gpio.unexport()
    }

}

export const isHeaterNode = (node: any): node is HeaterNode => {
    return (node as HeaterNode).gpio !== undefined;
};