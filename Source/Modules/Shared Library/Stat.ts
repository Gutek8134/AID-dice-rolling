import { state } from "../proxy_state";
import { isInStats, experienceCalculation } from "./Utils";
import { levellingToOblivion } from "../Input Modifier/constants";

export class Stat {
    level: number;
    experience?: number;
    expToNextLvl?: number;
    type: "character" | "item" | "stat";
    [key: string]: number | string | (() => string);

    constructor(name: string, level?: number) {
        if (!isInStats(name)) {
            state.stats.push(name);
        }
        this.level = level ?? state.startingLevel;
        if (levellingToOblivion) {
            this.experience = 0;
            this.expToNextLvl = experienceCalculation(this.level);
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
