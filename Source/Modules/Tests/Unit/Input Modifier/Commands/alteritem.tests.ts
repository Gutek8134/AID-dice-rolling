import alterItem from "../../../../Input Modifier/Commands/alterItem";
import { DEBUG } from "../../../../Input Modifier/modifier";
import { Effect } from "../../../../Shared Library/Effect";
import { Item } from "../../../../Shared Library/Item";
import { EffectToString } from "../../../../Shared Library/Utils";
import { state } from "../../../../proxy_state";

describe("Command alter item", () => {
    beforeEach(() => (state.message = ""));

    it("Invalid args error", () => {
        expect(
            alterItem("aaa,eee,iii,uuu,-69", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Alter Item: Arguments were not given in proper format."
        );
    });

    it("Stat doesn't exist error", () => {
        state.items = { stick: new Item("stick", []) };
        state.stats = [];
        state.inventory = [];
        alterItem("stick, slot, Some Stat=1", [0, 0], "");
        expect(state.message).toEqual(
            "Alter Item: Stat Some Stat does not exist."
        );

        expect(state.items).toEqual({ stick: new Item("stick", []) });
        expect(state.inventory).toEqual([]);
    });

    it("Item doesn't exist error", () => {
        state.stats = ["int"];
        state.items = {};
        alterItem("stick, slot, int=1", [0, 0], "");
        expect(state.message).toEqual(
            "Alter Item: Item stick does not exist." + (DEBUG ? "\n" : "")
        );
    });

    it("Effect doesn't exist error", () => {
        state.stats = ["int"];
        state.effects = {};
        state.items = { stick: new Item("stick", []) };
        alterItem("stick, slot, int=1, random effect name", [0, 0], "");
        expect(state.message).toEqual(
            "\nAlter Item: Effect random effect name does not exist."
        );
        state.message = "";
    });

    it("Restricted name error", () => {
        state.stats = [];
        state.items = { stick: new Item("stick", []) };
        state.message = "";
        alterItem("stick, slot, hp=2, skillpoints=1", [], "");
        expect(state.message).toEqual(
            "\nAlter Item: hp cannot be altered.\nAlter Item: skillpoints cannot be altered."
        );
    });

    it("Should alter item's attributes", () => {
        state.stats = ["str", "wizardry"];
        state.effects = {
            bleeding: new Effect(
                "bleeding",
                [],
                0,
                "not applied",
                "enemy",
                "every turn"
            ),
        };
        state.items = {
            stick: new Item("stick", [
                ["slot", "head"],
                ["int", 1],
                ["wizardry", 5],
            ]),
        };
        const oldAttributes = `stick:
slot: head
int: 1
wizardry: 5
Effects:
none`;
        alterItem("stick, weapon, str = 1, wizardry = 0, bleeding", [0, 0], "");
        expect(state.out).toEqual(
            `
stick's attributes has been altered
from
${oldAttributes}
to
stick:
slot: weapon
int: 1
str: 1
Effects:
${EffectToString(state.effects["bleeding"])}.`
        );
    });
});
