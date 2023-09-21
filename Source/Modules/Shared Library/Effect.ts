import { state } from "../proxy_state";
import { Character } from "./Character";
import { ElementInArray, experienceCalculation } from "./Utils";
import { GetStatWithMods } from "../Input Modifier/characterutils";
import { levellingToOblivion } from "../Input Modifier/constants";

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
            state.message += `Effect ${effect.name} was not applied to ${characterName}, because it is already applied.`;
            return "";
        }

    const effectCopy = { ...effect };
    if (overriddenDuration !== undefined && overriddenDuration > 0)
        effectCopy.durationLeft = overriddenDuration;
    character.activeEffects.push(effectCopy);
    return `\n${characterName} now is under influence of ${effect.name}.`;
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
    return `\n${characterName} no longer is under influence of ${effect.name}.`;
};

export const RunEffect = (characterName: string, effect: Effect) => {
    const character = state.characters[characterName];
    for (const modifier in effect.modifiers) {
        if (modifier === "hp" || modifier === "experience") {
            character[modifier] -= effect.modifiers[modifier];
        } else {
            character.stats[modifier].level -= effect.modifiers[modifier];

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
        state.message += `\n${characterName} lost ${effect.modifiers[modifier]} ${modifier}. Duration left: ${effect.durationLeft}.`;
    }
};
