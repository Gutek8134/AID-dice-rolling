import attack from "../../../../Input Modifier/Commands/attack";
import {
    SetDefendingCharacterLevels,
    SetLevellingToOblivion,
} from "../../../../Input Modifier/constants";
import { Character, NPC } from "../../../../Shared Library/Character";
import { experienceCalculation } from "../../../../Shared Library/Utils";
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

    it("Dead characters error", () => {
        state.stats = ["fireproof", "explosion"];

        state.characters = {
            "Zuibroldun Jodem": new Character(),
            "Miguel Booble": new Character(),
        };

        state.characters["Zuibroldun Jodem"].hp = 0;

        expect(
            attack(
                "explosion, Zuibroldun Jodem, fireproof, Miguel Bootle",
                [0, 0],
                "Test message",
                "Test message"
            )
        ).toEqual("Test message");

        expect(state.message).toEqual(
            "Attack: Character Zuibroldun Jodem cannot attack, because they are dead."
        );

        state.characters["Zuibroldun Jodem"].hp = 100;
        state.characters["Miguel Booble"].hp = 0;
        expect(
            attack(
                "explosion, Zuibroldun, fireproof, Miguel Booble",
                [0, 0],
                "Test message",
                "Test message"
            )
        ).toEqual("Test message");

        expect(state.message).toEqual(
            "Attack: Character Miguel Booble cannot be attacked, because they are dead."
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
        Zuibroldun Jodem \\(explosion: 1\\) attacked Miguel Booble \\(fireproof: 1\\) dealing \\w+ damage \\(\\d+\\).
        Miguel Booble now has \\d+ hp.`);

        expect(state.characters["Miguel Booble"].hp).toBeLessThan(
            state.startingHP
        );

        expect(state.ctxt).toMatch(`Test message.
        Zuibroldun Jodem attacked Miguel Booble dealing \\w+ damage.`);
    });

    it("Should increase xp", () => {
        state.stats = ["fireproof", "explosion"];
        state.characters = {
            "Zuibroldun Jodem": new Character(),
            "Miguel Booble": new Character(),
        };
        const commandArguments =
            "explosion, Zuibroldun Jodem, fireproof, Miguel Booble";
        const input = `Test !attack(${commandArguments}) message.`;

        //
        SetLevellingToOblivion(false);
        SetDefendingCharacterLevels(false);

        attack(
            commandArguments,
            [13, 14 + commandArguments.length],
            input,
            input
        );

        expect(state.characters["Zuibroldun Jodem"].experience).toEqual(1);
        expect(state.characters["Miguel Booble"].experience).toEqual(0);

        state.characters["Zuibroldun Jodem"].experience = 0;

        //
        SetLevellingToOblivion(false);
        SetDefendingCharacterLevels(true);

        attack(
            commandArguments,
            [13, 14 + commandArguments.length],
            input,
            input
        );

        expect(state.characters["Zuibroldun Jodem"].experience).toEqual(1);
        expect(state.characters["Miguel Booble"].experience).toEqual(1);

        state.characters["Zuibroldun Jodem"].experience = 0;
        state.characters["Miguel Booble"].experience = 0;
        //
        SetLevellingToOblivion(true);
        SetDefendingCharacterLevels(false);

        attack(
            commandArguments,
            [13, 14 + commandArguments.length],
            input,
            input
        );

        expect(
            state.characters["Zuibroldun Jodem"].stats["explosion"].experience
        ).toEqual(1);
        expect(
            state.characters["Miguel Booble"].stats["fireproof"].experience
        ).toEqual(0);

        state.characters["Zuibroldun Jodem"].stats["explosion"].experience = 0;

        //
        SetLevellingToOblivion(true);
        SetDefendingCharacterLevels(true);

        attack(
            commandArguments,
            [13, 14 + commandArguments.length],
            input,
            input
        );

        expect(
            state.characters["Zuibroldun Jodem"].stats["explosion"].experience
        ).toEqual(1);
        expect(
            state.characters["Miguel Booble"].stats["fireproof"].experience
        ).toEqual(1);

        state.characters["Zuibroldun Jodem"].stats["explosion"].experience = 0;
        state.characters["Miguel Booble"].stats["fireproof"].experience = 0;
    });

    it("Should increase level", () => {
        state.stats = ["fireproof", "explosion"];
        state.characters = {
            "Zuibroldun Jodem": new Character(),
            "Miguel Booble": new Character(),
        };
        const commandArguments =
            "explosion, Zuibroldun Jodem, fireproof, Miguel Booble";
        const input = `Test !attack(${commandArguments}) message.`;

        //
        SetLevellingToOblivion(false);
        SetDefendingCharacterLevels(false);

        state.characters["Zuibroldun Jodem"].experience =
            state.characters["Zuibroldun Jodem"].expToNextLvl - 1;
        expect(
            attack(
                commandArguments,
                [13, 14 + commandArguments.length],
                input,
                input
            )
        ).toMatch(`Test message.
        Zuibroldun Jodem \\(explosion: 1\\) attacked Miguel Booble \\(fireproof: 1\\) dealing \\w+ damage \\(\\d+\\).
        Miguel Booble now has \\d+ hp.
        Zuibroldun Jodem levelled up to level 2 \\(free skillpoints: ${state.skillpointsOnLevelUp}\\)!`);

        expect(state.ctxt).toMatch(`Test message.
        Zuibroldun Jodem attacked Miguel Booble dealing \\w+ damage.`);

        expect(state.characters["Zuibroldun Jodem"].experience).toEqual(0);
        expect(state.characters["Zuibroldun Jodem"].level).toEqual(2);
        expect(state.characters["Zuibroldun Jodem"].expToNextLvl).toEqual(
            experienceCalculation(2)
        );
        expect(state.characters["Miguel Booble"].experience).toEqual(0);
        expect(state.characters["Miguel Booble"].level).toEqual(1);

        state.characters["Zuibroldun Jodem"].experience = 0;
        state.characters["Zuibroldun Jodem"].level = 1;
        state.characters["Zuibroldun Jodem"].expToNextLvl =
            experienceCalculation(1);
        state.characters["Miguel Booble"].experience = 0;
        state.characters["Miguel Booble"].level = 1;
        state.characters["Miguel Booble"].expToNextLvl =
            experienceCalculation(1);

        //
        SetLevellingToOblivion(false);
        SetDefendingCharacterLevels(true);

        state.characters["Zuibroldun Jodem"].experience =
            state.characters["Zuibroldun Jodem"].expToNextLvl - 1;

        state.characters["Miguel Booble"].experience =
            state.characters["Miguel Booble"].expToNextLvl - 1;

        expect(
            attack(
                commandArguments,
                [13, 14 + commandArguments.length],
                input,
                input
            )
        ).toMatch(`Test message.
        Zuibroldun Jodem \\(explosion: 1\\) attacked Miguel Booble \\(fireproof: 1\\) dealing \\w+ damage \\(\\d+\\).
        Miguel Booble now has \\d+ hp.
        Zuibroldun Jodem levelled up to level 2 \\(free skillpoints: ${state.skillpointsOnLevelUp}\\)!
        Miguel Booble levelled up to level 2 \\(free skillpoints: ${state.skillpointsOnLevelUp}\\)!`);

        expect(state.ctxt).toMatch(`Test message.
        Zuibroldun Jodem attacked Miguel Booble dealing \\w+ damage.`);

        expect(state.characters["Zuibroldun Jodem"].experience).toEqual(0);
        expect(state.characters["Zuibroldun Jodem"].level).toEqual(2);
        expect(state.characters["Zuibroldun Jodem"].expToNextLvl).toEqual(
            experienceCalculation(2)
        );
        expect(state.characters["Miguel Booble"].experience).toEqual(0);
        expect(state.characters["Miguel Booble"].level).toEqual(2);
        expect(state.characters["Miguel Booble"].expToNextLvl).toEqual(
            experienceCalculation(2)
        );

        state.characters["Zuibroldun Jodem"].experience = 0;
        state.characters["Zuibroldun Jodem"].level = 1;
        state.characters["Zuibroldun Jodem"].expToNextLvl =
            experienceCalculation(1);
        state.characters["Miguel Booble"].experience = 0;
        state.characters["Miguel Booble"].level = 1;
        state.characters["Miguel Booble"].expToNextLvl =
            experienceCalculation(1);

        //
        SetLevellingToOblivion(true);
        SetDefendingCharacterLevels(false);

        state.characters["Zuibroldun Jodem"].stats["explosion"].level = 1;

        state.characters["Zuibroldun Jodem"].stats["explosion"].expToNextLvl =
            state.characters["Zuibroldun Jodem"].stats["explosion"]
                .expToNextLvl ?? experienceCalculation(1);

        state.characters["Zuibroldun Jodem"].stats["explosion"].experience =
            state.characters["Zuibroldun Jodem"].stats["explosion"]
                .expToNextLvl - 1;

        expect(
            attack(
                commandArguments,
                [13, 14 + commandArguments.length],
                input,
                input
            )
        ).toMatch(`Test message.
        Zuibroldun Jodem \\(explosion: 1\\) attacked Miguel Booble \\(fireproof: 1\\) dealing \\w+ damage \\(\\d+\\).
        Miguel Booble now has \\d+ hp.
        Zuibroldun Jodem's explosion levelled up to level 2!`);

        expect(state.ctxt).toMatch(`Test message.
        Zuibroldun Jodem attacked Miguel Booble dealing \\w+ damage.`);

        expect(
            state.characters["Zuibroldun Jodem"].stats["explosion"].experience
        ).toEqual(0);
        expect(
            state.characters["Zuibroldun Jodem"].stats["explosion"].level
        ).toEqual(2);
        expect(
            state.characters["Miguel Booble"].stats["fireproof"].experience
        ).toEqual(0);
        expect(
            state.characters["Miguel Booble"].stats["fireproof"].level
        ).toEqual(1);

        state.characters["Zuibroldun Jodem"].stats["explosion"].experience = 0;
        state.characters["Zuibroldun Jodem"].stats["explosion"].level = 1;
        state.characters["Zuibroldun Jodem"].stats["explosion"].expToNextLvl =
            experienceCalculation(1);
        state.characters["Miguel Booble"].stats["fireproof"].experience = 0;
        state.characters["Miguel Booble"].stats["fireproof"].level = 1;
        state.characters["Miguel Booble"].stats["fireproof"].expToNextLvl =
            experienceCalculation(1);

        //
        SetLevellingToOblivion(true);
        SetDefendingCharacterLevels(true);

        state.characters["Zuibroldun Jodem"].stats["explosion"].level = 1;

        state.characters["Zuibroldun Jodem"].stats["explosion"].expToNextLvl =
            state.characters["Zuibroldun Jodem"].stats["explosion"]
                .expToNextLvl ?? experienceCalculation(1);

        state.characters["Zuibroldun Jodem"].stats["explosion"].experience =
            state.characters["Zuibroldun Jodem"].stats["explosion"]
                .expToNextLvl - 1;

        state.characters["Miguel Booble"].stats["fireproof"].level = 1;

        state.characters["Miguel Booble"].stats["fireproof"].expToNextLvl =
            state.characters["Miguel Booble"].stats["fireproof"].expToNextLvl ??
            experienceCalculation(1);

        state.characters["Miguel Booble"].stats["fireproof"].experience =
            state.characters["Miguel Booble"].stats["fireproof"].expToNextLvl -
            1;

        expect(
            attack(
                commandArguments,
                [13, 14 + commandArguments.length],
                input,
                input
            )
        ).toMatch(`Test message.
        Zuibroldun Jodem \\(explosion: 1\\) attacked Miguel Booble \\(fireproof: 1\\) dealing \\w+ damage \\(\\d+\\).
        Miguel Booble now has \\d+ hp.
        Zuibroldun Jodem's explosion levelled up to level 2!
        Miguel Booble's fireproof levelled up to level 2!`);

        expect(state.ctxt).toMatch(`Test message.
        Zuibroldun Jodem attacked Miguel Booble dealing \\w+ damage.`);

        expect(
            state.characters["Zuibroldun Jodem"].stats["explosion"].experience
        ).toEqual(0);
        expect(
            state.characters["Zuibroldun Jodem"].stats["explosion"].level
        ).toEqual(2);
        expect(
            state.characters["Zuibroldun Jodem"].stats["explosion"].expToNextLvl
        ).toEqual(experienceCalculation(2));

        expect(
            state.characters["Miguel Booble"].stats["fireproof"].experience
        ).toEqual(0);
        expect(
            state.characters["Miguel Booble"].stats["fireproof"].level
        ).toEqual(2);
        expect(
            state.characters["Miguel Booble"].stats["fireproof"].expToNextLvl
        ).toEqual(experienceCalculation(2));

        state.characters["Zuibroldun Jodem"].stats["explosion"].experience = 0;
        state.characters["Zuibroldun Jodem"].stats["explosion"].level = 1;
        state.characters["Zuibroldun Jodem"].stats["explosion"].expToNextLvl =
            experienceCalculation(1);
        state.characters["Miguel Booble"].stats["fireproof"].experience = 0;
        state.characters["Miguel Booble"].stats["fireproof"].level = 1;
        state.characters["Miguel Booble"].stats["fireproof"].expToNextLvl =
            experienceCalculation(1);
    });

    it("Should kill the enemy", () => {
        state.stats = ["fireproof", "explosion"];
        state.characters = {
            "Zuibroldun Jodem": new Character(),
            "Miguel Booble": new Character([["hp", 1]]),
            "Miguel Bootle": new NPC([["hp", 1]]),
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
        Zuibroldun Jodem \\(explosion: 1\\) attacked Miguel Booble \\(fireproof: 1\\) dealing \\w+ damage \\(\\d+\\).
        Miguel Booble has retreated.`);

        expect(state.ctxt).toMatch(`Test message.
        Zuibroldun Jodem attacked Miguel Booble dealing \\w+ damage.
        Miguel Booble has retreated.`);

        expect(state.characters["Miguel Booble"].hp).toEqual(0);

        expect(
            attack(
                "explosion, Zuibroldun Jodem, fireproof, Miguel Bootle",
                [13, 14 + commandArguments.length],
                input,
                input
            )
        ).toMatch(`Test message.
        Zuibroldun Jodem \\(explosion: 1\\) attacked Miguel Bootle \\(fireproof: 1\\) dealing \\w+ damage \\(\\d+\\).
        Miguel Bootle has died.`);

        expect(state.ctxt).toMatch(`Test message.
        Zuibroldun Jodem attacked Miguel Bootle dealing \\w+ damage.
        Miguel Bootle has died.`);

        expect(state.characters).not.toHaveProperty("Miguel Bootle");
    });
});
