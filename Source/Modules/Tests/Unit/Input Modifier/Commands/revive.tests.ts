import revive from "../../../../Input Modifier/Commands/revive";
import { Character } from "../../../../Shared Library/Character";
import { state } from "../../../proxy_state";

describe("Command revive", () => {
    it("Invalid args error", () => {
        expect(revive("", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual(
            "Revive: Arguments were not given in proper format."
        );
    });

    it("Nonexistent character error", () => {
        revive("Zuibroldun, Miguel, 10", [0, 0], "");
        expect(state.message).toEqual(
            "Revive: Reviving character doesn't exist."
        );

        state.characters = { Zuibroldun: new Character() };

        revive("Zuibroldun, Miguel, 10", [0, 0], "");
        expect(state.message).toEqual(
            "Revive: Revived character doesn't exist."
        );
    });

    it("Not enough hp error", () => {
        state.characters = { Zuibroldun: new Character() };
        state.characters.Zuibroldun.hp = 5;

        revive("Zuibroldun, Miguel, 10", [0, 0], "");
        expect(state.message).toEqual(
            "Revive: Reviving character would die if this action would be performed. Their hp is too low.\nRevive was not performed."
        );
    });

    it("Should transfuse hp", () => {
        state.characters = {
            Zuibroldun: new Character(),
            Miguel: new Character(),
        };
        revive("Zuibroldun, Miguel, 10", [0, 0], "");
        expect(state.out).toEqual(
            `Zuibroldun transfused 10 hp to Miguel. Resulting hp: Zuibroldun: 90, Miguel: 110.`
        );
    });

    it("Should revive", () => {
        state.characters = {
            Zuibroldun: new Character(),
            Miguel: new Character(),
        };
        state.characters.Miguel.hp = 0;
        revive("Zuibroldun, Miguel, 10", [0, 0], "");
        expect(state.out).toEqual(
            `Zuibroldun transfused 10 hp to Miguel, reviving Miguel. Resulting hp: Zuibroldun: 90, Miguel: 10.`
        );
    });
});
