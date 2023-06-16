import { Character } from "../../Shared Library/Character";
import { Stat } from "../../Shared Library/Stat";
import { CharToString, ElementInArray } from "../../Shared Library/Utils";
import { state } from "../../Tests/proxy_state";
import { ignoredValues } from "../constants";
import { CutCommandFromContext } from "./commandutils";

const setStats = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);
    //Looks for pattern !addCharacter(name) or !addCharacter(name, stat1=value, stat2=value, ..., statN=value)
    const exp: RegExp =
        /(?<character>[\w\s']+)(?<stats>(?:, [\w ']+ *= *(?:\d+|[\w ']+))+)/i;

    //Matches the RegEx
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Null check
    if (!match || !match.groups) {
        state.message = "Set Stats: No matching arguments found.";
        return modifiedText;
    }

    //Grabbing info
    const characterName = match.groups.character;
    if (!ElementInArray(characterName, Object.keys(state.characters))) {
        state.message = `Set Stats: Character ${characterName} has not been found.`;
        return modifiedText;
    }

    const character: Character = state.characters[characterName];

    //Converts values to format [[stat, newVal], [stat2, newVal], ... [statN, newVal]]
    let values: [string, number][] = match.groups.stats
        .substring(2, match.groups.stats.length)
        .split(", ")
        .map((el) => el.trim().split("="))
        .map((curr: string[]) => {
            curr.map((el) => el.trim());
            return [curr[0].trim(), Number(curr[1])];
        });

    //Caches old stats to show
    const oldStats: string = CharToString(character);

    //Changes stats
    for (const el of values) {
        if (ElementInArray(el[0], ignoredValues)) {
            character[el[0]] = el[1];
            continue;
        }
        character.stats[el[0]] = new Stat(el[0], el[1]);
    }

    state.characters[characterName] = character;

    state.out = `\n${characterName}'s stats has been changed\nfrom\n${oldStats}\nto\n${CharToString(
        character
    )}.`;
    return modifiedText;
};

export default setStats;
