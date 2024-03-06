import {
    CustomDamageOutput,
    DealDamage,
    DealDamageIfNotDodged,
} from "../../../Input Modifier/fightutils";
import { state } from "../../../proxy_state";
import { Character } from "../../../Shared Library/Character";
import {
    SetDisableDodge,
    SetFixedRollOutcome,
} from "../../../Shared Library/Utils";
import {
    SetDefendingCharacterLevels,
    SetLevellingToOblivion,
} from "../../../Input Modifier/constants";
import { IncrementExp } from "../../../Input Modifier/characterutils";
import { Item } from "../../../Shared Library/Item";
import { Effect } from "../../../Shared Library/Effect";

describe("Fight Utilities", () => {
    it("Custom Damage Output", () => {
        const damageOutputs: [number, string][] = [
            [1, "very light damage"],
            [2, "light damage"],
            [5, "medium damage"],
            [10, "heavy damage"],
            [15, "lethal damage"],
        ];

        expect(CustomDamageOutput(-1, damageOutputs)).toEqual("no damage");
        expect(CustomDamageOutput(0, damageOutputs)).toEqual("no damage");
        expect(CustomDamageOutput(1, damageOutputs)).toEqual(
            "very light damage"
        );
        expect(CustomDamageOutput(2, damageOutputs)).toEqual("light damage");
        expect(CustomDamageOutput(4, damageOutputs)).toEqual("light damage");
        expect(CustomDamageOutput(5, damageOutputs)).toEqual("medium damage");
        expect(CustomDamageOutput(10, damageOutputs)).toEqual("heavy damage");
        expect(CustomDamageOutput(15, damageOutputs)).toEqual("lethal damage");
        expect(CustomDamageOutput(100, damageOutputs)).toEqual("lethal damage");
    });

    it("Deal Damage", () => {
        SetLevellingToOblivion(true);
        state.stats = ["fireproof", "explosion"];

        state.characters = {
            "Zuibroldun Jodem": new Character([["hp", 0]]),
            "Miguel Booble": new Character([["hp", 1]]),
        };

        state.characters["Zuibroldun Jodem"].hp = 0;
        let { attackOutput, levelOutput, contextOutput } = DealDamage(
            "Zuibroldun Jodem",
            "explosion",
            "Miguel Booble",
            "fireproof",
            "Debug"
        );
        expect(state.message).toEqual(
            "Debug: Character Zuibroldun Jodem cannot attack, because they are dead."
        );

        state.characters["Zuibroldun Jodem"].hp = 1;
        state.characters["Miguel Booble"].hp = 0;
        ({ attackOutput, levelOutput, contextOutput } = DealDamage(
            "Zuibroldun Jodem",
            "explosion",
            "Miguel Booble",
            "fireproof",
            "Debug"
        ));

        expect(state.message).toEqual(
            "Debug: Character Miguel Booble cannot be attacked, because they are dead."
        );

        state.characters["Zuibroldun Jodem"].hp = 100;
        state.characters["Miguel Booble"].hp = 100;

        SetFixedRollOutcome(true, 1);
        SetDefendingCharacterLevels(true);
        SetLevellingToOblivion(false);

        ({ attackOutput, levelOutput, contextOutput } = DealDamage(
            "Zuibroldun Jodem",
            "explosion",
            "Miguel Booble",
            "fireproof",
            "Debug"
        ));

        expect(attackOutput).toEqual(
            `Zuibroldun Jodem (explosion: 1) attacked Miguel Booble (fireproof: 1) dealing light damage (1).
Miguel Booble now has 99 hp.`
        );

        state.characters["Zuibroldun Jodem"].experience = 0;
        state.characters["Miguel Booble"].experience = 0;
        expect(levelOutput).toEqual(
            IncrementExp("Zuibroldun Jodem", "") +
                IncrementExp("Miguel Booble", "")
        );

        expect(contextOutput).toEqual(
            "Zuibroldun Jodem attacked Miguel Booble dealing light damage."
        );

        state.characters["Miguel Booble"].hp = 1;
        SetLevellingToOblivion(true);

        ({ attackOutput, levelOutput, contextOutput } = DealDamage(
            "Zuibroldun Jodem",
            "explosion",
            "Miguel Booble",
            "fireproof",
            "Debug"
        ));

        expect(attackOutput).toEqual(
            `Zuibroldun Jodem (explosion: 1) attacked Miguel Booble (fireproof: 1) dealing light damage (1).
Miguel Booble has retreated.`
        );

        state.characters["Zuibroldun Jodem"].stats["explosion"].experience = 0;
        state.characters["Miguel Booble"].stats["fireproof"].experience = 0;
        expect(levelOutput).toEqual(
            IncrementExp("Zuibroldun Jodem", "explosion") +
                IncrementExp("Miguel Booble", "fireproof")
        );

        expect(contextOutput).toEqual(
            `Zuibroldun Jodem attacked Miguel Booble dealing light damage.
Miguel Booble has retreated.`
        );

        state.characters = {
            "Zuibroldun Jodem": new Character(),
            "Miguel Booble": new Character(),
        };
        state.effects = {
            bleeding: new Effect(
                "bleeding",
                [["hp", -10]],
                5,
                "attack",
                "enemy",
                "every turn"
            ),
            protection: new Effect(
                "protection",
                [["defense", 5]],
                3,
                "defense",
                "self",
                "continuous"
            ),
        };
        state.inBattle = true;
        state.characters["Zuibroldun Jodem"].items["weapon"] = new Item(
            "staff of zalos",
            [["effect", "bleeding"]]
        );
        state.characters["Miguel Booble"].items["helmet"] = new Item(
            "helmet of zalos",
            [["effect", "protection"]]
        );
        ({ attackOutput, levelOutput, contextOutput } = DealDamage(
            "Zuibroldun Jodem",
            "explosion",
            "Miguel Booble",
            "fireproof",
            "Debug"
        ));

        expect(attackOutput)
            .toEqual(`Zuibroldun Jodem (explosion: 1) attacked Miguel Booble (fireproof: 1) dealing light damage (1).
Miguel Booble now has 99 hp.
Miguel Booble is now under influence of bleeding.
Miguel Booble is now under influence of protection.`);
        expect(contextOutput)
            .toEqual(`Zuibroldun Jodem attacked Miguel Booble dealing light damage.
Miguel Booble is now under influence of bleeding.
Miguel Booble is now under influence of protection.`);
        state.inBattle = false;
    });

    it("Deal Damage if not Dodged", () => {
        state.stats = ["fireproof", "explosion"];

        state.characters = {
            "Zuibroldun Jodem": new Character([["hp", 0]]),
            "Miguel Booble": new Character([["hp", 1]]),
        };

        state.characters["Zuibroldun Jodem"].hp = 0;
        let { attackOutput, levelOutput, contextOutput } =
            DealDamageIfNotDodged(
                "Zuibroldun Jodem",
                "explosion",
                "Miguel Booble",
                "fireproof",
                "Debug"
            );
        expect(state.message).toEqual(
            "Debug: Character Zuibroldun Jodem cannot attack, because they are dead."
        );

        state.characters["Zuibroldun Jodem"].hp = 1;
        state.characters["Miguel Booble"].hp = 0;
        ({ attackOutput, levelOutput, contextOutput } = DealDamage(
            "Zuibroldun Jodem",
            "explosion",
            "Miguel Booble",
            "fireproof",
            "Debug"
        ));

        expect(state.message).toEqual(
            "Debug: Character Miguel Booble cannot be attacked, because they are dead."
        );

        state.characters["Miguel Booble"].hp = 1;
        state.characters["Miguel Booble"].stats.fireproof.level = 100;

        ({ attackOutput, levelOutput, contextOutput } = DealDamageIfNotDodged(
            "Zuibroldun Jodem",
            "explosion",
            "Miguel Booble",
            "fireproof",
            "Debug"
        ));

        expect(attackOutput).toEqual(
            "Zuibroldun Jodem (explosion: 1) attacked Miguel Booble (fireproof: 100), but missed."
        );
        expect(contextOutput).toEqual(
            "Zuibroldun Jodem attacked Miguel Booble, but missed."
        );

        SetDisableDodge(false);

        state.characters["Zuibroldun Jodem"] = new Character();
        state.characters["Miguel Booble"] = new Character();
        ({ attackOutput, levelOutput, contextOutput } = DealDamageIfNotDodged(
            "Zuibroldun Jodem",
            "explosion",
            "Miguel Booble",
            "fireproof",
            "Debug"
        ));

        state.characters["Zuibroldun Jodem"] = new Character();
        state.characters["Miguel Booble"] = new Character();

        expect({ attackOutput, levelOutput, contextOutput }).toEqual(
            DealDamage(
                "Zuibroldun Jodem",
                "explosion",
                "Miguel Booble",
                "fireproof",
                "Debug"
            )
        );
    });
});
