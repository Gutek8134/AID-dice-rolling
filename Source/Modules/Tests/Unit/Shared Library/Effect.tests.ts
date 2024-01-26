import { Character } from "../../../Shared Library/Character";
import {
    Effect,
    InstanceEffect,
    RemoveEffect,
    RunEffect,
} from "../../../Shared Library/Effect";
import { state } from "../../../proxy_state";

describe("Effect related", () => {
    beforeEach(() => (state.effects = {}));
    it("Constructor", () => {
        let expected: {
            [key: string]:
                | string
                | number
                | boolean
                | { [key: string]: number };
        } = {
            name: "effect",
            modifiers: {},
            baseDuration: 3,
            durationLeft: 3,
            applyUnique: true,
            appliedOn: "not applied",
            appliedTo: "enemy",
            impact: "continuous",
            type: "effect",
        };
        let actual = new Effect(
            "effect",
            [],
            3,
            "not applied",
            "enemy",
            "continuous"
        );
        for (const key in expected) {
            expect(actual).toHaveProperty(key);
            expect(actual[key]).toEqual(expected[key]);
        }

        expected = {
            name: "effect",
            modifiers: { strength: 2, dexterity: -2 },
            baseDuration: 1,
            durationLeft: 1,
            applyUnique: false,
            appliedOn: "attack",
            appliedTo: "self",
            impact: "every turn",
            type: "effect",
        };
        actual = new Effect(
            "effect",
            [
                ["strength", 2],
                ["dexterity", -2],
            ],
            1,
            "attack",
            "self",
            "every turn",
            false
        );

        for (const key in expected) {
            expect(actual).toHaveProperty(key);
            expect(actual[key]).toEqual(expected[key]);
        }
    });

    it("Instancing", () => {
        state.characters = {};
        const originalCharacter = (state.characters["Zuibroldun"] =
            new Character());

        if (!originalCharacter.activeEffects)
            originalCharacter.activeEffects = [];

        const originalEffect = new Effect(
            "effect",
            [
                ["strength", 2],
                ["dexterity", -2],
            ],
            1,
            "attack",
            "self",
            "every turn",
            false
        );

        expect(InstanceEffect("Zuibroldun", originalEffect)).toEqual(
            "\nZuibroldun is now under influence of effect."
        );
        expect(originalCharacter.activeEffects[0]).not.toBe(originalEffect);
    });

    it("Removing", () => {
        state.characters = {};
        const originalCharacter = (state.characters["Zuibroldun"] =
            new Character());

        const originalEffect = new Effect(
            "effect",
            [
                ["strength", 2],
                ["dexterity", -2],
            ],
            1,
            "attack",
            "self",
            "every turn",
            false
        );

        originalCharacter.activeEffects = [{ ...originalEffect }];

        expect(RemoveEffect("Zuibroldun", "effect")).toEqual(
            "\nZuibroldun is no longer under influence of effect."
        );
        expect(originalCharacter.activeEffects).toEqual([]);
    });

    it("Running", () => {
        state.message = "";
        state.characters = {};
        state.characters["Zuibroldun"] = new Character([
            ["strength", 1],
            ["dexterity", 3],
        ]);

        RunEffect(
            "Zuibroldun",
            new Effect(
                "effect",
                [
                    ["strength", 2],
                    ["dexterity", -2],
                ],
                1,
                "attack",
                "self",
                "every turn",
                false
            )
        );
        expect(state.message).toEqual(
            "\nZuibroldun gained 2 strength, currently has 3.\nZuibroldun lost 2 dexterity, currently has 1.\nDuration left of effect effect on Zuibroldun: 1."
        );
    });
});
