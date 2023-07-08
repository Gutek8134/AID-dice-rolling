import alterItem from "../../../../Input Modifier/Commands/alterItem";
import { Item } from "../../../../Shared Library/Item";
import { ItemToString } from "../../../../Shared Library/Utils";
import { state } from "../../../proxy_state";

describe("Command alter item", () => {
    it("Invalid args error", () => {
        expect(
            alterItem("aaa,eee,iii,uuu,-69", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Alter Item: Arguments were not given in proper format."
        );
    });

    it("Stat doesn't exist error", () => {
        state.items = {};
        state.stats = [];
        state.inventory = [];
        alterItem("name, slot, Some Stat=1", [0, 0], "");
        expect(state.message).toEqual(
            "Alter Item: Stat Some Stat does not exist."
        );

        expect(state.items).toEqual({});
        expect(state.inventory).toEqual([]);
    });

    it("Item doesn't exist error", () => {
        state.items = {};
        alterItem("stick, slot, int=1", [0, 0], "");
        expect(state.message).toEqual("Alter Item: Item doesn't exist.");
    });

    it("Stat doesn't exist error", () => {
        state.stats = [];
        state.items = {};
        alterItem("stick, slot, int=1", [0, 0], "");
        expect(state.message).toEqual("Add Item: Stat int does not exist.");
    });

    it("Should alter item's attributes", () => {
        state.stats = [];
        state.items = {
            stick: new Item("stick", [
                ["slot", "head"],
                ["int", 1],
                ["wizardry", 5],
            ]),
        };
        const oldAttributes = `stick:
        slot: head,
        int: 1,
        wizardry: 5`;
        alterItem("stick, weapon, str = 1, wizardry = 0", [0, 0], "");
        expect(state.out).toEqual(
            `
            stick's attributes has been altered
            from
            ${oldAttributes}
            to
            stick:
            slot: head,
            int: 1
            str: 1.`
        );
    });
});
