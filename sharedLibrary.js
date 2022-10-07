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
            (typeof level === "number" || typeof level === "undefined")
        ) {
            if (!isInStats(name)) {
                state.stats.push(name);
            }
            this.level = level === undefined ? state.startingLevel : level;
            if (levellingToOblivion) {
                this.experience = 0;
                this.expToNextLvl = experienceCalculation(this.level);
            }
        }
    }
    toString() {
        return `level = ${this.level} exp = ${this.experience} exp to lvl up=${
            this.expToNextLvl
        }(${this.expToNextLvl - this.experience})`;
    }
}

//Blank character with starting level stats
class Character {
    constructor(values) {
        state.stats.forEach((stat) => {
            this[stat] = new Stat(stat, state.startingLevel);
        });
        this.hp = state.startingHP;
        this.level = 1;

        if (values !== undefined) {
            for (const el of values) {
                if (el[0] === "hp") {
                    this.hp = el[1];
                    continue;
                }
                if (el[0] === "level") {
                    this.level = el[1];
                    continue;
                }
                this[el[0]] = new Stat(el[0], el[1]);
            }
        }
        this.experience = 0;
        this.expToNextLvl = experienceCalculation(this.level);
        this.skillpoints = 0;
        this.isNpc = false;
    }

    toString() {
        return CharToString(this);
    }
}

class NPC {
    constructor(values) {
        state.stats.forEach((stat) => {
            this[stat] = new Stat(stat, state.startingLevel);
        });
        this.hp = state.startingHP;
        this.level = 1;

        if (values !== undefined) {
            for (const el of values) {
                if (el[0] === "hp") {
                    this.hp = el[1];
                    continue;
                }
                if (el[0] === "level") {
                    this.level = el[1];
                    continue;
                }
                this[el[0]] = new Stat(el[0], el[1]);
            }
        }
        this.experience = 0;
        this.expToNextLvl = experienceCalculation(this.level);
        this.skillpoints = 0;
        this.isNpc = true;
    }

    toString() {
        return CharToString(this);
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

const ignoredValues = [
    "hp",
    "level",
    "experience",
    "expToNextLvl",
    "skillpoints",
    "isNpc",
];
const CharToString = (character) => {
    let temp = levellingToOblivion
        ? `hp: ${character.hp},\nisNPC: ${character.isNpc},\n`
        : `hp: ${character.hp},\nlevel: ${character.level},\nskillpoints:${
              character.skillpoints
          },\nexperience: ${character.experience},\nto level up: ${
              character.expToNextLvl
          }(need ${
              character.expToNextLvl - character.experience
          } more),\nisNpc: ${character.isNpc},\n`;
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
    return temp.substring(0, temp.length - 2) == ""
        ? "none"
        : temp.substring(0, temp.length - 2);
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
