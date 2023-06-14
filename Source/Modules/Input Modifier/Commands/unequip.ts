import { Character } from "../../Shared Library/Character";
import { ElementInArray } from "../../Shared Library/Utils";
import { state } from "../../Tests/proxy_state";
import { CutCommandFromContext } from "./commandutils";

const unequip = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);
    //Error checking
    if (!commandArguments) {
        state.message = "Unequip Item: No arguments found.";
        return modifiedText;
    }

    const exp: RegExp =
        /(?<character>[\w\s']+)(?<slots>(?:(?:, [\w ]+)+|, all))/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (!match || !match.groups) {
        state.message = "Unequip Item: No matching arguments found.";
        return modifiedText;
    }

    //Grabs character name
    const characterName: string = match.groups.character;

    //Checks if character exists
    if (!ElementInArray(characterName, Object.keys(state.characters))) {
        state.message = `Unequip Item: Character ${characterName} doesn't exist.`;
        return modifiedText;
    }

    const character: Character = state.characters[characterName];

    if (match.groups.slots === "all") {
        for (const slot of Object.keys(character.items)) {
            if (character.items[slot]) {
                state.inventory.push(character.items[slot].name);
                modifiedText += `\n${characterName} unequipped ${character.items[slot].name}.`;
            }
        }
        character.items = {};
    } else {
        //Puts items from slots back into inventory
        for (const slot of match.groups.slots
            .substring(1)
            .trim()
            .split(",")
            .map((x) => x.trim())) {
            if (character.items[slot]) {
                state.inventory.push(character.items[slot].name);
                modifiedText += `\n${characterName} unequipped ${character.items[slot].name}.`;
                delete character.items[slot];
            }
        }
    }

    return modifiedText;
};

export default unequip;
