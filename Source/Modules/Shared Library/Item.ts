import { Stat } from "./Stat";

export class Item {
    //slot - string representing slot name
    slot: string = "artifact";
    effects: string[];
    modifiers: { [key: string]: Stat };
    name: string;
    type?: "character" | "item" | "stat";

    constructor(name: string, values: Array<[string, any]>) {
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
