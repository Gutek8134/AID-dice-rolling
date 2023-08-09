import { Character } from "../../Shared Library/Character";
import { ElementInArray } from "../../Shared Library/Utils";
import { state } from "../../proxy_state";
import { CutCommandFromContext } from "./commandutils";

const revive = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);
    //Looks for pattern reviving character, revived character, revive value
    const exp: RegExp =
        /(?<revivingCharacter>[\w\s']+), *(?<revivedCharacter>[\w\s']+), *(?<value>\d+)/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Null check
    if (!match || !match.groups) {
        state.message = "Revive: Arguments were not given in proper format.";
        return modifiedText;
    }

    //Shortcuts
    const value: number = Number(match.groups.value);
    const revivingCharacterName: string = match.groups.revivingCharacter;
    const revivedCharacterName: string = match.groups.revivedCharacter;

    //Checks for reviving char
    if (!ElementInArray(revivingCharacterName, Object.keys(state.characters))) {
        state.message = "Revive: Reviving character doesn't exist.";
        return modifiedText;
    }

    const revivingCharacter: Character =
        state.characters[revivingCharacterName];

    if (revivingCharacter.hp <= value) {
        state.message =
            "Revive: Reviving character would die if this action would be performed. Their hp is too low.\nRevive was not performed.";
        return modifiedText;
    }

    //Check for revived char
    if (!ElementInArray(revivedCharacterName, Object.keys(state.characters))) {
        state.message = "Revive: Revived character doesn't exist.";
        return modifiedText;
    }
    const revivedCharacter: Character = state.characters[revivedCharacterName];

    //Reviving/transfusion
    state.characters[revivingCharacterName].hp -= value;
    state.characters[revivedCharacterName].hp += value;

    //Custom output
    state.out = `${revivingCharacterName} transfused ${value} hp to ${revivedCharacterName}${
        revivedCharacter.hp === value
            ? ", reviving " + revivedCharacterName
            : ""
    }. Resulting hp: ${revivingCharacterName}: ${
        revivingCharacter.hp
    }, ${revivedCharacterName}: ${revivedCharacter.hp}.`;

    return modifiedText;
};

export default revive;
