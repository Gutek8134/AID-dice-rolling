import alterEffect from "../../../../Input Modifier/Commands/alterEffect";
import { Effect } from "../../../../Shared Library/Effect";
import { EffectToString } from "../../../../Shared Library/Utils";
import { state } from "../../../../proxy_state";

//TODO
describe("Command alter effect", () => {
    beforeEach(() => {
        state.message = "";
    });
    it("Invalid args error", () => {
        expect(
            alterEffect("aaa,eee,iii,uuu,-69", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Alter Effect: Arguments were not given in proper format."
        );
        state.message = "";
    });

    it("Effect doesn't exist error", () => {
        state.effects = {};
        alterEffect("bleeding, 5, hp=-2", [0, 0], "");
        expect(state.message).toEqual(
            "Alter Effect: Effect bleeding doesn't exist."
        );
        state.message = "";
    });

    it("Stat doesn't exist error", () => {
        state.effects = {
            name: new Effect("name", [], 1, "attack", "enemy", "every turn"),
        };
        const expected = state.effects.name;
        state.stats = [];
        state.inventory = [];
        alterEffect("name, 6, Some Stat=1", [0, 0], "");
        expect(state.message).toEqual(
            "\nAlter Effect: Stat Some Stat does not exist."
        );
        state.message = "";

        expect(state.effects.name).toEqual(expected);
    });

    it("Restricted name error", () => {
        state.stats = [];
        state.effects = {
            stick: new Effect("stick", [], 1, "attack", "enemy", "continuous"),
        };
        alterEffect("stick, 2, skillpoints=1, level=-1, hp=-3", [], "");
        expect(state.message).toEqual(
            "\nAlter Effect: skillpoints cannot be set.\nAlter Effect: level cannot be set."
        );
        state.message = "";
    });

    it("Should alter specified effect", () => {
        state.stats = ["int", "str", "pff"];
        state.effects = {
            "curse of knowledge": new Effect(
                "curse of knowledge",
                [["pff", 1]],
                3,
                "attack",
                "enemy",
                "continuous",
                true
            ),
        };
        const oldAttributes = EffectToString(
            state.effects["curse of knowledge"]
        );
        expect(
            alterEffect(
                "curse of knowledge, 2, int=10, str = -2, b, self, c",
                [0, 0],
                "Test message"
            )
        ).toEqual(
            `
curse of knowledge's attributes has been altered\nfrom\n${oldAttributes}\nto\n${EffectToString(
                state.effects["curse of knowledge"]
            )}.`
        );

        const expected: any = {
            name: "curse of knowledge",
            modifiers: {
                int: 10,
                str: -2,
            },
            baseDuration: 2,
            durationLeft: 2,
            applyUnique: true,
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
