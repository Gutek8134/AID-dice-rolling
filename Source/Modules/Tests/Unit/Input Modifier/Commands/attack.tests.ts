import attack from "../../../../Input Modifier/Commands/attack";
import { Character } from "../../../../Shared Library/Character";
import { state } from "../../../proxy_state";

describe("Command attack", () => {
    it("Invalid args error", () => {
        expect(attack("", [0, 0], "Test message", "Test message")).toEqual(
            "Test message"
        );
        expect(state.message).toEqual(
            "Attack: Arguments were not given in proper format."
        );
    });

    it("Nonexistent stat error", () => {
        state.stats = ["fireproof", "explosion"];

        state.characters = {
            "Zuibroldun Jodem": new Character(),
            "Miguel Booble": new Character(),
        };

        expect(
            attack(
                "explosion, Zuibroldun Jodem, Fireproof, Miguel Booble",
                [0, 0],
                "Test message",
                "Test message"
            )
        ).toEqual("Test message");

        expect(state.message).toEqual(
            "Attack: Stat Fireproof was not created."
        );

        expect(
            attack(
                "Explosion, Zuibroldun Jodem, fire, Miguel Booble",
                [0, 0],
                "Test message",
                "Test message"
            )
        ).toEqual("Test message");

        expect(state.message).toEqual(
            "Attack: Stat Explosion was not created."
        );
    });

    it("Nonexistent characters error", () => {
        state.stats = ["fireproof", "explosion"];

        state.characters = {
            "Zuibroldun Jodem": new Character(),
            "Miguel Booble": new Character(),
        };

        expect(
            attack(
                "explosion, Zuibroldun Jodem, fireproof, Miguel Bootle",
                [0, 0],
                "Test message",
                "Test message"
            )
        ).toEqual("Test message");

        expect(state.message).toEqual(
            "Attack: Character Miguel Bootle does not exist."
        );

        expect(
            attack(
                "explosion, Zuibroldun, fireproof, Miguel Booble",
                [0, 0],
                "Test message",
                "Test message"
            )
        ).toEqual("Test message");

        expect(state.message).toEqual(
            "Attack: Character Zuibroldun does not exist."
        );
    });

    it("Should decrease defendant HP", () => {
        state.stats = ["fireproof", "explosion"];

        state.characters = {
            "Zuibroldun Jodem": new Character(),
            "Miguel Booble": new Character(),
        };

        const commandArguments =
            "explosion, Zuibroldun Jodem, fireproof, Miguel Booble";
        const input = `Test !attack(${commandArguments}) message.`;
        expect(
            attack(
                commandArguments,
                [13, 14 + commandArguments.length],
                input,
                input
            )
        ).toMatch(`Test message.
        Zuibroldun Jodem (explosion: 1) attacked Miguel Booble (fireproof: 1) dealing \\w+ damage (\\d+).
        Miguel Booble now has \\d+ hp.`);

        expect(state.characters["Miguel Booble"].hp).toBeLessThan(
            state.startingHP
        );
    });

    //TODO
    it("Should increase xp");

    it("Should increase level");

    it("Should kill the enemy");
});
