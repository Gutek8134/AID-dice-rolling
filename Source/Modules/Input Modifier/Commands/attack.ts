import { ElementInArray } from "../../Shared Library/Utils";
import { state } from "../../proxy_state";
import { DealDamage } from "../fightutils";
import { CutCommandFromContext } from "./commandutils";

const attack = (
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

    if (
        !ElementInArray(attackingCharacterName, Object.keys(state.characters))
    ) {
        state.message = `Attack: Character ${attackingCharacterName} does not exist.`;
        return modifiedText;
    }

    if (
        !ElementInArray(defendingCharacterName, Object.keys(state.characters))
    ) {
        state.message = `Attack: Character ${defendingCharacterName} does not exist.`;
        return modifiedText;
    }

    const { attackOutput, levelOutput, contextOutput } = DealDamage(
        attackingCharacterName,
        attackStat,
        defendingCharacterName,
        defenseStat,
        "Attack"
    );

    //Gives the player necessary info.
    modifiedText =
        textCopy.substring(0, currIndices[0]) +
        attackOutput +
        (levelOutput ? "\n" : "") +
        levelOutput +
        textCopy.substring(currIndices[1]);

    state.ctxt =
        textCopy.substring(0, currIndices[0]) +
        contextOutput +
        textCopy.substring(currIndices[1]);

    return modifiedText;
};

export default attack;
