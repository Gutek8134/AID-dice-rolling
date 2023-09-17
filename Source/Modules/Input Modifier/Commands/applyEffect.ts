import { Character } from "../../Shared Library/Character";
import { Effect, InstanceEffect } from "../../Shared Library/Effect";
import { CharacterToString, ElementInArray } from "../../Shared Library/Utils";
import { state } from "../../proxy_state";
import { CutCommandFromContext } from "./commandutils";

const applyEffect = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);

    //Looks for pattern name, character, override duration?
    const exp: RegExp =
        /(?<effectName>[\w ']+), (?<characterName>[\w ']+)(?:, (?<overriddenDuration>\d+))/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (!match || !match.groups) {
        state.message =
            "Apply Effect: Arguments were not given in proper format.";
        return modifiedText;
    }

    const effectName: string = match.groups.effectName;
    const characterName: string = match.groups.characterName;
    const overriddenDurationAsString: string = match.groups.overriddenDuration;

    if (!ElementInArray(effectName, Object.keys(state.effects))) {
        state.message = `Apply Effect: Effect ${effectName} does not exist.`;
        return modifiedText;
    }

    if (!ElementInArray(characterName, Object.keys(state.characters))) {
        state.message = `Apply Effect: Character ${characterName} does not exist.`;
        return modifiedText;
    }

    const effect: Effect = state.effects[effectName];
    const character: Character = state.characters[characterName];
    if (!character.activeEffects) character.activeEffects = [];

    if (effect.applyUnique)
        if (
            ElementInArray(
                effect.name,
                character.activeEffects.map((effect) => effect.name)
            )
        ) {
            state.message += `Apply Effect: Effect ${effect.name} was not applied to ${characterName}. Reason: unique effect already applied.`;
            return modifiedText;
        }

    InstanceEffect(
        characterName,
        effect,
        overriddenDurationAsString
            ? Number(overriddenDurationAsString)
            : undefined
    );

    state.out = `Effect ${effectName} applied to ${characterName}.
Current ${characterName} state:
${CharacterToString(character)}`;

    return modifiedText;
};

export default applyEffect;
