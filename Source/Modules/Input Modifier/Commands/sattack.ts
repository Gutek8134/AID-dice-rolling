import { ElementInArray } from "../../Shared Library/Utils";
import { state } from "../../Tests/proxy_state";
import { DealDamageIfNotDodged } from "../fightutils";
import { CutCommandFromContext } from "./commandutils";

const sattack = (
    commandArguments: string,
    currIndices: number[],
    textCopy: string,
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);

    //Error checking
    if (
        commandArguments === undefined ||
        commandArguments === null ||
        commandArguments === ""
    ) {
        state.message = "Attack: Arguments were not given in proper format.";
        return modifiedText;
    }

    //Checks for format stat, character, stat, character
    const exp: RegExp =
        /(?<attackingCharacter>[\w\s']+), *(?<attackStat>[\w ']+), *(?<defendingCharacter>[\w\s']+), *(?<defenseStat>[\w ']+)/i;

    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (match === null || !match.groups) {
        state.message = "Attack: No matching arguments found.";
        return modifiedText;
    }

    //Checks if stats exist
    if (!ElementInArray(match.groups.attackStat, state.stats)) {
        state.message = `Attack: Stat ${match.groups.attackStat} was not created.`;
        return modifiedText;
    }
    if (!ElementInArray(match.groups.defenseStat, state.stats)) {
        state.message = `Attack: Stat ${match.groups.defenseStat} was not created.`;
        return modifiedText;
    }

    //Creates shortcuts to names and stats
    const attackingCharacterName: string = match.groups.attackingCharacter;
    const attackStat: string = match.groups.attackStat;
    const defendingCharacterName: string = match.groups.defendingCharacter;
    const defenseStat: string = match.groups.defenseStat;

    const { attackOutput, levelOutput, contextOutput } = DealDamageIfNotDodged(
        attackingCharacterName,
        attackStat,
        defendingCharacterName,
        defenseStat,
        "Attack"
    );

    //Gives the player necessary info.
    modifiedText =
        modifiedText.substring(0, currIndices[0]) +
        attackOutput +
        (levelOutput ? " " : "") +
        levelOutput +
        textCopy.substring(currIndices[1]);

    state.ctxt =
        state.ctxt !== ""
            ? state.ctxt.substring(0, currIndices[0]) +
              contextOutput +
              state.ctxt.substring(currIndices[1])
            : modifiedText.substring(0, currIndices[0]) +
              contextOutput +
              modifiedText.substring(currIndices[1]);

    return modifiedText;
};

export default sattack;
