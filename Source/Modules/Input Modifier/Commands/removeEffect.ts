import { Character } from "../../Shared Library/Character";
import { RemoveEffect } from "../../Shared Library/Effect";
import { CharacterToString, ElementInArray } from "../../Shared Library/Utils";
import { state } from "../../proxy_state";
import { InfoOutput } from "../modifier";
import { CutCommandFromContext } from "./commandutils";

const removeEffect = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);

    //Looks for pattern name|all, character
    const exp: RegExp = /^(?<effectName>[\w ']+), (?<characterName>[\w ']+)$/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Remove Effect: Arguments were not given in proper format.";
        return modifiedText;
    }

    const effectName: string = match.groups.effectName;
    const characterName: string = match.groups.characterName;

    if (
        !ElementInArray(effectName, Object.keys(state.effects)) &&
        effectName !== "all"
    ) {
        state[
            InfoOutput
        ] = `Remove Effect: Effect ${effectName} does not exist.`;
        return modifiedText;
    }

    if (!ElementInArray(characterName, Object.keys(state.characters))) {
        state[
            InfoOutput
        ] = `Remove Effect: Character ${characterName} does not exist.`;
        return modifiedText;
    }

    const character: Character = state.characters[characterName];
    if (!character.activeEffects) character.activeEffects = [];

    if (effectName === "all") {
        character.activeEffects = [];
        state.out = `All effects have been removed from ${characterName}.
Current ${characterName} state:
${CharacterToString(character)}`;
        return modifiedText;
    }

    if (
        !ElementInArray(
            effectName,
            character.activeEffects.map((effect) => effect.name)
        )
    ) {
        state[
            InfoOutput
        ] += `Remove Effect: Character ${characterName} is not under influence of effect ${effectName}.`;
        return modifiedText;
    }

    RemoveEffect(characterName, effectName);

    state.out = `Effect ${effectName} removed from ${characterName}.
Current ${characterName} state:
${CharacterToString(character)}`;

    return modifiedText;
};

export default removeEffect;
