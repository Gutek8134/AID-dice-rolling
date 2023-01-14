//!Function for calculating experience needed to level up. Adjust it to your heart's content
const experienceCalculation = (level) => {
    //Don't change it here, but in the shared library
    //level is the current character/stat's level
    const experience = /*You can edit from here*/ 2 * level; /*to here*/

    return experience;
};

//Increasing scalability by OOP
class Stat {
    constructor(name, level) {
        if (
            typeof name === "string" &&
            (typeof level === "number" || level === undefined)
        ) {
            if (!isInStats(name)) {
                state.stats.push(name);
            }
            this.level = level === undefined ? state.startingLevel : level;
            if (levellingToOblivion) {
                this.experience = 0;
                this.expToNextLvl = experienceCalculation(this.level);
            }
            this.type = "stat";
        }
    }
    toString() {
        return `level = ${this.level} exp = ${this.experience} exp to lvl up=${
            this.expToNextLvl
        }(${this.expToNextLvl - this.experience})`;
    }
}

CharacterConstructor = (_this, values, items) => {
    //Initializes every previously created stat
    state.stats.forEach((stat) => {
        _this[stat] = new Stat(stat, state.startingLevel);
    });

    //Initializes hp and character level
    _this.hp = state.startingHP;
    _this.level = 1;

    //Null check, just to be sure
    if (values !== undefined) {
        //el in format ["attribute/stat", value], because I didn't like converting array to object
        //Sanitized beforehand
        for (const el of values) {
            //Hp and level need to be double checked to not make a stat of them
            if (el[0] === "hp") {
                _this.hp = el[1];
                continue;
            }
            if (el[0] === "level") {
                _this.level = el[1];
                continue;
            }
            //It's not hp, level, nor item, so it might as well be a stat
            _this[el[0]] = new Stat(el[0], el[1]);
        }
    }

    _this.items = {};

    // console.log("Items:", items);
    if (items[0] !== "") {
        //el is item name
        for (let el of items) {
            // console.log("item:", el);
            el = state.items[el.substring(1)];
            _this.items[el.slot] = el;
        }
    }

    //No overrides for these starting values
    _this.experience = 0;
    _this.expToNextLvl = experienceCalculation(_this.level);
    _this.skillpoints = 0;
    _this.type = "character";
};

//Blank character with starting level stats
class Character {
    constructor(values, items) {
        CharacterConstructor(this, values, items);
        this.isNpc = false;
    }

    toString() {
        return CharToString(this);
    }
}

class NPC {
    constructor(values, items) {
        CharacterConstructor(this, values, items);
        this.isNpc = true;
    }

    toString() {
        return CharToString(this);
    }
}

class Item {
    //Item structure:
    //Fields:
    //slot - string representing slot name
    //effects - array of strings representing effect names
    //modifiers - numbers representing stat modifiers
    //type="item" - JSON doesn't hold types, so it's here just in case
    constructor(name, values) {
        this.effects = [];

        this.modifiers = {};

        if (values !== undefined) {
            //el in format ["slot/stat", "equipmentPart"/statObj]
            //Sanitized beforehand
            for (const el of values) {
                //Slot and effects are strings, everything else must be a number
                //Until buffs and debuffs will be extended to items
                if (el[0] === "slot") {
                    this.slot = el[1];
                    continue;
                }
                if (el[0] === "effect") {
                    this.effects.push(el[1]);
                }
                //It's not slot name nor effect, so it's a stat modifier
                this.modifiers[el[0]] = el[1];
            }
        }

        this.name = name;

        //Since you can't save object type to JSON, this has to do (just in case)
        this.type = "item";
    }
}

const isInStats = (name) => {
    for (i in state.stats) {
        if (name == state.stats[i]) {
            return true;
        }
    }
    return false;
};

//Generates a value between 1 and maxValue
const diceRoll = (maxValue) => {
    return Math.floor(Math.random() * maxValue) + 1;
};

//Equips item for a character
const _equip = (char, item) => {
    //Grabs character
    const character = state.characters[char];
    //If character has an already equipped item, it is put back into inventory
    if (character.items[item.slot]) {
        modifiedText += `\nCharacter ${char} unequipped ${
            character.items[item.slot]
        }.`;
        state.inventory.push(character[item.slot].name);
    }
    //Puts the item onto character's slot and removes them from inventory
    character.items[item.slot] = item;
    modifiedText += `\nCharacter ${char} equipped ${item.name}.`;
    state.inventory.splice(state.inventory.indexOf(item.name), 1);
};

const ignoredValues = [
    "hp",
    "level",
    "experience",
    "expToNextLvl",
    "skillpoints",
    "isNpc",
    "items",
    "type",
];
const CharToString = (character) => {
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

        const value = character[key];
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
            el = character.items[el];
            temp += `\n${ItemToString(el)},\n`;
        }
    else temp += "\nnone  ";
    return temp.substring(0, temp.length - 2) == ""
        ? "none"
        : temp.substring(0, temp.length - 2);
};

const ItemToString = (item) => {
    if (!item) return "none";

    temp = `${item.name}:\nslot: ${item.slot}\n`;
    for (const key of Object.keys(item.modifiers))
        temp += `${key}: ${item.modifiers[key]},\n`;

    return temp.substring(0, temp.length - 2);
};

//Returns whether character exists and has more than 0 HP, returns bool
const CharLives = (character) => {
    if (!ElementInArray(character, Object.keys(state.characters))) return false;

    return state.characters[character].hp > 0;
};

const ElementInArray = (element, array) => {
    ret = false;
    if (element !== undefined && typeof array === "object") {
        for (const el of array) {
            if (el === element) {
                ret = true;
                break;
            }
        }
    }
    return ret;
};
