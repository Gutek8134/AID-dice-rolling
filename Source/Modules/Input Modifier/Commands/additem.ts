import { Item } from "../../Shared Library/Item";
import {
    ElementInArray,
    ItemToString,
    _equip,
    isInStats,
} from "../../Shared Library/Utils";
import { state } from "../../Tests/proxy_state";
import { restrictedStatNames } from "../constants";
import { CutCommandFromContext } from "./commandutils";

const addItem = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);
    //Error checking
    if (
        commandArguments === undefined ||
        commandArguments === null ||
        commandArguments === ""
    ) {
        state.message = "Add Item: No arguments found.";
        return modifiedText;
    }
    //Looks for pattern name, slot, stat=value, target place (none by default) and character
    const exp: RegExp =
        /(?<name>[\w ']+), (?<slot>[\w\s]+)(?<modifiers>(?:, [\w ']+ *= *-?\d+)+)(?:, *(?<target>inventory|equip)(?:, *(?<character>[\w\s']+))?)?/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (!match || !match.groups) {
        state.message = "Add Item: Arguments were not given in proper format.";
        return modifiedText;
    }

    if (ElementInArray(match.groups.name, Object.keys(state.items))) {
        state.message = `Add Item: Item ${match.groups.name} already exists. Maybe you should use gainItem or equip instead?`;
        return modifiedText;
    }

    if (match.groups.target === "equip") {
        if (match.groups.character === undefined) {
            state.message =
                "Add Item: You must specify who will equip the item when you choose so.";
            return modifiedText;
        }
        if (
            !ElementInArray(
                match.groups.character,
                Object.keys(state.characters)
            )
        ) {
            state.message = `Add Item: Character ${match.groups.character} doesn't exist.`;
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

    for (const modifier of initValues) {
        if (ElementInArray(modifier[0], restrictedStatNames)) {
            state.message = `Add Item: ${modifier[0]} cannot be set.`;
            return modifiedText;
        }
        //Stats must exist prior
        if (!isInStats(modifier[0])) {
            state.message = `Add Item: Stat ${modifier[0]} does not exist.`;
            return modifiedText;
        }
    }

    //Adds slot
    initValues.push(["slot", match.groups.slot]);

    //Passes to constructor and adds received item to the state
    const item: Item = new Item(itemName, initValues);
    state.items[itemName] = item;
    modifiedText = `Item ${itemName} created with attributes:\n${ItemToString(
        item
    )}.`;
    if (match.groups.target === "equip")
        modifiedText = _equip(match.groups.character, item, modifiedText);
    else if (match.groups.target === "inventory") {
        state.inventory.push(itemName);
        modifiedText += `\nItem ${itemName} was put into inventory.`;
    }
    return modifiedText;
};

export default addItem;
