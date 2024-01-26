import removeEffect from "../../../../Input Modifier/Commands/removeEffect";
import { Character } from "../../../../Shared Library/Character";
import { Effect } from "../../../../Shared Library/Effect";
import { CharacterToString } from "../../../../Shared Library/Utils";
import { state } from "../../../../proxy_state";

describe("Command remove effect", () => {
    beforeEach(() => (state.message = ""));
    it("Invalid args error", () => {
        expect(removeEffect("aaa, bbb, ccc", [0, 0], "Test message")).toEqual(
            "Test message"
        );
        expect(state.message).toEqual(
            "Remove Effect: Arguments were not given in proper format."
        );
    });

    it("Effect doesn't exist error", () => {
        state.effects = {};
        state.characters = {
            Zuibroldun: new Character(),
        };
        expect(
            removeEffect("bleeding, Zuibroldun", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Remove Effect: Effect bleeding does not exist."
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
            removeEffect("bleeding, Zuibroldun", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Remove Effect: Character Zuibroldun does not exist."
        );
    });

    it("Character is clean error", () => {
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
        state.characters = {
            Zuibroldun: new Character(),
        };

        expect(
            removeEffect("bleeding, Zuibroldun", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Remove Effect: Character Zuibroldun is not under influence of effect bleeding."
        );
    });

    it("Should remove one effect", () => {
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
        state.characters = {
            Zuibroldun: new Character(),
        };
        state.characters.Zuibroldun.activeEffects = [
            { ...state.effects.bleeding },
        ];

        expect(
            removeEffect("bleeding, Zuibroldun", [0, 0], "Test message")
        ).toEqual("Test message");

        expect(state.out).toEqual(`Effect bleeding removed from Zuibroldun.
Current Zuibroldun state:
${CharacterToString(state.characters.Zuibroldun)}`);

        expect(state.characters.Zuibroldun.activeEffects).not.toContainEqual(
            state.effects.bleeding
        );
    });

    it("Should remove all effects", () => {
        state.effects = {
            bleeding: new Effect(
                "bleeding",
                [],
                0,
                "not applied",
                "enemy",
                "every turn"
            ),
            heroism: new Effect(
                "heroism",
                [],
                0,
                "not applied",
                "enemy",
                "every turn"
            ),
            engineering: new Effect(
                "engineering",
                [],
                0,
                "not applied",
                "enemy",
                "every turn"
            ),
        };
        state.characters = {
            Zuibroldun: new Character(),
        };
        state.characters.Zuibroldun.activeEffects = [
            {
                ...state.effects.bleeding,
                ...state.effects.heroism,
                ...state.effects.engineering,
            },
        ];

        expect(removeEffect("all, Zuibroldun", [0, 0], "Test message")).toEqual(
            "Test message"
        );

        expect(state.out)
            .toEqual(`All effects have been removed from Zuibroldun.
Current Zuibroldun state:
${CharacterToString(state.characters.Zuibroldun)}`);

        expect(state.characters.Zuibroldun.activeEffects).toEqual([]);
    });
});
