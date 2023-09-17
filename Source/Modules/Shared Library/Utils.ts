import { state } from "../proxy_state";
import { Character } from "./Character";
import { Item } from "./Item";
import { levellingToOblivion } from "../Input Modifier/constants";
import { Stat } from "./Stat";
import { Effect } from "./Effect";

//!Function for calculating damage. Adjust it to your heart's content.
//!Just make sure it won't divide by 0 (finally putting all the hours spent on learning math in high school to good use).
export const damage = (attackStat: number, defenseStat: number): number => {
    let dam =
        /*You can edit from here*/ attackStat +
        diceRoll(20) -
        defenseStat; /*to here*/

    //attackStat means attacker's statistic picked on calling !attack()
    //defenseStat is, accordingly, defender's stat
    //diceRoll(n) rolls an n-sided dice with values from 1 to n
    //Use only natural numbers, as the script will break otherwise

    //Other example
    //let dam = (attackStat / defenseStat) * diceRoll(20);
    //Where "*" means multiplication and "/" means division

    //Raising to the power can be done using number1 ** number2
    //Where number1 is base and number2 is exponential

    //If damage is less than 0, this line will set it to 0
    if (dam < 0) dam = 0;
    return dam;
};

export let dodge = (attackStat: number, dodgeStat: number): boolean => {
    if (disableDodge) return false;
    let dodged =
        /*You can edit from here*/
        attackStat + diceRoll(5) < dodgeStat + diceRoll(5);
    /*to here*/

    //attackStat means attacker's statistic picked on calling !attack()
    //dodgeStat is accordingly, defender's statistic used for dodge
    //diceRoll(n) rolls an n-sided dice with values from 1 to n
    //Use only natural numbers, as the script will break otherwise

    //You must write an equal (a == b) [yes, you have to use two "=" signs for it], more than (a > b), less than (a < b), more or equal to (a >= b), or less or equal to (a <= b) expression

    return dodged;
};

//!Function for calculating experience needed to level up. Adjust it to your heart's content
export const experienceCalculation = (level: number): number => {
    //level is the current character/stat's level
    const experience = /*You can edit from here*/ 2 * level; /*to here*/

    return experience;
};

export const isInStats = (name: string): boolean => {
    return state.stats.indexOf(name) > -1;
};

/**Generates a value between 1 and maxValue*/
export const diceRoll = (maxValue: number): number => {
    if (overrideRollOutcome) return overrideValue;

    return Math.floor(Math.random() * maxValue) + 1;
};

/**Equips item for a character and removes it from state.inventory*/
export const _equip = (
    characterName: string,
    item: Item,
    modifiedText: string
): string => {
    //Grabs character
    const character: Character = state.characters[characterName];

    //If character has an already equipped item, it is put back into inventory
    if (character.items[item.slot]) {
        modifiedText += `\nCharacter ${characterName} unequipped ${
            character.items[item.slot].name
        }.`;
        state.inventory.push(character.items[item.slot].name);
    }
    //Puts the item onto character's slot and removes them from inventory
    character.items[item.slot] = item;
    modifiedText += `\nCharacter ${characterName} equipped ${item.name}.`;
    if (ElementInArray(item.name, state.inventory))
        state.inventory.splice(state.inventory.indexOf(item.name), 1);
    return modifiedText;
};

export const CharacterToString = (character: Character): string => {
    let temp: string = levellingToOblivion
        ? `hp: ${character.hp},
isNPC: ${character.isNpc},\n`
        : `hp: ${character.hp},
level: ${character.level},
skillpoints: ${character.skillpoints},
experience: ${character.experience},
to level up: ${character.expToNextLvl}(need ${
              character.expToNextLvl - character.experience
          } more),
isNPC: ${character.isNpc},\n`;

    for (const key in character.stats) {
        const value: Stat = character.stats[key];

        if (
            levellingToOblivion &&
            value.expToNextLvl !== undefined &&
            value.experience !== undefined
        ) {
            temp += `${key}: level=${value.level}, exp=${
                value.experience
            }, to lvl up=${value.expToNextLvl}(need ${
                value.expToNextLvl - value.experience
            } more),\n`;
        } else {
            temp += `${key}: ${value.level},\n`;
        }
    }

    temp += "\nItems:";
    if (Object.keys(character.items).length > 0)
        for (const el of Object.keys(character.items)) {
            const item: Item = character.items[el];
            temp += `\n${ItemToString(item)},\n`;
        }
    else temp += "\nnone  ";

    if (!character.activeEffects) character.activeEffects = [];

    temp += "\nApplied effects:";
    if (character.activeEffects.length > 0)
        for (const el of character.activeEffects) {
            temp += `\n${EffectToString(el)},\n`;
        }
    else temp += "\nnone  ";

    return temp.substring(0, temp.length - 2) == ""
        ? "none"
        : temp.substring(0, temp.length - 2);
};

export const ItemToString = (item: Item): string => {
    if (!item) return "none";

    let temp = `${item.name}:\nslot: ${item.slot}\n`;
    for (const key of Object.keys(item.modifiers))
        temp += `${key}: ${item.modifiers[key]}\n`;

    return temp.substring(0, temp.length - 1);
};

export const EffectToString = (effect: Effect): string => {
    if (!effect) return "none";
    let temp = `${effect.name}:
duration: ${effect.durationLeft} (base ${effect.baseDuration}),
unique per entity: ${effect.applyUnique},
applied when: ${effect.appliedOn},
applied to: ${effect.appliedTo}
`;

    for (const key of Object.keys(effect.modifiers))
        temp += `${key}: ${effect.modifiers[key]}\n`;

    return temp;
};

//Returns whether character exists and has more than 0 HP
export const CharLives = (character: string): boolean => {
    if (!ElementInArray(character, Object.keys(state.characters))) return false;

    return state.characters[character].hp > 0;
};

export const ElementInArray = (element: any, array: any[]): boolean => {
    return array.indexOf(element) > -1;
};

//Debug purposes only
let disableDodge = false;
let overrideRollOutcome = false;
let overrideValue: number;

export const SetDisableDodge = (newValue: boolean) => {
    disableDodge = newValue;
};

export const SetFixedRollOutcome = (
    shouldOverride: boolean,
    newValue?: number
) => {
    if (shouldOverride && newValue) {
        overrideRollOutcome = true;
        overrideValue = newValue;
    } else if (!shouldOverride) {
        overrideRollOutcome = false;
    }
};
