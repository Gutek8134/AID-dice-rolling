import { restrictedStatNames } from "../Input Modifier/constants";
import { state } from "../proxy_state";
import { Effect } from "./Effect";
import { Item } from "./Item";
import { Stat } from "./Stat";
import {
    experienceCalculation,
    CharacterToString,
    ElementInArray,
} from "./Utils";

//Blank character with starting level stats
export class Character {
    //Type declarations
    hp: number;
    level: number;
    experience: number;
    expToNextLvl: number;
    skillpoints: number;
    items: { [key: string]: Item };
    type: "character" | "item" | "stat";
    isNpc: boolean;
    stats: { [key: string]: Stat } = {};
    // Marked as possibly undefined for backwards compatibility
    activeEffects?: Effect[] = [];
    [key: string]:
        | number
        | boolean
        | "character"
        | "item"
        | "stat"
        | Effect[]
        | (() => string)
        | { [key: string]: Item }
        | { [key: string]: Stat };

    constructor(
        initialStats: [string, number][] = [],
        initialItemNames: string[] = []
    ) {
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
                if (ElementInArray(name, restrictedStatNames)) {
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
                const item: Item = state.items[name];
                this.items[item.slot] = item;
            }
        }

        //No overrides for these starting values
        this.experience = 0;
        this.expToNextLvl = experienceCalculation(this.level);
        this.skillpoints = 0;
        this.type = "character";
        this.isNpc = false;
    }

    toString(): string {
        return CharacterToString(this);
    }
}

export class NPC extends Character {
    constructor(
        initialStats: Array<[string, number]> = [],
        initialItemNames: string[] = []
    ) {
        super(initialStats, initialItemNames);
        this.isNpc = true;
    }
}
