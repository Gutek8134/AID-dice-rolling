import applyEffect from "../../../../Input Modifier/Commands/applyEffect";
import { Character } from "../../../../Shared Library/Character";
import { Effect } from "../../../../Shared Library/Effect";
import { CharacterToString } from "../../../../Shared Library/Utils";
import { state } from "../../../../proxy_state";

describe("Command apply effect", () => {
    it("Invalid args error", () => {
        expect(applyEffect("aaa, bbb, ccc", [0, 0], "Test message")).toEqual(
            "Test message"
        );
        expect(state.message).toEqual(
            "Apply Effect: Arguments were not given in proper format."
        );
    });

    it("Effect doesn't exist error", () => {
        state.effects = {};
        state.characters = {
            Zuibroldun: new Character(),
        };
        expect(
            applyEffect("bleeding, Zuibroldun", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Apply Effect: Effect bleeding does not exist."
        );
    });

    it("Character doesn't exist error", () => {
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
        state.characters = {};
        expect(
            applyEffect("bleeding, Zuibroldun", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Apply Effect: Character Zuibroldun does not exist."
        );
    });

    it("Unique effect already applied error", () => {
        state.effects = {
            bleeding: new Effect(
                "bleeding",
                [],
                0,
                "not applied",
                "enemy",
                "every turn",
                true
            ),
        };
        state.characters = {
            Zuibroldun: new Character(),
        };
        state.characters.Zuibroldun.activeEffects = [
            { ...state.effects.bleeding },
        ];

        expect(
            applyEffect("bleeding, Zuibroldun", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Apply Effect: Effect bleeding was not applied to Zuibroldun. Reason: unique effect already applied."
        );
    });

    it("Should apply effect", () => {
        state.effects = {
            bleeding: new Effect(
                "bleeding",
                [],
                0,
                "not applied",
                "enemy",
                "every turn",
                true
            ),
        };
        state.characters = {
            Zuibroldun: new Character(),
        };

        expect(
            applyEffect("bleeding, Zuibroldun", [0, 0], "Test message")
        ).toEqual("Test message");

        expect(state.out).toEqual(`Effect bleeding applied to Zuibroldun.
Current Zuibroldun state:
${CharacterToString(state.characters.Zuibroldun)}`);

        expect(state.characters.Zuibroldun.activeEffects).toContainEqual(
            state.effects.bleeding
        );
    });
});
