import addItem from "../../../../Input Modifier/Commands/additem";
import { Character } from "../../../../Shared Library/Character";
import { Item } from "../../../../Shared Library/Item";
import { ItemToString } from "../../../../Shared Library/Utils";
import { state } from "../../../proxy_state";

describe("Command add item", () => {
    it("Invalid args error", () => {
        expect(addItem("", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual("Add Item: No arguments found.");
        expect(addItem("aaa,eee,iii,uuu,-69", [0, 0], "Test message")).toEqual(
            "Test message"
        );
        expect(state.message).toEqual(
            "Add Item: Arguments were not given in proper format."
        );
    });

    it("Stat doesn't exist error", () => {
        state.items = {};
        state.stats = [];
        state.inventory = [];
        addItem("name, slot, Some Stat=1", [0, 0], "");
        expect(state.message).toEqual(
            "Add Item: Stat Some Stat does not exist."
        );

        expect(state.items).toEqual({});
        expect(state.inventory).toEqual([]);
    });

    it("Equip errors", () => {
        state.items = {};
        state.stats = ["wizardry", "strength"];
        state.inventory = [];
        state.characters = {};

        expect(
            addItem(
                "Staff of Zalos, artifact, wizardry = 3, strength = -1, equip",
                [0, 0],
                "aaa !addItem(Staff of Zalos, artifact, wizardry = 3, strength = -1, equip) bbb"
            )
        ).toEqual(
            `aaa !addItem(Staff of Zalos, artifact, wizardry = 3, strength = -1, equip) bbb`
        );

        expect(state.message).toEqual(
            "Add Item: You must specify who will equip the item when you choose so."
        );

        expect(
            addItem(
                "Staff of Zalos, artifact, wizardry = 3, strength = -1, equip, Zuibroldun Jodem",
                [0, 0],
                "aaa !addItem(Staff of Zalos, artifact, wizardry = 3, strength = -1, equip, Zuibroldun Jodem) bbb"
            )
        ).toEqual(
            `aaa !addItem(Staff of Zalos, artifact, wizardry = 3, strength = -1, equip, Zuibroldun Jodem) bbb`
        );

        expect(state.message).toEqual(
            "Add Item: Character Zuibroldun Jodem doesn't exist."
        );

        expect(state.items).toEqual({});
        expect(state.inventory).toEqual([]);
    });

    it("Should only create item", () => {
        state.items = {};
        state.stats = ["wizardry", "strength"];
        state.inventory = [];

        const testItem = new Item("Staff of Zalos", [
            ["slot", "artifact"],
            ["wizardry", 3],
            ["strength", -1],
        ]);

        expect(
            addItem(
                "Staff of Zalos, artifact, wizardry = 3, strength = -1",
                [0, 0],
                "aaa !addItem(Staff of Zalos, artifact, wizardry = 3, strength = -1) bbb"
            )
        ).toEqual(
            `Item Staff of Zalos created with attributes ${ItemToString(
                testItem
            )}.`
        );

        expect(state.items).toContainEqual(testItem);
        expect(state.inventory).not.toContainEqual(testItem);
    });

    it("Should create item and put it to inventory", () => {
        state.items = {};
        state.stats = ["wizardry", "strength"];
        state.inventory = [];

        const testItem = new Item("Staff of Zalos", [
            ["slot", "artifact"],
            ["wizardry", 3],
            ["strength", -1],
        ]);

        expect(
            addItem(
                "Staff of Zalos, artifact, wizardry = 3, strength = -1, inventory",
                [0, 0],
                "aaa !addItem(Staff of Zalos, artifact, wizardry = 3, strength = -1, inventory) bbb"
            )
        ).toEqual(
            `Item Staff of Zalos created with attributes ${ItemToString(
                testItem
            )}.
            Item Staff of Zalos was put into inventory.`
        );

        expect(state.items).toContainEqual(testItem);
        expect(state.inventory).toContainEqual(testItem);
    });

    it("Should create item and equip it", () => {
        state.items = {};
        state.stats = ["wizardry", "strength"];
        state.inventory = [];
        state.characters = { "Zuibroldun Jodem": new Character() };

        const testItem = new Item("Staff of Zalos", [
            ["slot", "artifact"],
            ["wizardry", 3],
            ["strength", -1],
        ]);

        expect(
            addItem(
                "Staff of Zalos, artifact, wizardry = 3, strength = -1, equip, Zuibroldun Jodem",
                [0, 0],
                "aaa !addItem(Staff of Zalos, artifact, wizardry = 3, strength = -1, equip, Zuibroldun Jodem) bbb"
            )
        ).toEqual(
            `Item Staff of Zalos created with attributes ${ItemToString(
                testItem
            )}.
            Character Zuibroldun Jodem equipped Staff of Zalos.`
        );

        expect(state.items).toContainEqual(testItem);
        expect(state.inventory).toEqual({});
        expect(state.characters["Zuibroldun Jodem"].items).toEqual({
            "Staff of Zalos": testItem,
        });
    });
});
