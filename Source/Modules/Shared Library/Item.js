"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
var Item = /** @class */ (function () {
    function Item(name, values) {
        //slot - string representing slot name
        this.slot = "artifact";
        this.effects = [];
        this.modifiers = {};
        if (values !== undefined) {
            //el in format ["slot/stat", "equipmentPart"/statObj]
            //Sanitized beforehand
            for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                var _a = values_1[_i], name_1 = _a[0], value = _a[1];
                //Slot and effects are strings, everything else must be a number
                //Until buffs and debuffs will be extended to items
                if (name_1 === "slot") {
                    this.slot = String(value);
                    continue;
                }
                if (name_1 === "effect") {
                    this.effects.push(String(value));
                    continue;
                }
                //It's not slot name nor effect, so it's a stat modifier
                this.modifiers[name_1] = Number(value);
            }
        }
        this.name = name;
        //Since you can't save object type to JSON, this has to do (just in case)
        this.type = "item";
    }
    return Item;
}());
exports.Item = Item;
