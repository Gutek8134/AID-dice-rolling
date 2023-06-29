import { Character } from "../../Shared Library/Character";
import { state } from "../../Tests/proxy_state";
import { CutCommandFromContext } from "./commandutils";

const addCharacter = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);
    //Looks for pattern !addCharacter(name) or !addCharacter(name, stat1=value, stat2=value, ..., statN=value)
    //or !addCharacter(name, stat1=value, stat2=value, ..., statN=value, $itemName1, itemName2, ...)
    const exp: RegExp =
        /(?<character>[\w\s']+)(?<startingStats>(?:, [\w ']+ *= *(?:\d+|\$[\w ']+))*)(?<startingItems>(?:, *(?:\$[\w '])+)*)/i;

    //Matches the RegEx
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Null check
    if (!match || !match.groups) {
        state.message =
            "Add Character: Arguments were not given in proper format.";
        return modifiedText;
    }

    //Grabbing info
    const characterName = match.groups.character;

    //Converts values to format [[stat, val], [stat2, val], ... [statN, val]]
    let values: [string, number][] = match.groups.startingStats
        .substring(2)
        .split(", ")
        .map((el) => {
            const temp: string[] = el.trim().split("=");
            return [temp[0].trim(), Number(temp[1].trim())];
        });

    //Creates the character with stats. If none were given, every created stat is at state.startingLevel
    state.characters[characterName] = new Character(
        values || [],
        match.groups.startingItems.split(",").map((el) => el.trim()) || []
    );

    state.out = `\nCharacter ${characterName} has been created with stats\n${state.characters[characterName]}.`;
    return modifiedText;
};

export default addCharacter;
