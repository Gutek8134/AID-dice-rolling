"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetFixedRollOutcome = exports.SetDisableDodge = exports.ElementInArray = exports.CharLives = exports.ItemToString = exports.CharacterToString = exports._equip = exports.diceRoll = exports.isInStats = exports.experienceCalculation = exports.dodge = exports.damage = void 0;
var proxy_state_1 = require("../Tests/proxy_state");
var constants_1 = require("../Input Modifier/constants");
//!Function for calculating damage. Adjust it to your heart's content.
//!Just make sure it won't divide by 0 (finally putting all the hours spent on learning math in high school to good use).
var damage = function (attackStat, defenseStat) {
    var dam = 
    /*You can edit from here*/ attackStat +
        (0, exports.diceRoll)(20) -
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
    if (dam < 0)
        dam = 0;
    return dam;
};
exports.damage = damage;
var dodge = function (attackStat, dodgeStat) {
    if (disableDodge)
        return false;
    var dodged = 
    /*You can edit from here*/
    attackStat + (0, exports.diceRoll)(5) < dodgeStat + (0, exports.diceRoll)(5);
    /*to here*/
    //attackStat means attacker's statistic picked on calling !attack()
    //dodgeStat is accordingly, defender's statistic used for dodge
    //diceRoll(n) rolls an n-sided dice with values from 1 to n
    //Use only natural numbers, as the script will break otherwise
    //You must write an equal (a == b) [yes, you have to use two "=" signs for it], more than (a > b), less than (a < b), more or equal to (a >= b), or less or equal to (a <= b) expression
    return dodged;
};
exports.dodge = dodge;
//!Function for calculating experience needed to level up. Adjust it to your heart's content
var experienceCalculation = function (level) {
    //level is the current character/stat's level
    var experience = /*You can edit from here*/ 2 * level; /*to here*/
    return experience;
};
exports.experienceCalculation = experienceCalculation;
var isInStats = function (name) {
    return proxy_state_1.state.stats.indexOf(name) > -1;
};
exports.isInStats = isInStats;
/**Generates a value between 1 and maxValue*/
var diceRoll = function (maxValue) {
    if (overrideRollOutcome)
        return overrideValue;
    return Math.floor(Math.random() * maxValue) + 1;
};
exports.diceRoll = diceRoll;
/**Equips item for a character and removes it from state.inventory*/
var _equip = function (characterName, item, modifiedText) {
    //Grabs character
    var character = proxy_state_1.state.characters[characterName];
    //If character has an already equipped item, it is put back into inventory
    if (character.items[item.slot]) {
        modifiedText += "\nCharacter ".concat(characterName, " unequipped ").concat(character.items[item.slot].name, ".");
        proxy_state_1.state.inventory.push(character.items[item.slot].name);
    }
    //Puts the item onto character's slot and removes them from inventory
    character.items[item.slot] = item;
    modifiedText += "\nCharacter ".concat(characterName, " equipped ").concat(item.name, ".");
    if ((0, exports.ElementInArray)(item.name, proxy_state_1.state.inventory))
        proxy_state_1.state.inventory.splice(proxy_state_1.state.inventory.indexOf(item.name), 1);
    return modifiedText;
};
exports._equip = _equip;
var CharacterToString = function (character) {
    var temp = constants_1.levellingToOblivion
        ? "hp: ".concat(character.hp, ",\nisNPC: ").concat(character.isNpc, ",\n")
        : "hp: ".concat(character.hp, ",\nlevel: ").concat(character.level, ",\nskillpoints: ").concat(character.skillpoints, ",\nexperience: ").concat(character.experience, ",\nto level up: ").concat(character.expToNextLvl, "(need ").concat(character.expToNextLvl - character.experience, " more),\nisNPC: ").concat(character.isNpc, ",\n");
    for (var key in character.stats) {
        var value = character.stats[key];
        if (constants_1.levellingToOblivion &&
            value.expToNextLvl !== undefined &&
            value.experience !== undefined) {
            temp += "".concat(key, ": level=").concat(value.level, ", exp=").concat(value.experience, ", to lvl up=").concat(value.expToNextLvl, "(need ").concat(value.expToNextLvl - value.experience, " more),\n");
        }
        else {
            temp += "".concat(key, ": ").concat(value.level, ",\n");
        }
    }
    temp += "\nItems:";
    if (Object.keys(character.items).length > 0)
        for (var _i = 0, _a = Object.keys(character.items); _i < _a.length; _i++) {
            var el = _a[_i];
            var item = character.items[el];
            temp += "\n".concat((0, exports.ItemToString)(item), ",\n");
        }
    else
        temp += "\nnone  ";
    return temp.substring(0, temp.length - 2) == ""
        ? "none"
        : temp.substring(0, temp.length - 2);
};
exports.CharacterToString = CharacterToString;
var ItemToString = function (item) {
    if (!item)
        return "none";
    var temp = "".concat(item.name, ":\nslot: ").concat(item.slot, "\n");
    for (var _i = 0, _a = Object.keys(item.modifiers); _i < _a.length; _i++) {
        var key = _a[_i];
        temp += "".concat(key, ": ").concat(item.modifiers[key], "\n");
    }
    return temp.substring(0, temp.length - 1);
};
exports.ItemToString = ItemToString;
//Returns whether character exists and has more than 0 HP
var CharLives = function (character) {
    if (!(0, exports.ElementInArray)(character, Object.keys(proxy_state_1.state.characters)))
        return false;
    return proxy_state_1.state.characters[character].hp > 0;
};
exports.CharLives = CharLives;
var ElementInArray = function (element, array) {
    return array.indexOf(element) > -1;
};
exports.ElementInArray = ElementInArray;
//Debug purposes only
var disableDodge = false;
var overrideRollOutcome = false;
var overrideValue;
var SetDisableDodge = function (newValue) {
    disableDodge = newValue;
};
exports.SetDisableDodge = SetDisableDodge;
var SetFixedRollOutcome = function (shouldOverride, newValue) {
    if (shouldOverride && newValue) {
        overrideRollOutcome = true;
        overrideValue = newValue;
    }
    else if (!shouldOverride) {
        overrideRollOutcome = false;
    }
};
exports.SetFixedRollOutcome = SetFixedRollOutcome;
