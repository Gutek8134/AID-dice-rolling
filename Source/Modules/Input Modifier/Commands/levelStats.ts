import { Character } from "../../Shared Library/Character";
import { Stat } from "../../Shared Library/Stat";
import { CharacterToString, ElementInArray } from "../../Shared Library/Utils";
import { state } from "../../Tests/proxy_state";
import { restrictedStatNames, levellingToOblivion } from "../constants";
import { CutCommandFromContext } from "./commandutils";

const levelStats = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);
    if (levellingToOblivion) {
        state.message =
            "Level Stats: This command will work only when you are levelling your characters.\nIn current mode stats are levelling by themselves when you are using them.";
        return modifiedText;
    }

    //Looks for format character, stat1+val1, stat2+val2...
    const exp: RegExp =
        /(?<character>[\w\s']+)(?<stats>(?:, [\w ']+ *\+ *\d+)+)/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    if (!match || !match.groups) {
        state.message = "Level Stats: No matching arguments found.";
        return modifiedText;
    }

    const characterName: string = match.groups.character;
    if (!ElementInArray(characterName, Object.keys(state.characters))) {
        state.message = "Level Stats: Nonexistent characters can't level up.";
        return modifiedText;
    }
    const character: Character = state.characters[characterName];

    let usedSkillpoints: number = 0;

    //Converts values to format [[stat, addedVal], [stat2, addedVal], ... [statN, addedVal]] and counts required skillpoints
    const values: [string, number][] = match.groups.stats
        .substring(2, match.groups.stats.length)
        .split(", ")
        .map((el) => el.trim().split("+"))
        .map((curr: string[]) => {
            usedSkillpoints += Number(curr[1]);
            return [curr[0].trim(), Number(curr[1])];
        });

    if (usedSkillpoints === 0) {
        state.message = "Level Stats: You need to use at least one skillpoint.";
        return modifiedText;
    }
    if (character.skillpoints < usedSkillpoints) {
        state.message = `Level Stats: ${characterName} doesn't have enough skillpoints (${character.skillpoints}/${usedSkillpoints}).`;
        return modifiedText;
    }

    //Caches old stats to show
    const oldStats: string = CharacterToString(character);

    //Changes stats
    for (const el of values) {
        if (ElementInArray(el[0], restrictedStatNames)) {
            state.message += `\nLevel Stats: ${el[0]} cannot be levelled up.`;
            continue;
        }
        //If stat doesn't exits on the character, creates it
        if (!character.stats[el[0]])
            character.stats[el[0]] = new Stat(el[0], el[1]);
        else character.stats[el[0]].level += el[1];

        character.skillpoints -= el[1];
    }

    state.out = `${characterName}'s stats has been levelled\nfrom\n${oldStats}\nto\n${CharacterToString(
        character
    )}.`;
    return modifiedText;
};

export default levelStats;
