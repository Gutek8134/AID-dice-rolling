import createEffect from "../../../../Input Modifier/Commands/createEffect";
import { Effect } from "../../../../Shared Library/Effect";
import { EffectToString } from "../../../../Shared Library/Utils";
import { state } from "../../../../proxy_state";

describe("Command create effect", () => {
    it("Invalid args error", () => {
        expect(
            createEffect("aaa,eee,iii,uuu,-69", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Create Effect: Arguments were not given in proper format."
        );
        state.message = "";
    });

    it("Effect already exists error", () => {
        state.effects = {
            bleeding: new Effect(
                "bleeding",
                [],
                1,
                "attack",
                "enemy",
                "continuous"
            ),
        };
        createEffect("bleeding, 5, hp=-2, a, t", [0, 0], "");
        expect(state.message).toEqual(
            "Create Effect: Effect bleeding already exists."
        );
        state.message = "";
    });

    it("Stat doesn't exist error", () => {
        state.effects = {};
        state.stats = [];
        state.inventory = [];
        createEffect("name, 6, Some Stat=1", [0, 0], "");
        expect(state.message).toEqual(
            "\nCreate Effect: Stat Some Stat does not exist."
        );
        state.message = "";

        expect(state.effects).toEqual({});
    });

    it("Restricted name error", () => {
        state.stats = [];
        state.effects = {};
        createEffect("stick, 2, skillpoints=1, level=-1, hp=-3", [], "");
        expect(state.message).toEqual(
            "\nCreate Effect: skillpoints cannot be set.\nCreate Effect: level cannot be set."
        );
        state.message = "";
    });

    it("Should create specified effect", () => {
        state.stats = ["int", "str"];
        state.effects = {};
        expect(
            createEffect(
                "curse of knowledge, 2, int=10, str = -2, b, self, c",
                [0, 0],
                "Test message"
            )
        ).toEqual(`
Effect curse of knowledge created with attributes:
${EffectToString(state.effects["curse of knowledge"])}.`);

        const expected: any = {
            name: "curse of knowledge",
            modifiers: {
                int: 10,
                str: -2,
            },
            baseDuration: 2,
            durationLeft: 2,
            applyUnique: false,
            appliedOn: "battle start",
            appliedTo: "self",
            impact: "continuous",
            type: "effect",
        };

        for (const key in expected) {
            expect(state.effects["curse of knowledge"]).toHaveProperty(key);
            expect(state.effects["curse of knowledge"][key]).toEqual(
                expected[key]
            );
        }
    });
});
