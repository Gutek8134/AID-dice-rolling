import gainItem from "../../../../Input Modifier/Commands/gainItem";
import { Character } from "../../../../Shared Library/Character";
import { Item } from "../../../../Shared Library/Item";
import { state } from "../../../../proxy_state";

describe("Command gain item", () => {
    it("Invalid args error", () => {
        expect(gainItem("", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual("Gain Item: No arguments found.");

        expect(gainItem("----;", [0, 0], "Test message")).toEqual(
            "Test message"
        );
        expect(state.message).toEqual(
            "Gain Item: Arguments were not given in proper format."
        );
    });

    it("Nonexistent item error", () => {
        state.items = { "Staff of Zalos": new Item("Staff of Zalos", []) };

        let commandArguments = "Staff Zalos";
        let input = `Test !gainItem(${commandArguments}) message`;
        expect(gainItem(commandArguments, [0, 0], input)).toEqual(input);
        expect(state.message).toEqual(
            "Gain Item: Item Staff Zalos doesn't exist."
        );
    });

    it("Nonexistent character error", () => {
        state.characters = { Zuibroldun: new Character() };
        state.items = { "Staff of Zalos": new Item("Staff of Zalos", []) };

        const commandArguments = "Staff of Zalos, Miguel";
        const input = `Test !gainItem(${commandArguments}) message`;
        expect(gainItem(commandArguments, [0, 0], input)).toEqual(input);
        expect(state.message).toEqual(
            "Gain Item: Character Miguel doesn't exist."
        );
    });

    it("Should put item into inventory", () => {
        state.items = {
            "Staff of Zalos": new Item("Staff of Zalos", []),
        };
        state.inventory = [];

        const commandArguments = "Staff of Zalos";
        const input = `Test !gainItem(${commandArguments}) message`;
        expect(gainItem(commandArguments, [0, 0], input)).toEqual(
            "Item Staff of Zalos was put into inventory."
        );
        expect(state.inventory).toContain("Staff of Zalos");
    });

    it("Should instantly equip item", () => {
        state.characters = { Zuibroldun: new Character() };
        state.items = { "Staff of Zalos": new Item("Staff of Zalos", []) };

        const commandArguments = "Staff of Zalos, Zuibroldun";
        const input = `Test !gainItem(${commandArguments}) message`;
        expect(gainItem(commandArguments, [0, 0], input)).toEqual(
            "\nCharacter Zuibroldun equipped Staff of Zalos."
        );
        expect(state.characters.Zuibroldun.items["artifact"]).toEqual(
            state.items["Staff of Zalos"]
        );
    });
});
