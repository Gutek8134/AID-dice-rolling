import { state } from "../proxy_state";
import { Character } from "./Character";
import { ElementInArray } from "./Utils";
import { GetStatWithMods } from "../Input Modifier/characterutils";

/**
 * Data Class
 * @field modifiers - modifiers applied when calling {@link GetStatWithMods}
 * @field duration left
 * @field base duration - both measured in actions
 * @field applyUnique - when set to false, allows for applying the same effect over and over to the same entity
 */
export class Effect {
    name: string;
    modifiers: { [key: string]: number };
    baseDuration: number;
    durationLeft: number;
    applyUnique: boolean;
    appliedOn: "attack" | "defense" | "battle start" | "not applied";
    appliedTo: "self" | "enemy";
    impact: "on end" | "continuous" | "every turn";

    constructor(
        inName: string,
        inModifiers: [string, number][],
        inDuration: number,
        inApplyUnique: boolean = true,
        inAppliedOn: "attack" | "defense" | "battle start" | "not applied",
        inAppliedTo: "self" | "enemy",
        inImpact: "on end" | "continuous" | "every turn"
    ) {
        this.name = inName;
        this.modifiers = Object.fromEntries(inModifiers);
        this.durationLeft = this.baseDuration = inDuration;
        this.applyUnique = inApplyUnique;
        this.appliedOn = inAppliedOn;
        this.appliedTo = inAppliedTo;
        this.impact = inImpact;
    }
}

/**
 * Makes a copy of effect template and applies it to character
 */
export const InstanceEffect = (
    characterName: string,
    effect: Effect,
    overriddenDuration?: number
): void => {
    const character: Character = state.characters[characterName];
    if (!character.effects) character.effects = [];

    if (effect.applyUnique)
        if (
            ElementInArray(
                effect.name,
                character.effects.map((effect) => effect.name)
            )
        ) {
            state.message += `Effect ${effect.name} was not applied to ${characterName}. Reason: unique effect already applied.`;
            return;
        }

    const effectCopy = { ...effect };
    if (overriddenDuration !== undefined && overriddenDuration > 0)
        effectCopy.durationLeft = overriddenDuration;
    character.effects.push(effectCopy);
};

export const RemoveEffect = (
    characterName: string,
    effectName: string
): void => {
    const character: Character = state.characters[characterName];
    if (!character.effects) {
        character.effects = [];
        return;
    }

    const effect: Effect | undefined = character.effects.find(
        (_effect) => _effect.name === effectName
    );
    if (effect === undefined) return;

    character.effects.splice(character.effects.indexOf(effect), 1);
};
