export class Item {
    //slot - string representing slot name
    slot: string = "artifact";
    effects: string[];
    modifiers: { [key: string]: number };
    name: string;
    type: "character" | "item" | "stat";
    [key: string]: string | string[] | { [key: string]: number };

    constructor(name: string, values: [string, string | number][]) {
        this.effects = [];

        this.modifiers = {};

        if (values !== undefined) {
            //el in format ["slot/stat", "equipmentPart"/statObj]
            //Sanitized beforehand
            for (const [name, value] of values) {
                //Slot and effects are strings, everything else must be a number
                //Until buffs and debuffs will be extended to items
                if (name === "slot") {
                    this.slot = String(value);
                    continue;
                }
                if (name === "effect") {
                    this.effects.push(String(value));
                    continue;
                }
                //It's not slot name nor effect, so it's a stat modifier
                this.modifiers[name] = Number(value);
            }
        }

        this.name = name;

        //Since you can't save object type to JSON, this has to do (just in case)
        this.type = "item";
    }
}
