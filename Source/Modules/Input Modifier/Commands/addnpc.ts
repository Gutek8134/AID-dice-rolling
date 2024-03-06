import { NPC } from "../../Shared Library/Character";
import { state } from "../../proxy_state";
import { InfoOutput } from "../modifier";
import { CutCommandFromContext } from "./commandutils";

const addNPC = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    //Looks for pattern !addCharacter(name) or !addCharacter(name, stat1=value, stat2=value, ..., statN=value)
    const exp: RegExp =
        /^(?<character>[\w\s']+)(?<startingStats>(?:, *[\w ']+ *= *\d+)*)(?<startingItems>(?:, *(?:\$[\w\s']+)+)*)$/i;

    //Matches the RegEx
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Null check
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Add NPC: Arguments were not given in proper format.";
        return modifiedText;
    }

    //Grabbing info
    const characterName = match.groups.character;

    //Converts values to format [[stat, val], [stat2, val], ... [statN, val]]
    let values: [string, number][] = match.groups.startingStats
        ? match.groups.startingStats
              .substring(2)
              .split(", ")
              .map((el) => {
                  const temp: string[] = el.trim().split("=");
                  return [temp[0].trim(), Number(temp[1].trim())];
              })
        : [];

    // console.log(
    //     match.groups.startingItems
    //         .split(",")
    //         .map((el) => el.trim().substring(1))
    //         .slice(1)
    // );
    //Creates the character with stats. If none were given, every created stat is at state.startingLevel
    state.characters[characterName] = new NPC(
        values,
        match.groups.startingItems
            .split(",")
            .map((el) => el.trim().substring(1))
            .slice(1)
    );

    CutCommandFromContext(modifiedText, currIndices);
    state.out = `\nNon-Playable Character ${characterName} has been created with stats\n${state.characters[characterName]}.`;
    return modifiedText;
};

export default addNPC;
