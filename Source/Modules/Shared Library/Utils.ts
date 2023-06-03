import { state } from "../Tests/proxy_state";
import { Character } from "./Character";
import { Item } from "./Item";
import { levellingToOblivion } from "../Input Modifier/constants";
let modifiedText: string = "";

//!Function for calculating damage. Adjust it to your heart's content.
//!Just make sure it won't divide by 0 (finally putting all the hours spent on learning math in high school to good use).
export const damage = (attackStat: number, defenseStat: number) => {
    let dam =
        /*You can edit from here*/ attackStat +
        diceRoll(20) -
        defenseStat; /*to here*/

    //attackStat means attacker's statistic picked on calling !attack()
    //defenseStat is, accordingly, defender's stat
    //diceRoll(n) rolls an n-sided dice with values from 1 to n
    //Use only natural numbers, as the script will break otherwise

    //Other example
    //const dam = (attackStat / defenseStat) * diceRoll(20);
    //Where "*" means multiplication and "/" means division

    //Raising to the power can be done using number1 ** number2
    //Where number1 is base and number2 is exponential

    //If damage is less than 0, this line will set it to 0
    if (dam < 0) dam = 0;
    return dam;
};

export const dodge = (attackStat: number, dodgeStat: number) => {
    let dodged =
        /*You can edit from here*/ attackStat + diceRoll(5) <
        dodgeStat + diceRoll(5); /*to here*/

    //attackStat means attacker's statistic picked on calling !attack()
    //dodgeStat is accordingly, defender's statistic used for dodge
    //diceRoll(n) rolls an n-sided dice with values from 1 to n
    //Use only natural numbers, as the script will break otherwise

    //You must write an equal (a == b) [yes, you have to use two "=" signs for it], more than (a > b), less than (a < b), more or equal to (a >= b), or less or equal to (a <= b) expression

    return dodged;
};

//!Function for calculating experience needed to level up. Adjust it to your heart's content
export const experienceCalculation = (level: number) => {
    //Don't change it here, but in the shared library
    //level is the current character/stat's level
    const experience = /*You can edit from here*/ 2 * level; /*to here*/

    return experience;
};

export const isInStats = (name: string) => {
    for (let i in state.stats) {
        if (name == state.stats[i]) {
            return true;
        }
    }
    return false;
};

//Generates a value between 1 and maxValue
export const diceRoll = (maxValue: number) => {
    return Math.floor(Math.random() * maxValue) + 1;
};

//Equips item for a character
export const _equip = (char: string, item: Item) => {
    //Grabs character
    const character = state.characters[char];
    //If character has an already equipped item, it is put back into inventory
    if (character.items[item.slot]) {
        modifiedText += `\nCharacter ${char} unequipped ${
            character.items[item.slot]
        }.`;
        state.inventory.push(character.items[item.slot].name);
    }
    //Puts the item onto character's slot and removes them from inventory
    character.items[item.slot] = item;
    modifiedText += `\nCharacter ${char} equipped ${item.name}.`;
    state.inventory.splice(state.inventory.indexOf(item.name), 1);
};

export const ignoredValues = [
    "hp",
    "level",
    "experience",
    "expToNextLvl",
    "skillpoints",
    "isNpc",
    "items",
    "type",
];
export const CharToString = (character: Character) => {
    let temp = levellingToOblivion
        ? `hp: ${character.hp},
isNPC: ${character.isNpc},\n`
        : `hp: ${character.hp},
level: ${character.level},
skillpoints:${character.skillpoints},
experience: ${character.experience}
to level up: ${character.expToNextLvl}(need ${
              character.expToNextLvl - character.experience
          } more),
isNpc: ${character.isNpc},\n`;
    for (const key in character) {
        if (key === "hp" || ElementInArray(key, ignoredValues)) {
            continue;
        }

        const value = character.stats[key];
        if (levellingToOblivion) {
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
        for (let el of Object.keys(character.items)) {
            const item: Item = character.items[el];
            temp += `\n${ItemToString(item)},\n`;
        }
    else temp += "\nnone  ";
    return temp.substring(0, temp.length - 2) == ""
        ? "none"
        : temp.substring(0, temp.length - 2);
};

export const ItemToString = (item: Item) => {
    if (!item) return "none";

    let temp = `${item.name}:\nslot: ${item.slot}\n`;
    for (const key of Object.keys(item.modifiers))
        temp += `${key}: ${item.modifiers[key]},\n`;

    return temp.substring(0, temp.length - 2);
};

//Returns whether character exists and has more than 0 HP, returns bool
export const CharLives = (character: string) => {
    if (!ElementInArray(character, Object.keys(state.characters))) return false;

    return state.characters[character].hp > 0;
};

export const ElementInArray = (element: any, array: any[]) => {
    let ret = false;
    for (const el of array) {
        if (el === element) {
            ret = true;
            break;
        }
    }
    return ret;
};
