import {
    ElementInArray,
    ItemToString,
    isInStats,
} from "../../Shared Library/Utils";
import { state } from "../../proxy_state";
import { restrictedStatNames } from "../constants";
import { DEBUG } from "../modifier";
import { CutCommandFromContext } from "./commandutils";

const alterItem = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);

    //TODO: effects
    //Looks for pattern name, slot, stat=value
    const exp: RegExp =
        /(?<name>[\w ']+)(?<slot>, [\w\s]+)?(?<modifiers>(?:, [\w ']+ *= *-?\d+)+)/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (!match || !match.groups) {
        state.message =
            "Alter Item: Arguments were not given in proper format.";
        return modifiedText;
    }

    if (!ElementInArray(match.groups.name, Object.keys(state.items))) {
        state.message = `Alter Item: Item ${match.groups.name} doesn't exist.`;
        if (DEBUG) {
            state.message += "\n";
            for (const key in state.items) state.message += ", " + key;
        }
        return modifiedText;
    }

    const itemName: string = match.groups.name.trim();

    //Converts values to format [[stat, val], [stat2, val], ... [statN, val]]
    const initValues: Array<[string, number]> = match.groups.modifiers
        .substring(2)
        .split(", ")
        .map((el) => {
            const temp: string[] = el.trim().split("=");
            return [temp[0].trim(), Number(temp[1].trim())];
        });

    //Stats must exist prior
    for (const modifier of initValues) {
        if (ElementInArray(modifier[0], restrictedStatNames)) {
            state.message += `\nAlter Item: ${modifier[0]} cannot be altered.`;
            continue;
        }
        if (!isInStats(modifier[0])) {
            state.message = `Alter Item: Stat ${modifier[0]} does not exist.`;
            return modifiedText;
        }
    }

    //Passes to constructor and adds received item to the state
    const item = state.items[itemName];
    const oldAttributes = ItemToString(item);

    item.slot = match.groups.slot.substring(2);
    for (const modifier of initValues) {
        if (modifier[1] === 0) delete item.modifiers[modifier[0]];
        else item.modifiers[modifier[0]] = modifier[1];
    }

    state.out = `\n${itemName}'s attributes has been altered\nfrom\n${oldAttributes}\nto\n${ItemToString(
        item
    )}.`;

    return modifiedText;
};

export default alterItem;
