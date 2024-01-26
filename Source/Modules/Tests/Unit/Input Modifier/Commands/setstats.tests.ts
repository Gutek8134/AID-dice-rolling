import setStats from "../../../../Input Modifier/Commands/setStats";
import { Character } from "../../../../Shared Library/Character";
import { state } from "../../../../proxy_state";

describe("Command set stats", () => {
    it("Invalid args error", () => {
        expect(setStats("", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual(
            "Set Stats: Arguments were not given in proper format."
        );
    });

    it("Nonexistent character error", () => {
        setStats("Zuibroldun, explosion= 10", [0, 0], "");
        expect(state.message).toEqual(
            "Set Stats: Character Zuibroldun doesn't exist."
        );
    });

    it("Should override character's stats", () => {
        state.characters = {
            Zuibroldun: new Character([
                ["explosion", 10],
                ["fireproof", 6],
            ]),
        };

        setStats("Zuibroldun, explosion=15, fireproof =2", [0, 0], "");

        expect(state.characters.Zuibroldun.stats["explosion"].level).toEqual(
            15
        );
        expect(state.characters.Zuibroldun.stats["fireproof"].level).toEqual(2);
    });
});
