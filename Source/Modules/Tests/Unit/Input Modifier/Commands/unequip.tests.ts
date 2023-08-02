import unequip from "../../../../Input Modifier/Commands/unequip";
import { Character } from "../../../../Shared Library/Character";
import { Item } from "../../../../Shared Library/Item";
import { ElementInArray } from "../../../../Shared Library/Utils";
import { state } from "../../../proxy_state";

describe("Command unequip", () => {
    it("Invalid args error", () => {
        expect(unequip("", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual(
            "Unequip: Arguments were not given in proper format."
        );
    });

    it("Nonexistent character error", () => {
        expect(unequip("Zuibroldun, all", [0, 0], "Test message")).toEqual(
            "Test message"
        );
        expect(state.message).toEqual(
            "Unequip: Character Zuibroldun doesn't exist."
        );
    });

    it("Should unequip items", () => {
        state.items = {
            "Staff of Zalos": new Item("Staff of Zalos", []),
            stick: new Item("stick", [["slot", "weapon"]]),
            helmet: new Item("helmet", [["slot", "helmet"]]),
        };

        state.characters = {
            Zuibroldun: new Character(
                [],
                ["Staff of Zalos", "stick", "helmet"]
            ),
        };

        console.log(Object.keys(state.characters).join(", "));
        expect(
            ElementInArray("Zuibroldun", Object.keys(state.characters))
        ).toBeTruthy();
        const cache = unequip("Zuibroldun, artifact", [0, 0], "");
        expect(state.message).toEqual("");
        expect(cache).toEqual("\nZuibroldun unequipped Staff of Zalos.");
        expect(state.characters.Zuibroldun.items["artifact"]).toBeUndefined();

        state.characters.Zuibroldun.items["artifact"] =
            state.items["Staff of Zalos"];

        expect(unequip("Zuibroldun, helmet, weapon", [0, 0], "")).toEqual(
            "\nZuibroldun unequipped helmet.\nZuibroldun unequipped stick."
        );

        expect(state.characters.Zuibroldun.items["helmet"]).toBeUndefined();
        expect(state.characters.Zuibroldun.items["weapon"]).toBeUndefined();

        state.characters.Zuibroldun.items["helmet"] = state.items["helmet"];
        state.characters.Zuibroldun.items["weapon"] = state.items["stick"];

        expect(unequip("Zuibroldun, all", [0, 0], "")).toEqual(
            "\nZuibroldun unequipped Staff of Zalos.\nZuibroldun unequipped helmet.\nZuibroldun unequipped stick."
        );

        expect(state.characters.Zuibroldun.items["artifact"]).toBeUndefined();
        expect(state.characters.Zuibroldun.items["helmet"]).toBeUndefined();
        expect(state.characters.Zuibroldun.items["weapon"]).toBeUndefined();
    });
});
