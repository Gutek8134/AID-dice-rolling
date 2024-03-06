import {
    ElementInArray,
    ItemToString,
    isInStats,
} from "../../Shared Library/Utils";
import { state } from "../../proxy_state";
import { restrictedStatNames } from "../constants";
import { DEBUG, InfoOutput } from "../modifier";
import { CutCommandFromContext } from "./commandutils";

const alterItem = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);

    //Looks for pattern name, slot, stat=value
    const exp: RegExp =
        /(?<name>[\w ']+)(?<slot>, [\w\s]+)?(?<modifiers>(?:, [\w ']+ *= *-?\d+)+)(?<effectNames>(?:, [\w ']+)*)/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Alter Item: Arguments were not given in proper format.";
        return modifiedText;
    }

    if (!ElementInArray(match.groups.name, Object.keys(state.items))) {
        state[
            InfoOutput
        ] = `Alter Item: Item ${match.groups.name} does not exist.`;
        if (DEBUG) {
            state[InfoOutput] += "\n";
            for (const key in state.items) state[InfoOutput] += ", " + key;
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

    const effectNames = match.groups.effectNames
        ? match.groups.effectNames
              .substring(2)
              .split(", ")
              .map<string>((el) => el.trim())
        : [];

    //Stats must exist prior
    let error: boolean = false;
    for (const modifier of initValues) {
        if (ElementInArray(modifier[0], restrictedStatNames)) {
            state[
                InfoOutput
            ] += `\nAlter Item: ${modifier[0]} cannot be altered.`;
            error = true;
            continue;
        }
        if (!isInStats(modifier[0])) {
            state[
                InfoOutput
            ] = `Alter Item: Stat ${modifier[0]} does not exist.`;
            error = true;
        }
    }

    for (const name of effectNames) {
        if (!ElementInArray(name, Object.keys(state.effects))) {
            state[InfoOutput] += `\nAlter Item: Effect ${name} does not exist.`;
            error = true;
        }
    }
    if (error) return modifiedText;

    const item = state.items[itemName];
    const oldAttributes = ItemToString(item);

    item.slot = match.groups.slot.substring(2);
    for (const modifier of initValues) {
        if (modifier[1] === 0) delete item.modifiers[modifier[0]];
        else item.modifiers[modifier[0]] = modifier[1];
    }

    if (effectNames.length > 0) {
        item.effects = effectNames;
    }

    state.out = `\n${itemName}'s attributes has been altered\nfrom\n${oldAttributes}\nto\n${ItemToString(
        item
    )}.`;

    return modifiedText;
};

export default alterItem;
