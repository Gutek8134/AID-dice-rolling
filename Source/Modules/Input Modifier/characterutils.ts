import { state } from "../Tests/proxy_state";
import { Character } from "../Shared Library/Character";
import { Item } from "../Shared Library/Item";
import { experienceCalculation } from "../Shared Library/Utils";

export const BestStat = (character: Character): string => {
    let bestStat: string = "",
        bestStatValue = -1;

    for (const stat of Object.keys(character.stats)) {
        if (GetStatWithMods(character, stat) > bestStatValue) bestStat = stat;
    }

    return bestStat || state.stats[0];
};

export const GetStatWithMods = (character: Character, stat: string): number => {
    if (!character || !stat) return 0;

    let itemModifiersSum: number = 0;

    for (const itemName of Object.keys(character.items)) {
        const item: Item = character.items[itemName];
        if (item.modifiers[stat]) itemModifiersSum += item.modifiers[stat];
    }

    return character.stats[stat].level + itemModifiersSum;
};

export const IncrementExp = (
    characterName: Character,
    statName: string
): void => {};

const IncrementExpOnCharacter = (character: Character): void => {};

const IncrementExpOnStat = (characterName: string, statName: string) => {
    const character: Character = state.characters[characterName];
    //Increases experience by 1 and checks whether it's enough to level the stat up
    if (
        ++character.stats[statName].experience >=
        character.stats[statName].expToNextLvl
    ) {
        //If it is, experience is set to 0,
        character.stats[statName].experience = 0;
        //level increased and expToNextLevel re-calculated
        character.stats[statName].expToNextLvl = experienceCalculation(
            ++character.stats[statName].level
        );
        state.out += ` ${characterName}'s ${statName} has levelled up to level ${character.stats[statName].level}!`;
    }
};
