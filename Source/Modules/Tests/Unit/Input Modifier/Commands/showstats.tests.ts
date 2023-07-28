import showStats from "../../../../Input Modifier/Commands/showstats";
import { Character } from "../../../../Shared Library/Character";
import { CharacterToString } from "../../../../Shared Library/Utils";
import { state } from "../../../proxy_state";

describe("Command show stats", () => {
    it("Invalid args error", () => {
        expect(showStats("", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual(
            "Show Stats: Arguments were not given in proper format."
        );
    });

    it("Nonexistent character error", () => {
        showStats("Zuibroldun", [], "");
        expect(state.message).toEqual(
            "Show Stats: Character Zuibroldun doesn't exist."
        );
    });

    it("Should print out stats", () => {
        state.characters = {
            Zuibroldun: new Character([
                ["explosion", 10],
                ["fireproof", 6],
            ]),
        };

        showStats("Zuibroldun", [], "");

        expect(state.out).toEqual(
            `\nZuibroldun's current stats are:
${CharacterToString(state.characters.Zuibroldun)}.`
        );
    });
});
