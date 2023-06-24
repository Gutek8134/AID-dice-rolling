import { SetLevellingToOblivion } from "../../../Input Modifier/constants";
import { Character } from "../../../Shared Library/Character";
import { Item } from "../../../Shared Library/Item";
import {
    CharacterToString,
    ElementInArray,
    ItemToString,
    experienceCalculation,
} from "../../../Shared Library/Utils";
import { state } from "../../proxy_state";

describe("Utilities", () => {
    it("Element In Array", () => {
        expect(ElementInArray("a", ["c", "b", "d", "a"])).toStrictEqual(true);
        expect(ElementInArray(1, [3, 2, 5, 1])).toStrictEqual(true);
        expect(ElementInArray("a", ["c", 3, "d", "a"])).toStrictEqual(true);
        expect(ElementInArray("a", ["c", "b", "d"])).toStrictEqual(false);
        expect(ElementInArray(1, [3, 2, 5])).toStrictEqual(false);
        expect(ElementInArray("a", ["c", 3, "d"])).toStrictEqual(false);
    });

    it("Item To String", () => {
        let values: [string, string | number][] = [
            ["slot", "head"],
            ["dexterity", -5],
            ["nano machines", 3],
            ["effect", "bleeding"],
        ];
        expect(ItemToString(new Item("Staff of Zalos", values))).toStrictEqual(
            `Staff of Zalos:
            slot: head
            dexterity: -5
            nano machines: 3`
        );
    });

    it("Character To String - default character", () => {
        SetLevellingToOblivion(false);
        state.stats = [];
        state.startingHP = 100;
        state.startingLevel = 1;
        let character = new Character();
        expect(CharacterToString(character)).toEqual(
            `hp: 100,
            level: 1,
            skillpoints: 0,
            experience: 0,
            to level up: ${experienceCalculation(
                1
            )}(need ${experienceCalculation(1)} more)
            isNPC: false`
        );
        SetLevellingToOblivion(true);
    });
});
