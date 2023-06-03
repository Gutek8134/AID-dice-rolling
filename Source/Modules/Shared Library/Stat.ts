import { state } from "../Tests/proxy_state.ts";

export class Stat {
    level: number;
    experience: number = 0;
    expToNextLvl: number = 0;
    type?: "character" | "item" | "stat";

    constructor(name: string, level: number) {
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

    toString() {
        return `level = ${this.level} exp = ${this.experience} exp to lvl up=${
            this.expToNextLvl
        }(${this.expToNextLvl - this.experience})`;
    }
}
