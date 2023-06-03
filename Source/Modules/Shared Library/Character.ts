import { state } from "../Tests/proxy_state";
import { Item } from "./Item";
import { Stat } from "./Stat";
import { experienceCalculation, CharToString } from "./Utils";

//Blank character with starting level stats
export class Character {
    //Type declarations
    hp: number;
    level: number;
    experience: number;
    expToNextLvl: number;
    skillpoints: number;
    items: { [key: string]: Item };
    type?: "character" | "item" | "stat";
    isNpc: boolean;
    stats: { [key: string]: Stat } = {};

    constructor(values: Array<[string, any]>, itemNames: string[]) {
        //Initializes every previously created stat
        state.stats.forEach((stat) => {
            this.stats[stat] = new Stat(stat, state.startingLevel);
        });

        //Initializes hp and character level
        this.hp = state.startingHP;
        this.level = 1;

        //Null check, just to be sure
        if (values !== undefined) {
            //el in format ["attribute/stat", value], because I didn't like converting array to object
            //Sanitized beforehand
            for (const el of values) {
                //Hp and level need to be double checked to not make a stat of them
                if (el[0] === "hp") {
                    this.hp = el[1];
                    continue;
                }
                if (el[0] === "level") {
                    this.level = el[1];
                    continue;
                }
                //It's not hp, level, nor item, so it might as well be a stat
                this.stats[el[0]] = new Stat(el[0], el[1]);
            }
        }

        this.items = {};

        // console.log("Items:", items);
        if (itemNames[0] !== "") {
            for (let name of itemNames) {
                // console.log("item:", el);
                const item: Item = state.items[name.substring(1)];
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

    toString() {
        return CharToString(this);
    }
}

export class NPC extends Character {
    constructor(values: Array<[string, any]>, items: string[]) {
        super(values, items);
        this.isNpc = true;
    }
}
