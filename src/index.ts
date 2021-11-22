import { Gpio } from "onoff";

const outputs = [] as Gpio[];

for (let i = 0; i < 10; i++) {
    outputs.push(new Gpio(i, 'out'))
}

outputs.forEach(out => {
    out.write(0);
})

setTimeout(() => {
    outputs.forEach(out => {
        out.write(1);
    })
}, 3000)