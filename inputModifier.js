// Input modifier
//!Function for calculating damage. Adjust it to your heart's content.
//!Just make sure it won't divide by 0 (finally putting all the hours spent on learning math in high school to good use).
const damage = (attackStat, defenseStat) => {
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

const dodge = (attackStat, dodgeStat) => {
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

//You can edit this list to edit what will be displayed when dealing x damage.
//Format is [minimum damage, "displayed message"].
//Note that it is used in sentence like
//Miguel attacked Zuibroldun Jodem dealing {value from here} (x).
const damageOutputs = [
    [1, "light damage"],
    [15, "medium damage"],
    [30, "significant damage"],
    [60, "heavy damage"],
    [100, "a killing blow"],
];

//Contains every type of equipment you can wear and have
const equipmentParts = ["helmet", "armor", "leggins", "weapon", "artifact"];

//!Does not check whether stats are equal to 0 when attacking. Change only if your damage function does not contain division or you've checked it properly.
const ignoreZeroDiv = false;

//!Sets whether dead characters should be punished upon skillchecking
const shouldPunish = true;

//!If set to true, !attack will work as !sAttack and vice versa
const defaultDodge = false;

//!Switches between levelling each stat separately (true) and levelling character then distributing free points (false)
const levellingToOblivion = false;

//!Should defending character also gain XP when !attack is used?
const defendingCharacterLevels = false;

//!Turns on debug code
const DEBUG = false;

//!Executes automated tests before enabling CLI
const TESTS = true;

//!Turns on CLI when testing as stand-alone
const CLI = false;

//Comment this if statement when debugging. End at line 272.
if (DEBUG) {
    //Dummy state
    let state = {
        stats: [],
        dice: 20,
        startingLevel: 1,
        startingHP: 100,
        characters: {},
        punishment: 5,
        skillpointsOnLevelUp: 5,
        items: {},
        inventory: [],
        ctxt: "",
        out: "",
        message: "",
        inBattle: false,
        side1: [],
        side2: [],
    };

    //!Since I cannot import shared library locally, I will copy everything here. Debug purposes only.

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
            return `level = ${this.level} exp = ${
                this.experience
            } exp to lvl up=${this.expToNextLvl}(${
                this.expToNextLvl - this.experience
            })`;
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
        if (!ElementInArray(character, Object.keys(state.characters)))
            return false;

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
    //!End of shared library

    //dummy character
    /*
state.characters.Miguel = new Character();
state.characters.Miguel.str = new Stat("str");
state.characters.Miguel.dex = new Stat("dex", 10);
state.characters.Miguel.int = new Stat("int", 5);*/
}

//Produces outcome from two-dimensional array in format [[minimum score, outcome],]
const CustomOutcome = (score, values) => {
    let i = 0;
    let out = "nothing happens.";

    while (score >= values[i][0]) {
        out = values[i++][1];
        if (values[i] === undefined) {
            break;
        }
    }
    return out;
};

const CustomDamageOutput = (dam, values) => {
    let i = 0;
    let out = "no damage";

    while (dam >= values[i][0]) {
        out = values[i++][1];
        if (values[i] === undefined) {
            break;
        }
    }
    return out;
};

//Produces a string of difficulties from an array
const CustomDifficulties = (values) => {
    let temp = "";
    values.forEach((element) => {
        temp += element[0] + ", ";
    });
    return temp.substring(0, temp.length - 1);
};

const SetupState = () => {
    if (state !== undefined && state !== null) {
        state.stats = state.stats === undefined ? [] : state.stats;
        state.dice = state.dice === undefined ? 20 : state.dice;
        state.startingLevel =
            state.startingLevel === undefined ? 1 : state.startingLevel;
        state.startingHP =
            state.startingHP === undefined ? 100 : state.startingHP;
        state.characters =
            state.characters === undefined ? {} : state.characters;
        state.items = state.items === undefined ? {} : state.items;
        state.inventory = state.inventory === undefined ? [] : state.inventory;
        state.punishment =
            state.punishment === undefined ? 5 : state.punishment;
        state.skillpointsOnLevelUp =
            state.skillpointsOnLevelUp === undefined
                ? 5
                : state.skillpointsOnLevelUp;
        state.inBattle = state.inBattle === undefined ? false : state.inBattle;
    }
};

//Purges the command from context
const CutCommandFromContext = () => {
    state.ctxt =
        state.ctxt !== ""
            ? state.ctxt.substring(0, currIndices[0]) +
              state.ctxt.substring(currIndices[1], state.ctxt.length)
            : modifiedText.substring(0, currIndices[0]) +
              modifiedText.substring(currIndices[1], modifiedText.length);
};

const BestStat = (character) => {
    const stats = {};

    for (let item of Object.keys(character.items)) {
        item = character.items[item];

        for (const mod of Object.keys(item.modifiers))
            stats[mod] += item.modifiers[mod];
    }

    for (const key of Object.keys(character)) {
        if (ElementInArray(key, ignoredValues)) continue;
        // console.log(key);
        stats[key] += character[key].level;
    }
    // console.log(stats);

    let bestStat;
    for (const el of Object.keys(stats))
        if (stats[el] > stats[bestStat] || stats[bestStat] === undefined)
            bestStat = el;

    return bestStat ?? state.stats[0];
};

//#region turn
const turn = () => {
    console.log("Active: ", state.active);
    if (
        !state.attackingCharacter?.isNpc &&
        state.attackingCharacter !== undefined
    ) {
        const exp =
            /(?:(?<escape>retreat|escape|exit)|(?:\((?<attackStat>[\w ']+), *)?(?<defendingCharacter>[\w\s']+)(?:, *(?<defenseStat>[\w ']+))?\))/i;
        const match = textCopy.match(exp);
        if (match === null) {
            state.message =
                "Battle turn: In battle you can only retreat or attack.\nFor further information read !battle section of README.";
            return;
        }
        if (match.groups.escape) {
            state.out += "\nParty retreated from the fight.";
            state.inBattle = false;
            delete state.attackingCharacter;
            return;
        }
        const temp = Number(state.currentSide.substring(4)) + 1;
        const attacked = `side${temp >= 3 ? 1 : temp}`;
        const attChar = state.activeCharacterName;

        //You ALWAYS have to pick a target
        const defChar = match.groups.defendingCharacter;
        const defCharInd = state[attacked].findIndex((el) => el === defChar);

        //Grabs values or default for stats
        const attackStat =
            match.groups.attackStat || BestStat(state.attackingCharacter);
        const defenseStat =
            match.groups.defenseStat || BestStat(state.characters[defChar]);
        let defendingCharacter;
        if (!ElementInArray(defChar, state[attacked])) {
            state.message = `Battle turn: character ${defChar} doesn't belong to the other side of the battle.`;
            return;
        }
        defendingCharacter = state.characters[defChar];

        const attBonus = calcBonus(attChar, attackStat);
        const defBonus = calcBonus(defChar, defenseStat);
        let attCharStat =
            (state.attackingCharacter[attackStat] !== undefined
                ? state.attackingCharacter[attackStat].level
                : 0) + attBonus;
        let defCharStat =
            (defendingCharacter[defenseStat] !== undefined
                ? defendingCharacter[defenseStat].level
                : 0) + defBonus;
        //(Unless you are not ignoring zero division. In this case zeroes are changed to ones to avoid zero division error.)
        if (!ignoreZeroDiv) {
            attCharStat = attCharStat === 0 ? 1 : attCharStat;
            defCharStat = defCharStat === 0 ? 1 : defCharStat;
        }
        //Calculating damage
        const dam = damage(attCharStat, defCharStat);
        //Damaging
        state.characters[defChar].hp -= dam;

        //Gives the player necessary info.
        state.out += `\n${attChar} (${attackStat}: ${attCharStat}${
            attBonus === 0 ? "" : " (base: " + (attCharStat - attBonus) + ")"
        }) attacked ${defChar} (${defenseStat}: ${defCharStat}${
            defBonus === 0 ? "" : " (base: " + (defCharStat - defBonus) + ")"
        }) dealing ${CustomDamageOutput(dam, damageOutputs)} (${dam}).\n${
            state.characters[defChar].hp <= 0
                ? defChar +
                  (state.characters[defChar].isNpc ? " died." : " retreated.")
                : defChar + " now has " + state.characters[defChar].hp + "hp."
        }`;
        //#region levels
        //Checks whether to level up stats or characters
        if (levellingToOblivion) {
            //Increases experience by 1 and checks whether it's enough to level the stat up
            if (
                ++state.attackingCharacter[attackStat].experience >=
                state.attackingCharacter[attackStat].expToNextLvl
            ) {
                //If it is, experience is set to 0,
                state.attackingCharacter[attackStat].experience = 0;
                //level increased and expToNextLevel re-calculated
                state.attackingCharacter[attackStat].expToNextLvl =
                    experienceCalculation(
                        ++state.attackingCharacter[attackStat].level
                    );
                state.out += ` ${attChar}'s ${attackStat} has levelled up to level ${state.attackingCharacter[attackStat].level}!`;
            }
        } else {
            //Increases experience by 1 and checks whether it's enough to level the character up
            if (
                ++state.attackingCharacter.experience >=
                state.attackingCharacter.expToNextLvl
            ) {
                //If it is, experience is set to 0,
                state.attackingCharacter.experience = 0;
                //level increased and expToNextLevel re-calculated
                state.attackingCharacter.expToNextLvl = experienceCalculation(
                    ++state.attackingCharacter.level
                );
                //In the case of attackingCharacter levelling up, it also gains free skillpoints
                state.attackingCharacter.skillpoints +=
                    state.skillpointsOnLevelUp;
                state.out += ` ${attChar} has levelled up to level ${state.attackingCharacter.level} (free skillpoints: ${state.attackingCharacter.skillpoints})!`;
            }
        }
        if (defendingCharacterLevels && !defendingCharacter.isNpc) {
            //Checks whether to level up stats or characters
            if (levellingToOblivion) {
                //Increases experience by 1 and checks whether it's enough to level the stat up
                if (
                    ++defendingCharacter[defenseStat].experience >=
                    defendingCharacter[defenseStat].expToNextLvl
                ) {
                    //If it is, experience is set to 0,
                    defendingCharacter[defenseStat].experience = 0;
                    //level increased and expToNextLevel re-calculated
                    defendingCharacter[defenseStat].expToNextLvl =
                        experienceCalculation(
                            ++defendingCharacter[defenseStat].level
                        );
                    state.out += ` ${defChar}'s ${defenseStat} has levelled up to level ${defendingCharacter[defenseStat].level}!`;
                }
            } else {
                //Increases experience by 1 and checks whether it's enough to level the defendingCharacter up
                if (
                    ++defendingCharacter.experience >=
                    defendingCharacter.expToNextLvl
                ) {
                    //If it is, experience is set to 0,
                    defendingCharacter.experience = 0;
                    //level increased and expToNextLevel re-calculated
                    defendingCharacter.expToNextLvl = experienceCalculation(
                        ++defendingCharacter.level
                    );
                    //In the case of defendingCharacter levelling up, it also gains free skillpoints
                    defendingCharacter.skillpoints +=
                        state.skillpointsOnLevelUp;
                    state.out += ` ${defChar} has levelled up to level ${defendingCharacter.level} (free skillpoints: ${defendingCharacter.skillpoints})!`;
                }
            }
        }
        //#endregion levels
        if (state.characters[defChar]?.hp <= 0) {
            state.characters[defChar].hp = 0;
            //If character's hp falls below 0, they are removed from the battle
            state[attacked].splice(defCharInd, 1);
            //NPCs die when they are killed
            if (state.characters[defChar].isNpc)
                delete state.characters[defChar];
        }
        //Checks if the battle should end after every attack
        if (!state.side1?.length) {
            state.message =
                "HP of all party members dropped to 0. Party retreated.";
            state.out +=
                "\nThe adventurers retreated, overwhelmed by the enemy.";
            delete state.inBattle;
            delete state.attackingCharacter;
            return;
        } else if (!state.side2?.length) {
            state.message = "You have won the battle!";
            state.out += "\nThe adventurers have won the battle.";
            delete state.inBattle;
            delete state.attackingCharacter;
            return;
        }
        state.active.splice(state.attCharInd, 1);
        if (!state.active?.length) {
            const temp = Number(state.currentSide.substring(4)) + 1;
            state.currentSide = `side${temp >= 3 ? 1 : temp}`;
            state.active = [...state[state.currentSide]];
        }
        state.attCharInd = diceRoll(state.active.length) - 1;
        state.activeCharacterName = state.active[state.attCharInd];
        state.attackingCharacter = state.characters[state.activeCharacterName];
    }
    while (
        state.attackingCharacter?.isNpc ||
        state.attackingCharacter === undefined
    ) {
        if (!state.active?.length) {
            const temp = Number(state.currentSide.substring(4)) + 1;
            state.currentSide = `side${temp >= 3 ? 1 : temp}`;
            state.active = [...state[state.currentSide]];
        }
        state.attCharInd = diceRoll(state.active.length) - 1;
        const attChar = (state.activeCharacterName =
            state.active[state.attCharInd]);
        state.attackingCharacter = state.characters[attChar];
        //console.log(state.attackingCharacter);
        if (
            state.attackingCharacter === undefined ||
            !state.attackingCharacter?.isNpc
        ) {
            break;
        }
        const temp = Number(state.currentSide.substring(4)) + 1;
        const attacked = `side${temp >= 3 ? 1 : temp}`;
        const defCharInd = diceRoll(state[attacked].length) - 1;
        console.log(state[attacked], defCharInd);
        const defChar = state[attacked][defCharInd];
        const defendingCharacter = state.characters[defChar];
        const attackStat = BestStat(state.attackingCharacter);
        const defenseStat = BestStat(defendingCharacter);
        const attBonus = calcBonus(attChar, attackStat);
        const defBonus = calcBonus(defChar, defenseStat);
        const attCharStat =
            state.attackingCharacter[attackStat].level + attBonus;
        const defCharStat = defendingCharacter[defenseStat].level + defBonus;
        if (defaultDodge) {
            if (dodge(attCharStat, defCharStat)) {
                state.out += `\n${attChar}(${attackStat}: ${attCharStat}${
                    attBonus === 0
                        ? ""
                        : " (base: " + (attCharStat - attBonus) + ")"
                }) attacked ${defChar}(${defenseStat}: ${defCharStat}${
                    defBonus === 0
                        ? ""
                        : " (base: " + (defCharStat - defBonus) + ")"
                }), but missed.`;
                continue;
            }
        }
        //Calculating damage
        const dam = damage(attCharStat, defCharStat);
        //Damaging
        state.characters[defChar].hp -= dam;
        //Deactivating character
        state.active.splice(state.attCharInd, 1);
        //Gives the player necessary info.
        state.out += `\n${attChar} (${attackStat}: ${attCharStat}${
            attBonus === 0 ? "" : " (base: " + (attCharStat - attBonus) + ")"
        }) attacked ${defChar} (${defenseStat}: ${defCharStat}${
            defBonus === 0 ? "" : " (base: " + (defCharStat - defBonus) + ")"
        }) dealing ${CustomDamageOutput(dam, damageOutputs)} (${dam}).\n${
            state.characters[defChar].hp <= 0
                ? defChar +
                  (state.characters[defChar].isNpc ? " died." : " retreated.")
                : defChar + " now has " + state.characters[defChar].hp + "hp."
        }`;

        //#region  levels
        if (defendingCharacterLevels && !defendingCharacter.isNpc) {
            //Checks whether to level up stats or characters
            if (levellingToOblivion) {
                //Increases experience by 1 and checks whether it's enough to level the stat up
                if (
                    ++defendingCharacter[defenseStat].experience >=
                    defendingCharacter[defenseStat].expToNextLvl
                ) {
                    //If it is, experience is set to 0,
                    defendingCharacter[defenseStat].experience = 0;
                    //level increased and expToNextLevel re-calculated
                    defendingCharacter[defenseStat].expToNextLvl =
                        experienceCalculation(
                            ++defendingCharacter[defenseStat].level
                        );
                    state.out += ` ${defChar}'s ${defenseStat} has levelled up to level ${defendingCharacter[defenseStat].level}!`;
                }
            } else {
                //Increases experience by 1 and checks whether it's enough to level the defendingCharacter up
                if (
                    ++defendingCharacter.experience >=
                    defendingCharacter.expToNextLvl
                ) {
                    //If it is, experience is set to 0,
                    defendingCharacter.experience = 0;
                    //level increased and expToNextLevel re-calculated
                    defendingCharacter.expToNextLvl = experienceCalculation(
                        ++defendingCharacter.level
                    );
                    //In the case of defendingCharacter levelling up, it also gains free skillpoints
                    defendingCharacter.skillpoints +=
                        state.skillpointsOnLevelUp;
                    state.out += ` ${defChar} has levelled up to level ${defendingCharacter.level} (free skillpoints: ${defendingCharacter.skillpoints})!`;
                }
            }
        }
        //#endregion levels

        if (state.characters[defChar].hp <= 0) {
            state.characters[defChar].hp = 0;
            //If character's hp falls below 0, they are removed from the battle
            state[attacked].splice(defCharInd, 1);
            //NPCs die when they are killed
            if (state.characters[defChar].isNpc)
                delete state.characters[defChar];
        }
        //Checks if the battle should end after every attack
        if (!state.side1?.length) {
            state.message =
                "HP of all party members dropped to 0. Party retreated.";
            state.out +=
                "\nThe adventurers retreated, overwhelmed by the enemy.";
            delete state.inBattle;
            delete state.attackingCharacter;
            return;
        } else if (!state.side2?.length) {
            state.message = "You have won the battle!";
            state.out += "\nThe adventurers have won the battle.";
            delete state.inBattle;
            delete state.attackingCharacter;
            return;
        }
        if (!state.active?.length) {
            const temp = Number(state.currentSide.substring(4)) + 1;
            state.currentSide = `side${temp >= 3 ? 1 : temp}`;
            state.active = [...state[state.currentSide]];
        }
    }
    state.message = `Current turn: ${state.activeCharacterName}`;
    console.log("Active: ", state.active);
};
//#endregion turn

//#region bonus
//Calculates sum of item stat bonuses
const calcBonus = (char, stat) => {
    //Grabs character
    const character = state.characters[char];
    //Defaults to 0 - no bonus
    let mod = 0;
    //Iterates over character items
    //Then on each item modifiers
    //If one of them is corresponding to stat name, its value is added
    for (const el of Object.keys(character.items)) {
        const item = character.items[el];
        // console.log("bonus item: ", item);
        for (const e of Object.keys(item.modifiers)) {
            if (e === stat) mod += item.modifiers[e];
        }
    }
    return mod;
};
//#endregion bonus

//#region skillcheck
const skillcheck = (arguments) => {
    //Error checking
    if (arguments === undefined || arguments === null || arguments === "") {
        state.message = "No arguments found.";
        CutCommandFromContext();
        return;
    }

    //Checks for format stat, character, thresholds , outputs groups character and thresholds, that are matched later
    const exp = /(?<stat>[\w ']+), (?<character>[\w\s']+), (?<thresholds>.+)/i;

    //Checks for thresholds type
    const thresholdCheck =
        /(?<thresholdsC>\d+ *= *.+(?: *: *\d+ *= *.+)+)|(?<thresholds4>\d+ *: *\d+ *: *\d+ *: *\d+)|(?<thresholds3>\d+ *: *\d+ *: *\d+)|(?<thresholds2>\d+ *: *\d+)|(?<thresholds1>\d+)/i;

    const match = arguments.match(exp);
    //console.log(match);

    //Firstly, checks if something matched
    if (match === null) {
        state.message =
            "Skillcheck: Arguments were not given in proper format.";
        CutCommandFromContext();
        return;
    }
    //Regex matched, so program is rolling the dice
    const roll = diceRoll(state.dice);

    //Grabbing necessary info
    const stat = match.groups["stat"];
    const char = match.groups["character"];

    //Testing if stat exists, throwing error otherwise
    if (!ElementInArray(stat, state.stats)) {
        state.message = "Skillcheck: Specified stat does not exist";
        CutCommandFromContext();
        return;
    }

    //Shortening access path to character object
    let character = state.characters[char];

    //If you didn't create a character earlier, they get all stats at starting level from state
    if (character === undefined) {
        state.characters[char] = new Character();
        character = state.characters[char];
    }

    //Don't have a stat? No problem! You'll have a 0 instead! That's even worse than the default starting value!
    let charStat = character[stat] !== undefined ? character[stat].level : 0;
    //Punishing
    if (character.hp < 1 && shouldPunish) {
        state.message = `Skillcheck: Testing against dead character. Punishment: -${state.punishment} (temporary).`;
        charStat -= state.punishment;
    }

    //console.log(char + ", " + stat + ": "+ charStat);

    //Grabs thresholds
    const thresholds = arguments.match(thresholdCheck);
    if (thresholds === null) {
        state.message = "Thresholds are not in proper format";
        CutCommandFromContext();
        return;
    }
    //console.log(thresholds);

    const bonus = calcBonus(char, stat);
    // console.log("skill bonus:", bonus);
    //Tricky part, checking every group for data
    for (key in thresholds.groups) {
        //Grabbing necessary info
        let value = thresholds.groups[key];

        //null check
        if (
            value !== undefined &&
            currIndices !== undefined &&
            character !== undefined
        ) {
            const score = roll + charStat + bonus;
            let mess = `Skillcheck performed: ${char} with ${stat} ${
                charStat + bonus
            }${
                bonus === 0 ? "" : " (base " + charStat.toString() + ")"
            } rolled ${roll}. ${charStat + bonus} + ${roll} = ${score}. `;

            let outcome;
            let custom = false;
            //#region threshold check
            //Handling the skillcheck
            switch (key) {
                //One threshold means success or failure
                case "thresholds1":
                    mess += `Difficulty: ${value} Outcome: `;
                    outcome =
                        score >= Number(value.trim()) ? "success." : "failure.";
                    break;

                //Two of them - success, nothing, failure
                case "thresholds2":
                    value = value
                        .split(":")
                        .map((el) => Number(el.trim()))
                        .sort((a, b) => a - b);

                    mess += `Difficulty: ${value.join(", ")} Outcome: `;

                    if (score >= value[1]) {
                        outcome = "success.";
                    } else if (score >= value[0]) {
                        outcome = "nothing happens.";
                    } else {
                        outcome = "failure.";
                    }
                    break;

                //Three of them - critical success, success, failure or critical failure
                case "thresholds3":
                    value = value
                        .split(":")
                        .map((el) => Number(el.trim()))
                        .sort((a, b) => a - b);

                    mess += `Difficulty: ${value.join(", ")} Outcome: `;

                    if (score >= value[2]) {
                        outcome = "critical success.";
                    } else if (score >= value[1]) {
                        outcome = "success.";
                    } else if (score >= value[0]) {
                        outcome = "failure.";
                    } else {
                        outcome = "critical failure.";
                    }
                    break;

                //Four of them - critical success, success, nothing, failure or critical failure
                case "thresholds4":
                    value = value
                        .split(":")
                        .map((el) => Number(el.trim()))
                        .sort((a, b) => a - b);
                    mess += `Difficulty: ${value.join(", ")} Outcome: `;

                    if (score >= value[3]) {
                        outcome = "critical success.";
                    } else if (score >= value[2]) {
                        outcome = "success.";
                    } else if (score >= value[1]) {
                        outcome = "nothing happens.";
                    } else if (score >= value[0]) {
                        outcome = "failure.";
                    } else {
                        outcome = "critical failure.";
                    }
                    break;

                //Custom thresholds with outcomes
                case "thresholdsC":
                    value = value.split(":").map((el) => {
                        const temp = el.split("=").map((el) => el.trim());
                        return [Number(temp[0]), temp[1]];
                    });

                    mess += `Difficulty: ${CustomDifficulties(
                        value
                    )} Outcome: `;
                    custom = true;
                    break;

                //Read message
                default:
                    console.error("WTF is this?!");
                    state.message =
                        "An error has ocurred. Context: no group has been matched. \nIDK how did you make it, but think about creating an issue.";
                    return;
            }
            //#endregion threshold check

            //Modifying context and input. Custom thresholds are handled differently, so they are separated
            if (!custom) {
                state.ctxt =
                    modifiedText.substring(0, currIndices[0]) +
                    "Outcome: " +
                    outcome +
                    modifiedText.substring(currIndices[1], modifiedText.length);

                modifiedText =
                    modifiedText.substring(0, currIndices[0]) + mess + outcome;
            } else {
                state.ctxt =
                    modifiedText.substring(0, currIndices[0]) +
                    CustomOutcome(score, value) +
                    modifiedText.substring(currIndices[1], modifiedText.length);

                modifiedText =
                    modifiedText.substring(0, currIndices[0]) +
                    mess +
                    CustomOutcome(score, value);
            }
        }
    }
    if (character.isNpc) {
        //console.log("NPCs don't level up");
        modifiedText += textCopy.substring(currIndices[1]);
        return;
    }
    //Checks whether to level up stats or characters
    if (levellingToOblivion) {
        if (character[stat] !== undefined) {
            //Increases experience by 1 and checks whether it's enough to level the stat up
            if (++character[stat].experience >= character[stat].expToNextLvl) {
                //If it is, experience is set to 0,
                character[stat].experience = 0;
                //level increased and expToNextLevel re-calculated
                character[stat].expToNextLvl = experienceCalculation(
                    ++character[stat].level
                );
                modifiedText += ` ${char}'s ${stat} has levelled up to level ${character[stat].level}!`;
            }
        }
    } else {
        //Increases experience by 1 and checks whether it's enough to level the character up
        if (++character.experience >= character.expToNextLvl) {
            //If it is, experience is set to 0,
            character.experience = 0;
            //level increased and expToNextLevel re-calculated
            character.expToNextLvl = experienceCalculation(++character.level);
            //In the case of character levelling up, it also gains free skillpoints
            character.skillpoints += state.skillpointsOnLevelUp;
            modifiedText += ` ${char} has levelled up to level ${character.level} (free skillpoints: ${character.skillpoints})!`;
        }
    }
    modifiedText += textCopy.substring(currIndices[1]);
};
//#endregion skillcheck

//#region battle
const battle = (arguments) => {
    //Error checking
    if (arguments === undefined || arguments === null || arguments === "") {
        state.message = "Battle: No arguments found.";
        return;
    }

    //Looks for pattern (character1, character2, ...), (character3, character4, ...)
    const exp =
        /\((?<group1>[\w\s']+(?:, *[\w\s']+)*)\), *\((?<group2>[\w\s']+(?:, *[\w\s']+)*)\)/i;
    const match = modifiedText.match(exp);

    //Error checking
    if (match === null) {
        state.message = "Battle: No matching arguments found.";
        return;
    }

    //Grabs the info
    const side1 = [
        ...new Set(
            match.groups.group1
                .trim()
                .split(",")
                .map((el) => el.trim())
                .filter((el) => state.characters[el]?.hp > 0)
        ),
    ];
    const side2 = [
        ...new Set(
            match.groups.group2
                .trim()
                .split(",")
                .map((el) => el.trim())
                .filter((el) => state.characters[el]?.hp > 0)
        ),
    ];

    //Checks if follows rules:
    //Character is only one
    //Character cannot belong to both sides of the battle
    //Every element is a character
    //TODO: or enemy class with count
    for (const el of side1) {
        if (ElementInArray(el, Object.keys(state.characters))) {
            if (ElementInArray(el, side2)) {
                state.message = `Battle: character ${el} cannot belong to both sides of the battle.`;
                return;
            }
        } else {
            //console.log(`${el}\n\n${state.characters}`);
            state.message = `Battle: character ${el} doesn't exist.`;
            return;
        }
    }
    for (const el of side2) {
        if (!ElementInArray(el, Object.keys(state.characters))) {
            state.message = `Battle: character ${el} doesn't exist.`;
            return;
        }
    }

    //Setting up values for automatic turns
    state.side1 = side1;
    state.side2 = side2;
    state.currentSide = `side${diceRoll(2)}`;
    state.active = [...state[state.currentSide]];
    state.inBattle = true;
    state.out = "A battle has emerged between two groups!";
    turn();
};
//#endregion battle

//#region attack
const attack = (arguments) => {
    //Error checking
    if (arguments === undefined || arguments === null || arguments === "") {
        state.message = "Attack: No arguments found.";
        CutCommandFromContext();
        return;
    }

    //Checks for format stat, character, stat, character
    const exp =
        /(?<attackingCharacter>[\w\s']+), *(?<attackStat>[\w ']+), *(?<defendingCharacter>[\w\s']+), *(?<defenseStat>[\w ']+)/i;

    const match = arguments.match(exp);

    //Error checking
    if (match === null) {
        state.message = "Attack: No matching arguments found.";
        CutCommandFromContext();
        return;
    }

    //Checks if stats exist
    if (!ElementInArray(match.groups.attackStat, state.stats)) {
        state.message = "Attack: Attacking stat was not created.";
        CutCommandFromContext();
        return;
    }
    if (!ElementInArray(match.groups.defenseStat, state.stats)) {
        state.message = "Attack: Defending stat was not created.";
        CutCommandFromContext();
        return;
    }

    //Creates shortcuts to names and stats
    const attChar = match.groups.attackingCharacter;
    const attackStat = match.groups.attackStat;
    const defChar = match.groups.defendingCharacter;
    const defenseStat = match.groups.defenseStat;

    //Grabs the info
    let attackingCharacter = state.characters[attChar];
    let defendingCharacter = state.characters[defChar];

    //If you didn't create the characters earlier, they get all stats at starting level from state
    if (attackingCharacter === undefined) {
        state.characters[attChar] = new Character();
        attackingCharacter = state.characters[attChar];
    } else if (attackingCharacter.hp <= 0) {
        state.message = `Attack: ${attChar} cannot attack, because they are dead.`;
        CutCommandFromContext();
        return;
    }

    if (defendingCharacter === undefined) {
        state.characters[defChar] = new Character();
        defendingCharacter = state.characters[defChar];
    } else if (defendingCharacter.hp <= 0) {
        state.message = `Attack: ${defChar} cannot be attacked, because they are dead.`;
        CutCommandFromContext();
        return;
    }

    //Don't have a stat? No problem! You'll have a 0 instead! That's even worse than the default starting value!
    const attBonus = calcBonus(attChar, attackStat);
    const defBonus = calcBonus(defChar, defenseStat);
    let attCharStat =
        (attackingCharacter[attackStat] !== undefined
            ? attackingCharacter[attackStat].level
            : 0) + attBonus;
    let defCharStat =
        (defendingCharacter[defenseStat] !== undefined
            ? defendingCharacter[defenseStat].level
            : 0) + defBonus;

    //(Unless you are not ignoring zero division. In this case zeroes are changed to ones to avoid zero division error.)
    if (!ignoreZeroDiv) {
        attCharStat = attCharStat === 0 ? 1 : attCharStat;
        defCharStat = defCharStat === 0 ? 1 : defCharStat;
    }

    //Calculating damage
    const dam = damage(attCharStat, defCharStat);
    //Damaging
    state.characters[defChar].hp -= dam;

    //Modifies the context, so AI will not know the exact values
    const mess = `${attChar} attacked ${defChar} dealing ${CustomDamageOutput(
        dam,
        damageOutputs
    )}.${state.characters[defChar].hp <= 0 ? "\n" + defChar + " died." : ""}`;

    if (state.characters[defChar].hp <= 0) state.characters[defChar].hp = 0;

    state.ctxt =
        state.ctxt !== ""
            ? state.ctxt.substring(0, currIndices[0]) +
              mess +
              state.ctxt.substring(currIndices[1], state.ctxt.length)
            : modifiedText.substring(0, currIndices[0]) +
              mess +
              modifiedText.substring(currIndices[1], modifiedText.length);

    //Gives the player necessary info.
    modifiedText =
        modifiedText.substring(0, currIndices[0]) +
        `${attChar} (${attackStat}: ${attCharStat}${
            attBonus === 0
                ? ""
                : " (base" + (attCharStat - attBonus).toString() + ")"
        }) attacked ${defChar} (${defenseStat}: ${defCharStat}${
            defBonus === 0
                ? ""
                : " (base" + (defCharStat - defBonus).toString() + ")"
        }) dealing ${CustomDamageOutput(dam, damageOutputs)} (${dam}).\n${
            state.characters[defChar].hp <= 0
                ? defChar + " died."
                : defChar + " now has " + state.characters[defChar].hp + "hp."
        }`;

    //#region  levels
    if (!attackingCharacter.isNpc) {
        //Checks whether to level up stats or characters
        if (levellingToOblivion) {
            //Increases experience by 1 and checks whether it's enough to level the stat up
            if (
                ++attackingCharacter[attackStat].experience >=
                attackingCharacter[attackStat].expToNextLvl
            ) {
                //If it is, experience is set to 0,
                attackingCharacter[attackStat].experience = 0;
                //level increased and expToNextLevel re-calculated
                attackingCharacter[attackStat].expToNextLvl =
                    experienceCalculation(
                        ++attackingCharacter[attackStat].level
                    );
                modifiedText += ` ${attChar}'s ${attackStat} has levelled up to level ${attackingCharacter[attackStat].level}!`;
            }
        } else {
            //Increases experience by 1 and checks whether it's enough to level the character up
            if (
                ++attackingCharacter.experience >=
                attackingCharacter.expToNextLvl
            ) {
                //If it is, experience is set to 0,
                attackingCharacter.experience = 0;
                //level increased and expToNextLevel re-calculated
                attackingCharacter.expToNextLvl = experienceCalculation(
                    ++attackingCharacter.level
                );
                //In the case of attackingCharacter levelling up, it also gains free skillpoints
                attackingCharacter.skillpoints += state.skillpointsOnLevelUp;
                modifiedText += ` ${attChar} has levelled up to level ${attackingCharacter.level} (free skillpoints: ${attackingCharacter.skillpoints})!`;
            }
        }
    }
    if (defendingCharacter.isNpc) {
        if (state.characters[defChar].hp <= 0) delete state.characters[defChar];
        //console.log("NPCs don't level up - defense");
    } else if (defendingCharacterLevels) {
        //Checks whether to level up stats or characters
        if (levellingToOblivion) {
            //Increases experience by 1 and checks whether it's enough to level the stat up
            if (
                ++defendingCharacter[defenseStat].experience >=
                defendingCharacter[defenseStat].expToNextLvl
            ) {
                //If it is, experience is set to 0,
                defendingCharacter[defenseStat].experience = 0;
                //level increased and expToNextLevel re-calculated
                defendingCharacter[defenseStat].expToNextLvl =
                    experienceCalculation(
                        ++defendingCharacter[defenseStat].level
                    );
                modifiedText += ` ${defChar}'s ${defenseStat} has levelled up to level ${defendingCharacter[defenseStat].level}!`;
            }
        } else {
            //Increases experience by 1 and checks whether it's enough to level the defendingCharacter up
            if (
                ++defendingCharacter.experience >=
                defendingCharacter.expToNextLvl
            ) {
                //If it is, experience is set to 0,
                defendingCharacter.experience = 0;
                //level increased and expToNextLevel re-calculated
                defendingCharacter.expToNextLvl = experienceCalculation(
                    ++defendingCharacter.level
                );
                //In the case of defendingCharacter levelling up, it also gains free skillpoints
                defendingCharacter.skillpoints += state.skillpointsOnLevelUp;
                modifiedText += ` ${defChar} has levelled up to level ${defendingCharacter.level} (free skillpoints: ${defendingCharacter.skillpoints})!`;
            }
        }
    }
    //#endregion levels
    modifiedText += textCopy.substring(currIndices[1]);
};
//#endregion attack

//#region sattack
const sattack = (arguments) => {
    //Error checking
    if (arguments === undefined || arguments === null || arguments === "") {
        state.message = "sAttack: No arguments found.";
        CutCommandFromContext();
        return;
    }

    //Checks for format stat, character, stat, character
    const exp =
        /(?<attackingCharacter>[\w\s']+), *(?<attackStat>[\w ']+), (?<defendingCharacter>[\w\s']+), *(?<defenseStat>[\w ']+), *(?<dodgeStat>[\w ']+)/i;

    const match = arguments.match(exp);

    //Error checking
    if (match === null) {
        state.message = "sAttack: No matching arguments found.";
        CutCommandFromContext();
        return;
    }

    //Checks if stats exist
    if (!ElementInArray(match.groups.attackStat, state.stats)) {
        state.message = "sAttack: Attacking stat was not created.";
        CutCommandFromContext();
        return;
    }
    if (!ElementInArray(match.groups.defenseStat, state.stats)) {
        state.message = "sAttack: Defending stat was not created.";
        CutCommandFromContext();
        return;
    }

    //Creates shortcuts to names and stats
    const attChar = match.groups.attackingCharacter;
    const attackStat = match.groups.attackStat;
    const defChar = match.groups.defendingCharacter;
    const defenseStat = match.groups.defenseStat;
    const dodgeStat = match.groups.dodgeStat;

    //Grabs the info
    let attackingCharacter = state.characters[attChar];
    let defendingCharacter = state.characters[defChar];

    //If you didn't create the characters earlier, they get all stats at starting level from state
    if (attackingCharacter === undefined) {
        state.characters[attChar] = new Character();
        attackingCharacter = state.characters[attChar];
    } else if (attackingCharacter.hp <= 0) {
        state.message = `sAttack: ${attChar} cannot attack, because they are dead.`;
        CutCommandFromContext();
        return;
    }

    if (defendingCharacter === undefined) {
        state.characters[defChar] = new Character();
        defendingCharacter = state.characters[defChar];
    } else if (defendingCharacter.hp <= 0) {
        state.message = `sAttack: ${defChar} cannot be attacked, because they are dead.`;
        CutCommandFromContext();
        return;
    }

    //Don't have a stat? No problem! You'll have a 0 instead! That's even worse than the default starting value!
    const attBonus = calcBonus(attChar, attackStat);
    const defBonus = calcBonus(defChar, defenseStat);
    const dodgeBonus = calcBonus(defChar, dodgeStat);
    let attCharStat =
        (attackingCharacter[attackStat] !== undefined
            ? attackingCharacter[attackStat].level
            : 0) + attBonus;
    let defCharStat =
        (defendingCharacter[defenseStat] !== undefined
            ? defendingCharacter[defenseStat].level
            : 0) + defBonus;
    let defCharDodge =
        (defendingCharacter[dodgeStat] !== undefined
            ? defendingCharacter[dodgeStat].level
            : 0) + dodgeBonus;

    //(Unless you are not ignoring zero division. In this case zeroes are changed to ones to avoid zero division error.)
    if (!ignoreZeroDiv) {
        attCharStat = attCharStat === 0 ? 1 : attCharStat;
        defCharStat = defCharStat === 0 ? 1 : defCharStat;
    }

    //Checks if the character dodged the attack
    if (dodge(attCharStat, defCharDodge)) {
        modifiedText =
            modifiedText.substring(0, currIndices[0]) +
            `${attChar}(${attCharStat}${
                attBonus === 0
                    ? ""
                    : " (base: " + (attCharStat - attBonus) + ")"
            }) attacked ${defChar}(${defCharDodge}${
                dodgeBonus === 0
                    ? ""
                    : " (base: " + (defCharDodge - dodgeBonus) + ")"
            }), but missed.` +
            modifiedText.substring(currIndices[1]);
        state.ctxt =
            state.ctxt === undefined
                ? modifiedText.substring(0, currIndices[0]) +
                  `${attChar} attacked ${defChar}, but missed.` +
                  modifiedText.substring(currIndices[1])
                : state.ctxt.substring(0, currIndices[0]) +
                  `${attChar} attacked ${defChar}, but missed.` +
                  state.ctxt.substring(currIndices[1]);
        return;
    }

    //Calculating damage
    const dam = damage(attCharStat, defCharStat);
    //Damaging
    state.characters[defChar].hp -= dam;

    //Modifies the context, so AI will not know the exact values
    const mess = `${attChar} attacked ${defChar} and hit dealing ${CustomDamageOutput(
        dam,
        damageOutputs
    )}.${state.characters[defChar].hp <= 0 ? "\n" + defChar + " died." : ""}`;

    if (state.characters[defChar].hp <= 0) {
        state.characters[defChar].hp = 0;
        //NPCs die when they are killed
        if (state.characters[defChar].isNpc) delete state.characters[defChar];
    }
    state.ctxt =
        state.ctxt !== ""
            ? state.ctxt.substring(0, currIndices[0]) +
              mess +
              state.ctxt.substring(currIndices[1], state.ctxt.length)
            : modifiedText.substring(0, currIndices[0]) +
              mess +
              modifiedText.substring(currIndices[1], modifiedText.length);

    //Gives the player necessary info.
    modifiedText =
        modifiedText.substring(0, currIndices[0]) +
        `${attChar} (${attackStat}: ${attCharStat}${
            attBonus === 0 ? "" : " (base: " + (attCharStat - attBonus) + ")"
        }) attacked ${defChar} (${defenseStat}: ${defCharStat}${
            defBonus === 0 ? "" : " (base: " + (defCharStat - defBonus) + ")"
        }) dealing ${CustomDamageOutput(dam, damageOutputs)} (${dam}).\n${
            state.characters[defChar].hp <= 0
                ? defChar + " died."
                : defChar + " now has " + state.characters[defChar].hp + "hp."
        }`;

    //#region levels
    if (!attackingCharacter.isNpc) {
        //Checks whether to level up stats or characters
        if (levellingToOblivion) {
            //Increases experience by 1 and checks whether it's enough to level the stat up
            if (
                ++attackingCharacter[attackStat].experience >=
                attackingCharacter[attackStat].expToNextLvl
            ) {
                //If it is, experience is set to 0,
                attackingCharacter[attackStat].experience = 0;
                //level increased and expToNextLevel re-calculated
                attackingCharacter[attackStat].expToNextLvl =
                    experienceCalculation(
                        ++attackingCharacter[attackStat].level
                    );
                modifiedText += ` ${attChar}'s ${attackStat} has levelled up to level ${attackingCharacter[attackStat].level}!`;
            }
        } else {
            //Increases experience by 1 and checks whether it's enough to level the character up
            if (
                ++attackingCharacter.experience >=
                attackingCharacter.expToNextLvl
            ) {
                //If it is, experience is set to 0,
                attackingCharacter.experience = 0;
                //level increased and expToNextLevel re-calculated
                attackingCharacter.expToNextLvl = experienceCalculation(
                    ++attackingCharacter.level
                );
                //In the case of attackingCharacter levelling up, it also gains free skillpoints
                attackingCharacter.skillpoints += state.skillpointsOnLevelUp;
                modifiedText += ` ${attChar} has levelled up to level ${attackingCharacter.level} (free skillpoints: ${attackingCharacter.skillpoints})!`;
            }
        }
    }
    if (defendingCharacter.isNpc) {
        if (state.characters[defChar].hp <= 0) delete state.characters[defChar];
    } else if (defendingCharacterLevels) {
        //Checks whether to level up stats or characters
        if (levellingToOblivion) {
            //Increases experience by 1 and checks whether it's enough to level the stat up
            if (
                ++defendingCharacter[defenseStat].experience >=
                defendingCharacter[defenseStat].expToNextLvl
            ) {
                //If it is, experience is set to 0,
                defendingCharacter[defenseStat].experience = 0;
                //level increased and expToNextLevel re-calculated
                defendingCharacter[defenseStat].expToNextLvl =
                    experienceCalculation(
                        ++defendingCharacter[defenseStat].level
                    );
                modifiedText += ` ${defChar}'s ${defenseStat} has levelled up to level ${defendingCharacter[defenseStat].level}!`;
            }
        } else {
            //Increases experience by 1 and checks whether it's enough to level the defendingCharacter up
            if (
                ++defendingCharacter.experience >=
                defendingCharacter.expToNextLvl
            ) {
                //If it is, experience is set to 0,
                defendingCharacter.experience = 0;
                //level increased and expToNextLevel re-calculated
                defendingCharacter.expToNextLvl = experienceCalculation(
                    ++defendingCharacter.level
                );
                //In the case of defendingCharacter levelling up, it also gains free skillpoints
                defendingCharacter.skillpoints += state.skillpointsOnLevelUp;
                modifiedText += ` ${defChar} has levelled up to level ${defendingCharacter.level} (free skillpoints: ${defendingCharacter.skillpoints})!`;
            }
        }
    }
    //#endregion levels
    modifiedText += textCopy.substring(currIndices[1]);
};
//#endregion sattack

//#region heal
const heal = (arguments) => {
    CutCommandFromContext();
    //Looks for character, (d)number pattern. If d exists, dice is rolled, else number is used as is.
    const exp = /(?<character>[\w\s']+), *(?<value>(?:\d+ *: *\d+)|(?:d?\d+))/i;
    const match = arguments.match(exp);

    //Null check
    if (match === null) {
        state.message = "Heal: Arguments were not given in proper format.";
        return;
    }

    //Shortcut
    const char = match.groups.character;
    //Checks if character exists
    if (!ElementInArray(char, Object.keys(state.characters))) {
        state.message = "Heal: Nonexistent characters can't be healed.";
        return;
    }

    //Another shortcut
    const character = state.characters[char];
    //Checks if character is dead
    if (character.hp < 1) {
        state.message = "Heal: Dead characters must be revived before healing.";
        return;
    }

    //Initiates the value
    let value;
    //If : syntax is used, proper operations are performed
    if (match.groups.value.includes(":")) {
        const temp = match.groups.value
            .split(":")
            .map((el) => Number(el.trim()));
        if (temp[0] > temp[1]) {
            const t = temp[0];
            temp[0] = temp[1];
            temp[1] = t;
        }
        value = diceRoll(temp[1] - temp[0] + 1) + temp[0] - 1;
    }
    //Rolls a dice or just sets the value from args in other cases
    else
        value =
            match.groups.value.toLowerCase()[0] === "d"
                ? diceRoll(Number(match.groups.value.substring(1)))
                : Number(match.groups.value);
    //Healing
    state.characters[char].hp += value;

    //Output information
    state.out = `Character ${char} was healed by ${value} hp. Current hp: ${character.hp}.`;
};
//#endregion heal

//#region revive
const revive = (arguments) => {
    CutCommandFromContext();
    //Looks for pattern reviving character, revived character, revive value
    const exp =
        /(?<revivingCharacter>[\w\s']+), *(?<revivedCharacter>[\w\s']+), *(?<value>\d+)/i;
    const match = arguments.match(exp);

    //Null check
    if (match === null) {
        state.message = "Revive: Arguments were not given in proper format.";
        return;
    }

    //Shortcuts
    const value = Number(match.groups.value);
    const revChar = match.groups.revivingCharacter;
    const dedChar = match.groups.revivedCharacter;

    //Checks for reviving char
    if (!ElementInArray(revChar, Object.keys(state.characters))) {
        state.message = "Revive: Reviving character doesn't exist.";
        return;
    }
    const revCharacter = state.characters[revChar];
    if (revCharacter.hp <= value) {
        state.message =
            "Revive: Reviving character would die if this action would be performed. Their hp is too low.\nRevive was not performed.";
        return;
    }

    //Check for revived char
    if (!ElementInArray(dedChar, Object.keys(state.characters))) {
        state.message = "Revive: Revived character doesn't exist.";
        return;
    }
    const dedCharacter = state.characters[dedChar];

    //Reviving/transfusion
    state.characters[revChar].hp -= value;
    state.characters[dedChar].hp += value;

    //Custom output
    state.out = `${revChar} transfused ${value} hp to ${dedChar}${
        dedCharacter.hp === value ? ", reviving " + dedChar : ""
    }. Resulting hp: ${revChar}: ${revCharacter.hp}, ${dedChar}: ${
        dedCharacter.hp
    }.`;
};
//#endregion revive

//#region addItem
const addItem = (arguments) => {
    CutCommandFromContext();
    //Error checking
    if (arguments === undefined || arguments === null || arguments === "") {
        state.message = "Add Item: No arguments found.";
        return;
    }
    //Looks for pattern name, slot, stat=value, target place (none by default) and character
    const exp =
        /(?<name>[\w ']+), (?<slot>[\w\s]+)(?<bonuses>(?:, [\w ']+ *= *-?\d+)+)(?:, *(?<target>inventory|equip)(?:, *(?<character>[\w\s']+))?)?/i;
    const match = arguments.match(exp);

    //Error checking
    if (match === null) {
        state.message = "Add Item: No matching arguments found.";
        return;
    }

    if (match.groups.target === "equip") {
        if (match.groups.character === undefined) {
            state.message =
                "Add Item: You must specify who will equip the item when you choose so.";
            return;
        }
        if (
            !ElementInArray(
                match.groups.character,
                Object.keys(state.characters)
            )
        ) {
            state.message = `Add Item: Character ${match.groups.character} doesn't exist.`;
            return;
        }
    }

    const name = match.groups.name.trim();

    //Converts values to format [[stat, val], [stat2, val], ... [statN, val]]
    let values = match.groups.bonuses
        .substring(2)
        .split(", ")
        .map((el) => el.trim().split("="));

    for (const i in values) {
        let curr = values[i].map((el) => el.trim());
        if (curr[1][0] === "$") {
            state.message = `Add Item: You cannot pass item as property of another item.`;
            return;
        }
        if (!isInStats(curr[0])) state.stats.push(curr[0]);
        curr = [curr[0], Number(curr[1])];
        values[i] = curr;
    }
    //Adds slot
    values.push(["slot", match.groups.slot]);
    //End of conversion

    //Passes to constructor and adds received item to the object
    const item = new Item(name, values);
    state.items[name] = item;
    modifiedText = `Item ${name} created with attributes:\n${ItemToString(
        item
    )}`;
    if (match.groups.target === "equip") _equip(match.groups.character, item);
    else if (match.groups.target === "inventory") {
        state.inventory.push(name);
        `Item ${name} put into inventory`;
    }
};
//#endregion addItem

//#region gainItem
//TODO: test
const gainItem = (arguments) => {
    CutCommandFromContext();
    //Error checking
    if (arguments === undefined || arguments === null || arguments === "") {
        state.message = "Gain Item: No arguments found.";
        return;
    }

    const exp = /(?<name>[\w ']+)(?:, *(?<character>[\w\s']+))?/i;
    const match = arguments.match(exp);

    //Error checking
    if (match === null) {
        state.message = "Gain Item: No matching arguments found.";
        return;
    }

    const char = match.groups.character,
        name = match.groups.name;

    if (!ElementInArray(name, Object.keys(state.items))) {
        state.message = `Gain Item: Item ${name} doesn't exist.`;
        return;
    }

    //If the character has been specified, it must exist
    if (
        char !== undefined &&
        !ElementInArray(char, Object.keys(state.characters))
    ) {
        state.message = `Gain Item: Character ${char} doesn't exist.`;
        return;
    }

    state.inventory.push(name);
    if (char !== undefined) {
        modifiedText = "";
        _equip(char, state.items[name]);
    } else modifiedText = `Item ${name} was put into inventory.`;
};
//#endregion gainItem

//#region equip
const equip = (arguments) => {
    CutCommandFromContext();
    //Error checking
    if (arguments === undefined || arguments === null || arguments === "") {
        state.message = "Equip Item: No arguments found.";
        return;
    }

    const exp = /(?<character>[\w\s']+)(?<items>(?:, *[\w ']+)+)/i;
    const match = arguments.match(exp);

    //Error checking
    if (match === null) {
        state.message = "Equip Item: No matching arguments found.";
        return;
    }

    const char = match.groups.character,
        items = match.groups.items
            .substring(1)
            .trim()
            .split(/, */)
            .map((x) => x.trim());

    if (!ElementInArray(char, Object.keys(state.characters))) {
        state.message = `Equip Item: Character ${char} doesn't exist.`;
        return;
    }
    for (const el of items)
        if (!ElementInArray(el, Object.keys(state.items))) {
            state.message = `Equip Item: Item ${el} isn't in your inventory.`;
            return;
        }

    for (const el of items) _equip(char, state.items[el]);

    modifiedText += "\nItem(s) successfully equipped.";
};
//#endregion equip

//#region unequip
const unequip = (arguments) => {
    CutCommandFromContext();
    //Error checking
    if (arguments === undefined || arguments === null || arguments === "") {
        state.message = "Unequip Item: No arguments found.";
        return;
    }

    const exp = /(?<character>[\w\s']+)(?<slots>(?:, *[\w ]+)+)/i;
    const match = arguments.match(exp);

    //Error checking
    if (match === null) {
        state.message = "Unequip Item: No matching arguments found.";
        return;
    }

    //Grabs character name
    const char = match.groups.character;

    //Checks if character exists
    if (!ElementInArray(char, Object.keys(state.characters))) {
        state.message = `Unequip Item: Character ${char} doesn't exist.`;
        return;
    }

    //Puts items from slots back into inventory
    for (const slot of match.groups.slots
        .substring(1)
        .trim()
        .split(",")
        .map((x) => x.trim())) {
        if (state.characters[char].items[slot]) {
            state.inventory.push(state.characters[char].items[slot].name);
            modifiedText += `\n${char} unequipped ${state.characters[char].items[slot].name}`;
            state.characters[char].items[slot] = undefined;
        }
    }
};
//#endregion unequip

//#region showInventory
//TODO: test
const showInventory = (arguments) => {
    if (arguments !== "") {
        state.message =
            "Show Inventory: showInventory doesn't take any arguments";
        return;
    }
    console.log(state.inventory);
    modifiedText =
        "Currently your inventory holds: " + state.inventory.join(", ") + ".";
};
//#endregion showInventory

//#region addCharacter
addCharacter = (arguments) => {
    //Looks for pattern !addCharacter(name) or !addCharacter(name, stat1=value, stat2=value, ..., statN=value)
    const exp =
        /(?<character>[\w\s']+)(?<startingStats>(?:, [\w ']+ *= *(?:\d+|\$[\w ']+))*)(?<startingItems>(?:, *(?:\$[\w '])+)*)/i;

    //Matches the RegEx
    const match = arguments.match(exp);

    //Null check
    if (match === null) {
        state.message =
            "Add Character: Arguments were not given in proper format.";
        return;
    }
    //Grabbing info
    const char = match.groups.character;

    //Converts values to format [[stat, val], [stat2, val], ... [statN, val]]
    let values = match.groups.startingStats
        .substring(2)
        .split(", ")
        .map((el) => el.trim().split("="));

    for (const i in values) {
        let curr = values[i];
        curr = [curr[0].trim(), Number(curr[1].trim())];
        values[i] = curr;
    }
    //End of conversion

    //Creates the character with stats. If none were given, every created stat is at state.startingLevel
    state.characters[char] =
        values[0][0] === ""
            ? new Character()
            : new Character(
                  values,
                  match.groups.startingItems.split(",").map((el) => el.trim())
              );

    CutCommandFromContext();
    state.out = `\nCharacter ${char} has been created with stats\n${state.characters[char]}.`;
};
//#endregion addCharacter

//#region addNPC
addNPC = (arguments) => {
    //Looks for pattern !addNPC(name) or !addNPC(name, stat1=value, stat2=value, ..., statN=value)
    const exp =
        /(?<character>[\w\s']+)(?<startingStats>(?:, [\w ']+ *= *(?:\d+|\$[\w ']+))*)(?<startingItems>(?:, *(?:\$[\w '])+)*)/i;

    //Matches the RegEx
    const match = arguments.match(exp);

    //Null check
    if (match === null) {
        state.message = "Add NPC: Arguments were not given in proper format.";
    }
    //Grabbing info
    const char = match.groups.character;

    //Converts values to format [[stat, val], [stat2, val], ... [statN, val]]
    let values = match.groups.startingStats
        .substring(2, match.groups.startingStats.length)
        .split(", ")
        .map((el) => el.trim().split("="));

    for (const i in values) {
        let curr = values[i];
        curr = [curr[0].trim(), Number(curr[1].trim())];
        values[i] = curr;
    }
    //End of conversion

    //Creates the character with stats. If none were given, every created stat is at state.startingLevel
    state.characters[char] =
        values[0][0] === ""
            ? new NPC()
            : new NPC(
                  values,
                  match.groups.startingItems.split(",").map((el) => el.trim())
              );

    CutCommandFromContext();
    state.out = `\nNon-Playable Character ${char} has been created with stats\n${state.characters[char]}.`;
};
//#endregion addNPC

//#region setStats
setStats = (arguments) => {
    //Looks for pattern !addCharacter(name) or !addCharacter(name, stat1=value, stat2=value, ..., statN=value)
    const exp =
        /(?<character>[\w\s']+)(?<stats>(?:, [\w ']+ *= *(?:\d+|[\w ']+))+)/i;

    //Matches the RegEx
    const match = arguments.match(exp);

    //Null check
    if (match !== null) {
        //Grabbing info
        const char = match.groups.character;
        if (!ElementInArray(char, Object.keys(state.characters))) {
            state.message =
                "Character has not been created and its stats cannot be altered.";
            CutCommandFromContext();
            return;
        }
        let character = state.characters[char];

        //Converts values to format [[stat, newVal], [stat2, newVal], ... [statN, newVal]]
        let values = match.groups.stats
            .substring(2, match.groups.stats.length)
            .split(", ")
            .map((el) => el.trim().split("="));

        for (i in values) {
            let curr = values[i];
            curr.map((el) => el.trim());
            if (curr[1][0] === "$") {
                if (!ElementInArray(curr[1].substring(1), state.items)) {
                    state.message = `Set Stats: item ${i} doesn't exist.`;
                    return;
                }
                if (!ElementInArray(curr[0], equipmentParts)) {
                    state.message = `Set Stats: you have no place to wear ${i[0]}.`;
                    return;
                }
                values[i] = [curr[0].trim(), curr[1].trim().toLowerCase()];
                continue;
            }
            curr = [curr[0].trim(), Number(curr[1])];
            values[i] = curr;
        }

        //Caches old stats to show
        oldStats = CharToString(character);

        //Changes stats
        for (el of values) {
            if (el[0] == "hp" || ElementInArray(el[0], ignoredValues)) {
                character[el[0]] = el[1];
                continue;
            }
            character[el[0]] = new Stat(el[0], el[1]);
        }

        state.characters[char] = character;

        CutCommandFromContext();

        state.out = `\n${char}'s stats has been changed\nfrom\n${oldStats}\nto\n${CharToString(
            character
        )}.`;
    } else {
        state.message = "Invalid arguments.";
        CutCommandFromContext();
        return;
    }
};
//#endregion setStats

//#region showStats
showStats = (arguments) => {
    //Looks for pattern !showStats(already-created-character)
    const exp = /(?<character>[\w\s']+)/i;
    match = arguments.match(exp);
    //Null check
    if (match !== null) {
        //Grabbing info
        const char = match.groups.character;
        if (!ElementInArray(char, Object.keys(state.characters))) {
            state.message =
                "Character has not been created and its stats cannot be shown.";
            //Removing command from context
            CutCommandFromContext();
            return;
        }
        const character = state.characters[char];

        CutCommandFromContext();
        //Sets info to print out
        state.out = `\n${char}'s current stats are:\n${CharToString(
            character
        )}.`;
    }
};
//#endregion showStats

//#region levelStats
const levelStats = (arguments) => {
    CutCommandFromContext();
    if (levellingToOblivion) {
        state.message =
            "Level Stats: this command will work only when you are levelling your characters.\nIn current mode stats are levelling by themselves when you are using them.";
        return;
    }

    //Looks for format character, stat1+val1, stat2+val2...
    const exp = /(?<character>[\w\s']+)(?<stats>(?:, [\w ']+ *\+ *\d+)+)/i;
    const match = arguments.match(exp);

    if (match === null) {
        state.message =
            "Level Stats: arguments were not given in proper format.";
        return;
    }

    const char = match.groups.character;
    if (!ElementInArray(char, Object.keys(state.characters))) {
        state.message = "Level Stats: Nonexistent characters can't level up.";
        return;
    }
    const character = state.characters[char];

    //Converts values to format [[stat, addedVal], [stat2, addedVal], ... [statN, addedVal]]
    let values = match.groups.stats
        .substring(2, match.groups.stats.length)
        .split(", ")
        .map((el) => el.trim().split("+"));

    let usedSkillpoints = 0;
    for (i in values) {
        curr = values[i];
        curr = [curr[0].trim(), Number(curr[1])];
        usedSkillpoints += curr[1];
        values[i] = curr;
    }

    if (usedSkillpoints === 0) {
        state.message = "Level Stats: You need to use at least one skillpoint.";
        return;
    }
    if (character.skillpoints < usedSkillpoints) {
        state.message = `Level Stats: ${char} doesn't have enough skillpoints (${character.skillpoints}/${usedSkillpoints})`;
        return;
    }

    //Caches old stats to show
    const oldStats = CharToString(character);

    //Changes stats
    for (el of values) {
        if (el[0] == "hp" || ElementInArray(el[0], ignoredValues)) {
            state.message += `\nLevel Stats: ${el[0]} cannot be levelled up.`;
            continue;
        }
        if (typeof character[el[0]] !== "object") {
            character[el[0]] = new Stat(el[0], el[1]);
            character.skillpoints -= el[1];
            continue;
        }
        character[el[0]].level += el[1];
        character.skillpoints -= el[1];
    }

    state.characters[char] = character;

    state.out = `\n${char}'s stats has been levelled\nfrom\n${oldStats}\nto\n${CharToString(
        character
    )}.`;
};
//#endregion levelStats

//#region getState
getState = (arguments) => {
    CutCommandFromContext();
    if (arguments !== "") {
        state.message =
            "Get State: getState command doesn't take any arguments.";
        return;
    }

    //Sets data to print out
    state.out = "\n----------\n\n" + JSON.stringify(state) + "\n\n----------\n";
};
//#endregion getState

//#region setState
setState = (arguments) => {
    CutCommandFromContext();
    //Looks for pattern !setState(anything)
    const exp = /(?<json>.+)/i;
    match = arguments.match(exp);

    //Null check
    if (match !== null) {
        //Ensuring data won't be accidentally purged along with error handling
        let cache;
        try {
            cache = JSON.parse(match.groups.json);
        } catch (SyntaxError) {
            cache = state;
            state.message = "Set State: Invalid JSON state.";
        }

        if (cache !== null && cache !== undefined) {
            for (let key in cache) {
                state[key] = cache[key];
            }
        }
    } else {
        state.message =
            "Set State: You need to enter a parameter to setState command.";
        return;
    }
};
//#endregion setState

//#region logs
const logs = () => {
    //!Debug info, uncomment when you need
    if (DEBUG) {
        //console.log(`Og: ${textCopy}`);
        console.log(`In: ${modifiedText}`);
        console.log(`Context: ${state.ctxt}`);
        console.log(`Out: ${state.out}`);
        console.log(`Message: ${state.message}`);
        //console.log(state.side1, state.side2);
        //console.log(state.characters);
        //console.log(state.inBattle);
        /*for (key in state.characters) {
      console.log(`\n\n${key}:\n${state.characters[key]}`);
    }*/
        console.log("------------");
    }
};
//#endregion logs

//Main function
let currIndices, modifiedText, textCopy;
const modifier = (text) => {
    SetupState();
    //Resets values
    state.out = state.ctxt = "";
    state.message = " ";
    modifiedText = textCopy = text;

    //#region battle handling
    if (state.inBattle) {
        temp = text.match(
            /\((?:(?<attackStat>[\w ']+), *)?(?<defendingCharacter>[\w\s']+)(?:, *(?<defenseStat>[\w ']+))?\)/i
        )?.[0];
        if (temp !== undefined)
            modifiedText =
                modifiedText.substring(0, text.indexOf(temp)) +
                modifiedText.substring(text.indexOf(temp) + temp.length);
        if (!state.active?.length) {
            const temp = Number(state.currentSide.substring(4)) + 1;
            state.currentSide = `side${temp >= 3 ? 1 : temp}`;
            state.active = [...state[state.currentSide]];
        }
        turn();
        logs();
        return { text: modifiedText };
    }
    //#endregion battle handling

    //#region globalCommand
    //Checks for pattern !command(args)
    const globalExp = /!(?<command>[^\s()]+)\((?<arguments>.*)\)/i;
    const globalMatch = text.match(globalExp);
    //If something matched, calls functions with further work
    if (globalMatch !== null) {
        const temp = text.indexOf(globalMatch[0]);
        //Creates indices, because d flag is not allowed
        currIndices = [temp, temp + globalMatch[0].length];

        //Matches the command and forwards arguments to them
        switch (globalMatch.groups.command.toLowerCase()) {
            case "skillcheck":
                skillcheck(globalMatch.groups.arguments);
                break;

            case "battle":
                battle(globalMatch.groups.arguments);
                break;

            case "attack":
                if (!defaultDodge) attack(globalMatch.groups.arguments);
                else sattack(globalMatch.groups.arguments);
                break;

            case "sattack":
                if (defaultDodge) attack(globalMatch.groups.arguments);
                else sattack(globalMatch.groups.arguments);
                break;

            case "heal":
                heal(globalMatch.groups.arguments);
                break;

            case "revive":
                revive(globalMatch.groups.arguments);
                break;

            case "additem":
                addItem(globalMatch.groups.arguments);
                break;

            case "gainitem":
                gainItem(globalMatch.groups.arguments);
                break;

            case "equip":
                equip(globalMatch.groups.arguments);
                break;

            case "unequip":
                unequip(globalMatch.groups.arguments);
                break;

            case "showinventory":
                showInventory(globalMatch.groups.arguments);
                break;

            case "addcharacter":
                addCharacter(globalMatch.groups.arguments);
                break;

            case "addnpc":
                addNPC(globalMatch.groups.arguments);
                break;

            case "setstats":
                setStats(globalMatch.groups.arguments);
                break;

            case "showstats":
                showStats(globalMatch.groups.arguments);
                break;

            case "levelstats":
                levelStats(globalMatch.groups.arguments);
                break;

            case "getstate":
                getState(globalMatch.groups.arguments);
                break;

            case "setstate":
                setState(globalMatch.groups.arguments);
                break;

            default:
                state.message = "Command not found.";
                break;
        }
        if (state.ctxt.length <= 1) state.ctxt = " \n";
    }
    //#endregion globalCommand
    state.in = modifiedText;
    logs();
    // You must return an object with the text property defined.
    return { text: modifiedText };
};

if (!DEBUG) {
    // Don't modify this part
    modifier(text);
} else {
    if (TESTS) {
        //!fixed tests
        modifier("!additem(ass knife, weapon, poison=3)");
        modifier("!addcharacter(Librun, level=5, hp=5)");
        modifier("!showstats(Librun)");
        modifier("!gainitem(ass knife)");
        modifier("!equip(Librun, ass knife)");
        modifier("!showstats(Librun)");
        modifier(
            "!additem(bbq sauce, artifact, poison=10, chef=2, equip, Librun)"
        );
        modifier("!showstats(Librun)");
        modifier("!skillcheck(poison, Librun, 4)");
        modifier("!skillcheck(chef, Librun, 4)");
        modifier("!unequip(Librun, weapon, artifact)");
        modifier("!showinventory()");
        // modifier("!addCharacter(Miguel, str=1, dex=5, int=3, hp=40)");
        // modifier(
        //     "Miguel tries to evade an arrow. !skillcheck(dex, Miguel, 3) Is he blind?"
        // );
        // modifier("!skillcheck(int, Miguel, 5000)");
        // modifier("!skillcheck(str, Miguel, 5 : 11)");
        // modifier("!skillcheck(str, Miguel, 25 : 14 : 22)");
        // modifier("!skillcheck(dex, Miguel, 5 : 12 : 15 : 20)");
        // modifier("!This is a normal input!");
        // modifier(
        //     "abc !addNPC(Zuibroldun Jodem, str=12, dex = 5, magic = 11, fire's force=3, $Gigantic horn) def"
        // );
        // modifier(
        //     "Zuibroldun Jodem tries to die. !skillcheck(dex, Zuibroldun Jodem, 5 = lol : 10 = lmao, it 'Works. Hi 5. : 20 = You're losing.) Paparapapa."
        // );
        // modifier("!skillcheck(magic, Miguel, 3)");
        // modifier("!levelStats(Miguel, str +4, magic+ 3, dex + 3)");
        // modifier("!sattack(Zuibroldun Jodem, str, Miguel, magic, magic)");
        // modifier("Setting stats... !setStats(Miguel, magic=120) Stats set");
        // modifier("!showstats(Miguel)");
        // modifier("!battle((Zuibroldun Jodem, Librun), (Miguel))");
        // modifier(
        //     "Miguel throws a rock at Zuibroldun Jodem. (Zuibroldun Jodem)"
        // );
        // modifier("Escape!");
        // modifier("!attack(Miguel, magic, Zuibroldun Jodem, str)");
        // modifier("!showstats(Zuibroldun Jodem)");
        // modifier("!attack(Librun, magic, Zuibroldun Jodem, str)");
        // modifier("!skillcheck(str, Zuibroldun Jodem, 5)");
        // modifier(
        //     "Miguel felt guilty about what he has done. !revive(Miguel, Zuibroldun Jodem, 10)"
        // );
        // modifier("!heal(Zuibroldun Jodem, 100)");
        // modifier("!levelStats(Zuibroldun Jodem, fire's force + 2)");
        // modifier("!additem(Giant horn)");
        // for (let i = 0; i < 30; ++i) modifier("!heal(Librun, 10:50)");
        /*modifier("!getState()");
  console.log("\n\n\n");
  modifier('!setState({"dice":10})');*/
    }
    //!CLI
    if (CLI) {
        const prompt = require("prompt-sync")();
        console.log("Now you can use CLI.\nTo exit send 'q'.");
        let input = prompt("");
        while (input !== "q") {
            modifier(input);
            input = prompt("");
        }
    }
}
