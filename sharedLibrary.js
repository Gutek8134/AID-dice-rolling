//!Function for calculating damage. Adjust it to your heart's content.
//!Just make sure it won't divide by 0 (finally putting all the hours spent on learning math in high school to good use).
const damage = (attackStat, defenseStat) => {
    let dam =
        /*You can edit from here*/ attackStat +
        (0, diceRoll)(20) -
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

const dodge = (attackStat, dodgeStat) => {
    if (disableDodge) return false;
    let dodged =
        /*You can edit from here*/
        attackStat + (0, diceRoll)(5) < dodgeStat + (0, diceRoll)(5);
    /*to here*/
    //attackStat means attacker's statistic picked on calling !attack()
    //dodgeStat is accordingly, defender's statistic used for dodge
    //diceRoll(n) rolls an n-sided dice with values from 1 to n
    //Use only natural numbers, as the script will break otherwise
    //You must write an equal (a == b) [yes, you have to use two "=" signs for it], more than (a > b), less than (a < b), more or equal to (a >= b), or less or equal to (a <= b) expression
    return dodged;
};

//!Function for calculating experience needed to level up. Adjust it to your heart's content
const experienceCalculation = (level) => {
    //level is the current character/stat's level
    const experience = /*You can edit from here*/ 2 * level; /*to here*/
    return experience;
};

//Blank character with starting level stats
class Character {
    constructor(initialStats = [], initialItemNames = []) {
        this.stats = {};
        //Initializes every previously created stat
        state.stats.forEach((stat) => {
            this.stats[stat] = new Stat(stat, state.startingLevel);
        });
        //Initializes hp and character level
        this.hp = state.startingHP;
        this.level = 1;
        //Null check, just to be sure
        if (initialStats !== undefined && initialStats.length > 0) {
            //el in format ["attribute/stat", value], because I didn't like converting array to object
            //Sanitized beforehand
            for (const [name, value] of initialStats) {
                //Hp and level need to be double checked to not make a stat of them
                if ((0, ElementInArray)(name, restrictedStatNames)) {
                    this[name] = value;
                    continue;
                }
                //It's not hp, level, nor item, so it might as well be a stat
                else this.stats[name] = new Stat(name, value);
            }
        }
        this.items = {};
        // console.log("Items:", items);
        if (
            initialItemNames &&
            initialItemNames[0] !== "" &&
            initialItemNames.length > 0
        ) {
            for (let name of initialItemNames) {
                // console.log("item:", el);
                if (name[0] === "$") name = name.substring(1);
                const item = state.items[name];
                this.items[item.slot] = item;
            }
        }
        //No overrides for these starting values
        this.experience = 0;
        this.expToNextLvl = (0, experienceCalculation)(this.level);
        this.skillpoints = 0;
        this.type = "character";
        this.isNpc = false;
    }
    toString() {
        return (0, CharacterToString)(this);
    }
}
class NPC extends Character {
    constructor(initialStats = [], initialItemNames = []) {
        super(initialStats, initialItemNames);
        this.isNpc = true;
    }
}

class Item {
    constructor(name, values) {
        //slot - string representing slot name
        this.slot = "artifact";
        this.effects = [];
        this.modifiers = {};
        if (values !== undefined) {
            //el in format ["slot/stat", "equipmentPart"/statObj]
            //Sanitized beforehand
            for (const [name, value] of values) {
                //Slot and effects are strings, everything else must be a number
                //Until buffs and debuffs will be extended to items
                if (name === "slot") {
                    this.slot = String(value);
                    continue;
                }
                if (name === "effect") {
                    this.effects.push(String(value));
                    continue;
                }
                //It's not slot name nor effect, so it's a stat modifier
                this.modifiers[name] = Number(value);
            }
        }
        this.name = name;
        //Since you can't save object type to JSON, this has to do (just in case)
        this.type = "item";
    }
}

class Stat {
    constructor(name, level) {
        if (!(0, isInStats)(name)) {
            state.stats.push(name);
        }
        this.level =
            level !== null && level !== void 0 ? level : state.startingLevel;
        if (levellingToOblivion) {
            this.experience = 0;
            this.expToNextLvl = (0, experienceCalculation)(this.level);
        }
        this.type = "stat";
    }
    toString() {
        return levellingToOblivion || !(this.expToNextLvl && this.experience)
            ? String(this.level)
            : `level = ${this.level} exp = ${this.experience} exp to lvl up=${
                  this.expToNextLvl
              }(${this.expToNextLvl - this.experience})`;
    }
}

const isInStats = (name) => {
    return state.stats.indexOf(name) > -1;
};
/**Generates a value between 1 and maxValue*/
const diceRoll = (maxValue) => {
    if (overrideRollOutcome) return overrideValue;
    return Math.floor(Math.random() * maxValue) + 1;
};
/**Equips item for a character and removes it from state.inventory*/
const _equip = (characterName, item, modifiedText) => {
    //Grabs character
    const character = state.characters[characterName];
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
    if ((0, ElementInArray)(item.name, state.inventory))
        state.inventory.splice(state.inventory.indexOf(item.name), 1);
    return modifiedText;
};
const CharacterToString = (character) => {
    let temp = levellingToOblivion
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
        const value = character.stats[key];
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
            const item = character.items[el];
            temp += `\n${(0, ItemToString)(item)},\n`;
        }
    else temp += "\nnone  ";
    return temp.substring(0, temp.length - 2) == ""
        ? "none"
        : temp.substring(0, temp.length - 2);
};
const ItemToString = (item) => {
    if (!item) return "none";
    let temp = `${item.name}:\nslot: ${item.slot}\n`;
    for (const key of Object.keys(item.modifiers))
        temp += `${key}: ${item.modifiers[key]}\n`;
    return temp.substring(0, temp.length - 1);
};
//Returns whether character exists and has more than 0 HP
const CharLives = (character) => {
    if (!(0, ElementInArray)(character, Object.keys(state.characters)))
        return false;
    return state.characters[character].hp > 0;
};
const ElementInArray = (element, array) => {
    return array.indexOf(element) > -1;
};
//Debug purposes only
let disableDodge = false;
let overrideRollOutcome = false;
let overrideValue;
const SetDisableDodge = (newValue) => {
    disableDodge = newValue;
};
const SetFixedRollOutcome = (shouldOverride, newValue) => {
    if (shouldOverride && newValue) {
        overrideRollOutcome = true;
        overrideValue = newValue;
    } else if (!shouldOverride) {
        overrideRollOutcome = false;
    }
};
