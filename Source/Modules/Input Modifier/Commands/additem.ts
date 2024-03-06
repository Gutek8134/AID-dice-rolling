import { Item } from "../../Shared Library/Item";
import {
    ElementInArray,
    ItemToString,
    _equip,
    isInStats,
} from "../../Shared Library/Utils";
import { state } from "../../proxy_state";
import { restrictedStatNames } from "../constants";
import { InfoOutput } from "../modifier";

const addItem = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    //Error checking
    if (
        commandArguments === undefined ||
        commandArguments === null ||
        commandArguments === ""
    ) {
        state[InfoOutput] = "Add Item: No arguments found.";
        return modifiedText;
    }

    //Looks for pattern name, slot, stat=value, target place (none by default) and character
    const exp: RegExp =
        /(?<name>[\w ']+), (?<slot>[\w\s]+)(?<modifiers>(?:, [\w ']+ *= *-?\d+)+)(?<effectNames>(?:, (?!equip|inventory|[^\w '])[\w ']*)*)?(?:, *(?<target>inventory|equip)(?:, *(?<character>[\w\s']+))?)?/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Add Item: Arguments were not given in proper format.";
        return modifiedText;
    }

    if (ElementInArray(match.groups.name, Object.keys(state.items))) {
        state[
            InfoOutput
        ] = `Add Item: Item ${match.groups.name} already exists. Maybe you should use gainItem or equip instead?`;
        return modifiedText;
    }

    if (match.groups.target === "equip") {
        if (match.groups.character === undefined) {
            state[InfoOutput] =
                "Add Item: You must specify who will equip the item when you choose so.";
            return modifiedText;
        }
        if (
            !ElementInArray(
                match.groups.character,
                Object.keys(state.characters)
            )
        ) {
            state[
                InfoOutput
            ] = `Add Item: Character ${match.groups.character} doesn't exist.`;
            return modifiedText;
        }
    }

    const itemName: string = match.groups.name.trim();

    //Converts values to format [[stat, val], [stat2, val], ... [statN, val]]
    const initValues: Array<[string, number | string]> = match.groups.modifiers
        .substring(2)
        .split(", ")
        .map((el) => {
            const temp: string[] = el.trim().split("=");
            return [temp[0].trim(), Number(temp[1].trim())];
        });

    const effectNames = match.groups.effectNames
        ? match.groups.effectNames
              .substring(2)
              .split(", ")
              .map<[string, string]>((el) => ["effect", el.trim()])
        : [];

    //Sanitizing
    let error = false;
    for (const modifier of initValues) {
        if (ElementInArray(modifier[0], restrictedStatNames)) {
            state[InfoOutput] += `\nAdd Item: ${modifier[0]} cannot be set.`;
            error = true;
            continue;
        }
        //Stats must exist prior
        if (!isInStats(modifier[0])) {
            state[
                InfoOutput
            ] += `\nAdd Item: Stat ${modifier[0]} does not exist.`;
            error = true;
        }
    }

    for (const [_, name] of effectNames) {
        if (!ElementInArray(name, Object.keys(state.effects))) {
            state[InfoOutput] += `\nAdd Item: Effect ${name} does not exist.`;
            error = true;
        }
    }
    if (error) return modifiedText;

    initValues.push(...effectNames);

    //Adds slot
    initValues.push(["slot", match.groups.slot]);

    //Passes to constructor and adds received item to the state
    const item: Item = new Item(itemName, initValues);
    state.items[itemName] = item;

    //Gives the player necessary info.
    modifiedText =
        modifiedText.substring(0, currIndices[0]) +
        modifiedText.substring(currIndices[1]);

    state.out = `Item ${itemName} created with attributes:\n${ItemToString(
        item
    )}.`;

    if (match.groups.target === "equip")
        state.out += _equip(match.groups.character, item, "");
    else if (match.groups.target === "inventory") {
        state.inventory.push(itemName);
        state.out += `\nItem ${itemName} was put into inventory.`;
    }
    return modifiedText;
};

export default addItem;
