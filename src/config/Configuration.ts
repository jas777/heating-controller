import {
    array,
    choiceItem,
    Confinode,
    literal,
    numberItem,
    stringItem,
} from "confinode";

export default interface Configuration {
    heaters: HeaterNode[];
}

export interface HeaterNode {
    name: string,
    gpio: number,
    active: 'high' | 'low'
}

export const loadConfig = async (): Promise<Configuration | undefined> => {
    const description = literal<Configuration>({
        heaters: array(
            literal<HeaterNode>({
                name: stringItem(),
                gpio: numberItem(),
                active: choiceItem(["high", "low"]),
            })
        ),
    });

    const confinode = new Confinode("ogrzewanie", description);

    const configResult = await confinode.search();
    return configResult?.configuration;
};