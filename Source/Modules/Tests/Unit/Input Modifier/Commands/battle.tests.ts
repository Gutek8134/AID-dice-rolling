import battle from "../../../../Input Modifier/Commands/battle";
import { Character } from "../../../../Shared Library/Character";
import { Effect } from "../../../../Shared Library/Effect";
import { Item } from "../../../../Shared Library/Item";
import { SetFixedRollOutcome } from "../../../../Shared Library/Utils";
import { state } from "../../../../proxy_state";

describe("Command battle", () => {
    it("Invalid args error", () => {
        expect(battle("", "Test message")).toEqual("Test message");
        expect(state.message).toEqual("Battle: No arguments found.");

        expect(battle("aaa", "Test message")).toEqual("Test message");
        expect(state.message).toEqual(
            "Battle: Arguments were not given in proper format."
        );
    });

    it("Character cannot participate in both sides of the battle at once", () => {
        state.characters = {
            Zuibroldun: new Character(),
            Miguel: new Character(),
        };

        let commandArguments = "(Zuibroldun, Miguel), (Zuibroldun)";
        expect(
            battle(
                commandArguments,
                `Test !battle(${commandArguments}) message.`
            )
        ).toEqual(`Test !battle(${commandArguments}) message.`);
        expect(state.message).toEqual(
            "Battle: Character Zuibroldun cannot belong to both sides of the battle."
        );

        commandArguments = "(Zuibroldun, Miguel), (Miguel)";
        expect(
            battle(
                commandArguments,
                `Test !battle(${commandArguments}) message.`
            )
        ).toEqual(`Test !battle(${commandArguments}) message.`);
        expect(state.message).toEqual(
            "Battle: Character Miguel cannot belong to both sides of the battle."
        );
    });

    it("Nonexistent characters error", () => {
        state.characters = {
            Zuibroldun: new Character(),
        };

        let commandArguments = "(Miguel), (Zuibroldun)";
        expect(
            battle(
                commandArguments,
                `Test !battle(${commandArguments}) message.`
            )
        ).toEqual(`Test !battle(${commandArguments}) message.`);
        expect(state.message).toEqual(
            "Battle: Character Miguel doesn't exist."
        );

        state.characters = {
            Miguel: new Character(),
        };

        commandArguments = "(Zuibroldun), (Miguel)";
        expect(
            battle(
                commandArguments,
                `Test !battle(${commandArguments}) message.`
            )
        ).toEqual(`Test !battle(${commandArguments}) message.`);
        expect(state.message).toEqual(
            "Battle: Character Zuibroldun doesn't exist."
        );
    });

    it("Should set state values", () => {
        state.stats = ["a", "b", "c"];
        state.characters = {
            Zuibroldun: new Character(),
            Miguel: new Character(),
            John: new Character(),
            Hed: new Character(),
        };

        let commandArguments = "(Miguel, John), (Zuibroldun, Hed)";
        expect(
            battle(
                commandArguments,
                `Test !battle(${commandArguments}) message.`
            )
        ).toEqual(`Test !battle(${commandArguments}) message.`);

        for (const name of ["Miguel", "John"]) {
            expect(state.side1).toContain(name);
        }
        for (const name of ["Zuibroldun", "Hed"]) {
            expect(state.side2).toContain(name);
        }
        expect(state.currentSide).toMatch(/side\d/);
        expect(state.active).toEqual(state[state.currentSide ?? ""]);
        expect(state.inBattle).toEqual(true);
        expect(state.out).toEqual("A battle has emerged between two groups!");
        delete state.currentSide, state.active, state.side1, state.side2;
        state.inBattle = false;
    });

    it("Should apply effects on battle start", () => {
        SetFixedRollOutcome(true, 1);
        state.stats = ["strength", "b", "c"];
        state.characters = {
            Zuibroldun: new Character(),
            Miguel: new Character(),
            John: new Character(),
            Hed: new Character(),
        };
        state.effects = {
            rage: new Effect(
                "rage",
                [["strength", 2]],
                3,
                "battle start",
                "self",
                "continuous"
            ),
            "quick attack": new Effect(
                "quick attack",
                [["hp", -5]],
                1,
                "battle start",
                "enemy",
                "on end",
                true
            ),
        };
        state.items = {
            helmet: new Item("helmet", [
                ["slot", "head"],
                ["effect", "rage"],
            ]),
            dagger: new Item("dagger", [
                ["slot", "weapon"],
                ["effect", "quick attack"],
            ]),
        };
        state.characters.Zuibroldun.items["head"] = state.items.helmet;
        state.characters.Miguel.items["weapon"] = state.items.dagger;

        let commandArguments = "(Miguel, John), (Zuibroldun, Hed)";
        expect(
            battle(
                commandArguments,
                `Test !battle(${commandArguments}) message.`
            )
        ).toEqual(`Test !battle(${commandArguments}) message.`);
        expect(state.out).toEqual(`A battle has emerged between two groups!
Zuibroldun is now under influence of quick attack.
Zuibroldun is now under influence of rage.`);

        SetFixedRollOutcome(false);
    });
});
