import { state } from "../proxy_state";
import { Character } from "./Character";
import { ElementInArray, experienceCalculation } from "./Utils";
import { GetStatWithMods } from "../Input Modifier/characterutils";
import { levellingToOblivion } from "../Input Modifier/constants";
import { InfoOutput } from "../Input Modifier/modifier";

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
    readonly type: "effect";
    [key: string]: string | number | boolean | { [key: string]: number };

    constructor(
        inName: string,
        inModifiers: [string, number][],
        inDuration: number,
        inAppliedOn: "attack" | "defense" | "battle start" | "not applied",
        inAppliedTo: "self" | "enemy",
        inImpact: "on end" | "continuous" | "every turn",
        inApplyUnique: boolean = true
    ) {
        this.name = inName;
        this.modifiers = Object.fromEntries(inModifiers);
        this.durationLeft = this.baseDuration = inDuration;
        this.applyUnique = inApplyUnique;
        this.appliedOn = inAppliedOn;
        this.appliedTo = inAppliedTo;
        this.impact = inImpact;
        this.type = "effect";
    }
}

/**
 * Makes a copy of effect template and applies it to character
 */
export const InstanceEffect = (
    characterName: string,
    effect: Effect,
    overriddenDuration?: number
): string => {
    const character: Character = state.characters[characterName];
    if (!character.activeEffects) character.activeEffects = [];

    if (effect.applyUnique)
        if (
            ElementInArray(
                effect.name,
                character.activeEffects.map((effect) => effect.name)
            )
        ) {
            state[
                InfoOutput
            ] += `\nEffect ${effect.name} was not applied to ${characterName}, because it is already applied.`;
            return "";
        }

    const effectCopy = { ...effect };
    if (overriddenDuration !== undefined && overriddenDuration > 0)
        effectCopy.durationLeft = overriddenDuration;
    else effectCopy.durationLeft = effectCopy.baseDuration;
    character.activeEffects.push(effectCopy);
    return `\n${characterName} is now under influence of ${effect.name}.`;
};

export const RemoveEffect = (
    characterName: string,
    effectName: string
): string => {
    const character: Character = state.characters[characterName];
    if (!character.activeEffects) {
        character.activeEffects = [];
        return "";
    }

    const effect: Effect | undefined = character.activeEffects.find(
        (_effect) => _effect.name === effectName
    );
    if (effect === undefined) return "";

    character.activeEffects.splice(character.activeEffects.indexOf(effect), 1);
    return `\n${characterName} is no longer under influence of ${effect.name}.`;
};

export const RunEffect = (characterName: string, effect: Effect) => {
    const character = state.characters[characterName];
    for (const modifier in effect.modifiers) {
        if (modifier === "hp" || modifier === "experience") {
            character[modifier] += effect.modifiers[modifier];
        } else {
            character.stats[modifier].level += effect.modifiers[modifier];

            if (levellingToOblivion) {
                character.stats[modifier].expToNextLvl = experienceCalculation(
                    character.stats[modifier].level
                );

                while (
                    character.stats[modifier].expToNextLvl ??
                    Infinity <= character.stats[modifier].level
                )
                    character.stats[modifier].expToNextLvl =
                        experienceCalculation(
                            ++character.stats[modifier].level
                        );
            }
        }
        state[InfoOutput] += `\n${characterName} ${
            effect.modifiers[modifier] < 0 ? "lost" : "gained"
        } ${Math.abs(effect.modifiers[modifier])} ${modifier}, currently has ${
            modifier === "hp" || modifier === "experience"
                ? character[modifier]
                : character.stats[modifier].level
        }.`;
    }
    state[
        InfoOutput
    ] += `\nDuration left of effect ${effect.name} on ${characterName}: ${effect.durationLeft}.`;
};
