"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NPC = exports.Character = void 0;
var constants_1 = require("../Input Modifier/constants");
var proxy_state_1 = require("../Tests/proxy_state");
var Stat_1 = require("./Stat");
var Utils_1 = require("./Utils");
//Blank character with starting level stats
var Character = /** @class */ (function () {
    function Character(initialStats, initialItemNames) {
        if (initialStats === void 0) { initialStats = []; }
        if (initialItemNames === void 0) { initialItemNames = []; }
        var _this = this;
        this.stats = {};
        //Initializes every previously created stat
        proxy_state_1.state.stats.forEach(function (stat) {
            _this.stats[stat] = new Stat_1.Stat(stat, proxy_state_1.state.startingLevel);
        });
        //Initializes hp and character level
        this.hp = proxy_state_1.state.startingHP;
        this.level = 1;
        //Null check, just to be sure
        if (initialStats !== undefined && initialStats.length > 0) {
            //el in format ["attribute/stat", value], because I didn't like converting array to object
            //Sanitized beforehand
            for (var _i = 0, initialStats_1 = initialStats; _i < initialStats_1.length; _i++) {
                var _a = initialStats_1[_i], name_1 = _a[0], value = _a[1];
                //Hp and level need to be double checked to not make a stat of them
                if ((0, Utils_1.ElementInArray)(name_1, constants_1.restrictedStatNames)) {
                    this[name_1] = value;
                    continue;
                }
                //It's not hp, level, nor item, so it might as well be a stat
                else
                    this.stats[name_1] = new Stat_1.Stat(name_1, value);
            }
        }
        this.items = {};
        // console.log("Items:", items);
        if (initialItemNames &&
            initialItemNames[0] !== "" &&
            initialItemNames.length > 0) {
            for (var _b = 0, initialItemNames_1 = initialItemNames; _b < initialItemNames_1.length; _b++) {
                var name_2 = initialItemNames_1[_b];
                // console.log("item:", el);
                if (name_2[0] === "$")
                    name_2 = name_2.substring(1);
                var item = proxy_state_1.state.items[name_2];
                this.items[item.slot] = item;
            }
        }
        //No overrides for these starting values
        this.experience = 0;
        this.expToNextLvl = (0, Utils_1.experienceCalculation)(this.level);
        this.skillpoints = 0;
        this.type = "character";
        this.isNpc = false;
    }
    Character.prototype.toString = function () {
        return (0, Utils_1.CharacterToString)(this);
    };
    return Character;
}());
exports.Character = Character;
var NPC = /** @class */ (function (_super) {
    __extends(NPC, _super);
    function NPC(initialStats, initialItemNames) {
        if (initialStats === void 0) { initialStats = []; }
        if (initialItemNames === void 0) { initialItemNames = []; }
        var _this = _super.call(this, initialStats, initialItemNames) || this;
        _this.isNpc = true;
        return _this;
    }
    return NPC;
}(Character));
exports.NPC = NPC;
