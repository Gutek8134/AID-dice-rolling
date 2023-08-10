import heal from "../../../../Input Modifier/Commands/heal";
import { Character } from "../../../../Shared Library/Character";
import { state } from "../../../proxy_state";

describe("Command heal", () => {
    it("Invalid args error", () => {
        expect(heal("", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual(
            "Heal: Arguments were not given in proper format."
        );
    });

    it("Nonexistent character error", () => {
        state.characters = {
            "Miguel Booble": new Character(),
        };

        heal("Miguel Bootle, 10", [0, 0], "Test message");

        expect(state.message).toEqual(
            "Heal: Character Miguel Bootle does not exist."
        );

        heal("Miguel, 10", [0, 0], "Test message");

        expect(state.message).toEqual("Heal: Character Miguel does not exist.");
    });

    it("Character is dead error", () => {
        state.characters = {
            Zuibroldun: new Character(),
        };

        state.characters.Zuibroldun.hp = 0;

        heal("Zuibroldun, 10", [0, 0], "Test message");

        expect(state.message).toEqual(
            "Heal: Dead characters must be revived before healing."
        );
    });

    it("Should heal character by constant value", () => {
        for (let i = 0; i < 100; i++) {
            state.characters = {
                Zuibroldun: new Character(),
            };

            state.characters.Zuibroldun.hp = 100;

            heal("Zuibroldun, 10", [0, 0], "Test message");

            expect(state.characters.Zuibroldun.hp).toEqual(110);
            expect(state.out).toEqual(
                "Character Zuibroldun was healed by 10 hp. Current hp: 110."
            );
        }
    });

    it("Should heal character by random value 1-n", () => {
        for (let i = 0; i < 100; i++) {
            state.characters = {
                Zuibroldun: new Character(),
            };

            state.characters.Zuibroldun.hp = 100;

            heal("Zuibroldun, d10", [0, 0], "Test message");

            expect(state.characters.Zuibroldun.hp).toBeLessThanOrEqual(110);
            expect(state.characters.Zuibroldun.hp).not.toBeLessThanOrEqual(100);
            expect(state.out).toMatch(
                /Character Zuibroldun was healed by \d{1,2} hp\. Current hp: 1\d{2}\./
            );
        }
    });

    it("Should heal character by random value n-m", () => {
        for (let i = 0; i < 100; i++) {
            state.characters = {
                Zuibroldun: new Character(),
            };

            state.startingHP = 100;

            heal("Zuibroldun, 10 : 30", [0, 0], "Test message");

            expect(state.characters.Zuibroldun.hp).toBeLessThanOrEqual(130);
            expect(state.characters.Zuibroldun.hp).not.toBeLessThan(110);
            expect(state.out).toMatch(
                /Character Zuibroldun was healed by \d{2} hp\. Current hp: 1\d{2}\./
            );
        }
    });
});
