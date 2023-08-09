import { CharacterToString, ElementInArray } from "../../Shared Library/Utils";
import { state } from "../../proxy_state";
import { CutCommandFromContext } from "./commandutils";

const showStats = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);

    //Looks for pattern !showStats(already-created-character)
    const exp: RegExp = /(?<character>[\w\s']+)/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Null check
    if (!match || !match.groups) {
        state.message =
            "Show Stats: Arguments were not given in proper format.";
        return modifiedText;
    }

    //Grabbing info
    const characterName = match.groups.character;
    if (!ElementInArray(characterName, Object.keys(state.characters))) {
        state.message = `Show Stats: Character ${characterName} doesn't exist.`;
        return modifiedText;
    }
    const character = state.characters[characterName];

    //Sets info to print out
    state.out = `\n${characterName}'s current stats are:\n${CharacterToString(
        character
    )}.`;
    return modifiedText;
};

export default showStats;
