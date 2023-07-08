import { ElementInArray, _equip } from "../../Shared Library/Utils";
import { state } from "../../Tests/proxy_state";
import { CutCommandFromContext } from "./commandutils";

const equip = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);
    //Error checking
    if (!commandArguments) {
        state.message = "Equip Item: No arguments found.";
        return modifiedText;
    }

    //Looks for character, item1, item2, ..., itemN
    const exp: RegExp = /(?<character>[\w\s']+)(?<items>(?:, *[\w ']+)+)/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (!match || !match?.groups) {
        state.message =
            "Equip Item: Arguments were not given in proper format.";
        return modifiedText;
    }

    const characterName: string = match.groups.character,
        itemNames: string[] = match.groups.items
            .substring(1)
            .trim()
            .split(/, */)
            .map((x) => x.trim());

    if (!ElementInArray(characterName, Object.keys(state.characters))) {
        state.message = `Equip Item: Character ${characterName} doesn't exist.`;
        return modifiedText;
    }
    for (const name of itemNames) {
        if (!ElementInArray(name, Object.keys(state.items))) {
            state.message = `Equip Item: Item ${name} doesn't exist.`;
            return modifiedText;
        }

        if (!ElementInArray(itemNames, Object.keys(state.inventory))) {
            state.message = `Equip Item: You don't have item ${name} in your inventory.`;
            return modifiedText;
        }
    }

    for (const name of itemNames)
        modifiedText = _equip(characterName, state.items[name], modifiedText);

    modifiedText += `\nItem${
        itemNames.length > 1 ? "s" : ""
    } successfully equipped.`;
    return modifiedText;
};

export default equip;
