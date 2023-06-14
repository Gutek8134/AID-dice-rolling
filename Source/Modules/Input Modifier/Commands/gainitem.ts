import { ElementInArray, _equip } from "../../Shared Library/Utils";
import { state } from "../../Tests/proxy_state";
import { CutCommandFromContext } from "./commandutils";

const gainItem = (
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
        state.message = "Gain Item: No arguments found.";
        return modifiedText;
    }

    const exp: RegExp = /(?<name>[\w ']+)(?:, *(?<character>[\w\s']+))?/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (!match || !match.groups) {
        state.message = "Gain Item: No matching arguments found.";
        return modifiedText;
    }

    const characterName: string = match.groups.character,
        itemName: string = match.groups.name;

    if (!ElementInArray(itemName, Object.keys(state.items))) {
        state.message = `Gain Item: Item ${itemName} doesn't exist.`;
        return modifiedText;
    }

    //If the character has been specified, it must exist
    if (
        characterName !== undefined &&
        !ElementInArray(characterName, Object.keys(state.characters))
    ) {
        state.message = `Gain Item: Character ${characterName} doesn't exist.`;
        return modifiedText;
    }

    state.inventory.push(itemName);
    if (characterName !== undefined) {
        modifiedText = _equip(
            characterName,
            state.items[itemName],
            modifiedText
        );
    } else modifiedText = `Item ${itemName} was put into inventory.`;

    return modifiedText;
};

export default gainItem;
