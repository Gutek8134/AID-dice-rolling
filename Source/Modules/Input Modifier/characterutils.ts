import { state } from "../proxy_state";
import { Character } from "../Shared Library/Character";
import { Item } from "../Shared Library/Item";
import { experienceCalculation } from "../Shared Library/Utils";
import { levellingToOblivion } from "./constants";
import { Stat } from "../Shared Library/Stat";

export const BestStat = (character: Character): string => {
    let bestStat: string = "",
        bestStatValue: number = -Infinity;

    for (const stat of Object.keys(character.stats)) {
        if (GetStatWithMods(character, stat) > bestStatValue) {
            bestStat = stat;
            bestStatValue = GetStatWithMods(character, stat);
        }
    }

    return bestStat || state.stats[0] || "strength";
};

export const GetStatWithMods = (character: Character, stat: string): number => {
    if (!character || !stat || character.stats[stat] === undefined) return 0;
    if (!character.activeEffects) character.activeEffects = [];

    let effectModifiersSum: number = 0;

    for (const effect of character.activeEffects) {
        if (effect.modifiers[stat] && effect.impact === "continuous")
            effectModifiersSum += effect.modifiers[stat];
    }

    let itemModifiersSum: number = 0;

    for (const itemName of Object.keys(character.items)) {
        const item: Item = character.items[itemName];
        if (item.modifiers[stat]) itemModifiersSum += item.modifiers[stat];
    }

    return character.stats[stat].level + itemModifiersSum + effectModifiersSum;
};

export const IncrementExp = (
    characterName: string,
    statName: string
): string => {
    if (state.characters[characterName].isNpc) return "";

    if (levellingToOblivion) {
        return IncrementExpOnStat(characterName, statName);
    } else {
        return IncrementExpOnCharacter(characterName);
    }
};

const IncrementExpOnCharacter = (characterName: string): string => {
    const character: Character = state.characters[characterName];
    //Increases experience by 1 and checks whether it's enough to level the character up
    if (++character.experience >= character.expToNextLvl) {
        //If it is, experience is set to 0,
        character.experience = 0;
        //level increased and expToNextLevel re-calculated
        character.expToNextLvl = experienceCalculation(++character.level);
        //In the case of attackingCharacter levelling up, it also gains free skillpoints
        character.skillpoints += state.skillpointsOnLevelUp;
        return `\n${characterName} has levelled up to level ${character.level} (free skillpoints: ${character.skillpoints})!`;
    }
    return "";
};

const IncrementExpOnStat = (
    characterName: string,
    statName: string
): string => {
    const character: Character = state.characters[characterName];

    const stat: Stat = character.stats[statName];
    if (stat.experience === undefined || stat.expToNextLvl === undefined) {
        return "";
    }

    //Increases experience by 1 and checks whether it's enough to level the stat up
    if (++stat.experience >= stat.expToNextLvl) {
        //If it is, experience is set to 0,
        stat.experience = 0;
        //level increased and expToNextLevel re-calculated
        stat.expToNextLvl = experienceCalculation(++stat.level);
        return `\n${characterName}'s ${statName} has levelled up to level ${stat.level}!`;
    }
    return "";
};
