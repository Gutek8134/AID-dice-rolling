import equip from "../../../../Input Modifier/Commands/equip";
import { Character } from "../../../../Shared Library/Character";
import { Item } from "../../../../Shared Library/Item";
import { state } from "../../../proxy_state";

describe("Command equip", () => {
    it("Invalid args error", () => {
        expect(equip("", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual("Equip: No arguments found.");

        expect(equip("yololo", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual(
            "Equip: Arguments were not given in proper format."
        );
    });

    it("Nonexistent character error", () => {
        state.characters = { Zuibroldun: new Character() };
        state.items = { "Staff of Zalos": new Item("Staff of Zalos", []) };
        state.inventory = ["Staff of Zalos"];

        const commandArguments = "Miguel, Staff of Zalos";
        const input = `Test !equip(${commandArguments}) message`;
        expect(equip(commandArguments, [0, 0], input)).toEqual(input);
        expect(state.message).toEqual(
            "Equip Item: Character Miguel doesn't exist."
        );
    });

    it("Nonexistent item error", () => {
        state.characters = { Zuibroldun: new Character() };
        state.items = { "Staff of Zalos": new Item("Staff of Zalos", []) };
        state.inventory = ["Staff of Zalos"];

        let commandArguments = "Zuibroldun, Staff of Zalos, Staff Zalos";
        let input = `Test !equip(${commandArguments}) message`;
        expect(equip(commandArguments, [0, 0], input)).toEqual(input);
        expect(state.message).toEqual(
            "Equip Item: Item Staff Zalos doesn't exist."
        );

        commandArguments = "Zuibroldun, Staff Zalos";
        input = `Test !equip(${commandArguments}) message`;
        expect(equip(commandArguments, [0, 0], input)).toEqual(input);
        expect(state.message).toEqual(
            "Equip Item: Item Staff Zalos doesn't exist."
        );
    });

    it("Item not in inventory error", () => {
        state.characters = { Zuibroldun: new Character() };
        state.items = { "Staff of Zalos": new Item("Staff of Zalos", []) };
        state.inventory = [];

        let commandArguments = "Zuibroldun, Staff of Zalos";
        let input = `Test !equip(${commandArguments}) message`;
        expect(equip(commandArguments, [0, 0], input)).toEqual(input);
        expect(state.message).toEqual(
            "Equip Item: You don't have item Staff of Zalos in your inventory."
        );
    });

    it("Should equip the item(s)", () => {
        state.characters = { Zuibroldun: new Character() };
        state.items = {
            "Staff of Zalos": new Item("Staff of Zalos", []),
            stick: new Item("stick", [["slot", "weapon"]]),
        };
        state.inventory = ["Staff of Zalos", "stick"];

        let commandArguments = "Zuibroldun, Staff of Zalos";
        let input = `Test !equip(${commandArguments}) message`;
        expect(equip(commandArguments, [0, 0], input)).toEqual(`
        Character Zuibroldun equipped Staff of Zalos.
        Item successfully equipped.`);

        state.characters.Zuibroldun = new Character();
        state.inventory = ["Staff of Zalos", "stick"];

        commandArguments = "Zuibroldun, Staff of Zalos, stick";
        input = `Test !equip(${commandArguments}) message`;
        expect(equip(commandArguments, [0, 0], input)).toEqual(`
        Character Zuibroldun equipped Staff of Zalos.
        Character Zuibroldun equipped stick.
        Items successfully equipped.`);
    });

    it("Should unequip the item if present on the same slot", () => {
        state.items = {
            "Staff of Zalos": new Item("Staff of Zalos", [["slot", "weapon"]]),
            stick: new Item("stick", [["slot", "weapon"]]),
        };
        state.characters = { Zuibroldun: new Character([], []) };
        state.inventory = ["Staff of Zalos", "stick"];

        let commandArguments = "Zuibroldun, Staff of Zalos, stick";
        let input = `Test !equip(${commandArguments}) message`;
        expect(equip(commandArguments, [0, 0], input)).toEqual(`
        Character Zuibroldun equipped Staff of Zalos.
        Character Zuibroldun unequipped Staff of Zalos.
        Character Zuibroldun equipped stick.
        Items successfully equipped.`);

        state.characters.Zuibroldun = new Character([], ["stick"]);
        state.inventory = ["Staff of Zalos", "stick"];

        commandArguments = "Zuibroldun, Staff of Zalos";
        input = `Test !equip(${commandArguments}) message`;
        expect(equip(commandArguments, [0, 0], input)).toEqual(`
        Character Zuibroldun unequipped stick.
        Character Zuibroldun equipped Staff of Zalos.
        Item successfully equipped.`);
    });
});
