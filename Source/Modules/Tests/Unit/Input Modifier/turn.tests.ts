import {
    SetDefaultDodge,
    SetLevellingToOblivion,
} from "../../../Input Modifier/constants";
import { turn } from "../../../Input Modifier/turn";
import { Character, NPC } from "../../../Shared Library/Character";
import { Effect, InstanceEffect } from "../../../Shared Library/Effect";
import { SetFixedRollOutcome } from "../../../Shared Library/Utils";
import { state } from "../../../proxy_state";

describe("Turn taking", () => {
    beforeAll(() => {
        SetLevellingToOblivion(false);
        SetDefaultDodge(false);
        SetFixedRollOutcome(true, 1);
    });

    beforeEach(() => {
        state.inBattle = true;
        state.message = "";
        state.out = "";
        state.stats = [
            "explosion",
            "fireproof",
            "strength",
            "dexterity",
            "faith",
        ];
        state.characters = {
            Zuibroldun: new Character([
                ["explosion", 17],
                ["strength", 15],
            ]),
            Miguel: new NPC([["dexterity", 2]]),
            Zalos: new Character([
                ["faith", 15],
                ["hp", 10000],
                ["fireproof", 5],
            ]),
        };
        state.active = ["Zuibroldun", "Miguel"];
        state.currentSide = "side1";
        state.side1 = ["Zuibroldun", "Miguel"];
        state.side2 = ["Zalos"];
        state.activeCharacter = state.characters.Zuibroldun;
        state.activeCharacterName = "Zuibroldun";
    });

    it("Invalid args", () => {
        turn("");
        expect(state.message).toEqual(
            "Battle turn: In battle you can only retreat or attack.\nFor further information read !battle section of README."
        );
        state.message = "";
        turn("Zuibroldun attacks Miguel.");
        expect(state.message).toEqual(
            "Battle turn: In battle you can only retreat or attack.\nFor further information read !battle section of README."
        );
        state.message = "";
        turn("Miguel");
        expect(state.message).toEqual(
            "Battle turn: In battle you can only retreat or attack.\nFor further information read !battle section of README."
        );
        state.message = "";
    });

    it("Escape", () => {
        turn('Zuibroldun: "Retreat!"');
        expect(state.out).toEqual("\nParty retreated from the fight.");
        state.inBattle = true;
        state.out = "";
        state.active = ["Miguel"];
        state.currentSide = "side1";
        state.side1 = ["Zuibroldun", "Miguel"];
        state.side2 = ["Zalos"];
        state.activeCharacter = state.characters.Zuibroldun;
        state.activeCharacterName = "Zuibroldun";
        turn("The adventurers escape.");
        expect(state.out).toEqual("\nParty retreated from the fight.");
    });

    it("Should do a default attack", () => {
        turn("(Zalos)");
        expect(state.out).toEqual(`
Zuibroldun (explosion: 17) attacked Zalos (faith: 15) dealing light damage (3).
Zalos now has 9997 hp.
Miguel (dexterity: 2) attacked Zalos (faith: 15) dealing no damage (0).
Zalos now has 9997 hp.`);
    });

    it("Should attack with attack stat specified", () => {
        turn("(strength, Zalos)");
        expect(state.out).toEqual(`
Zuibroldun (strength: 15) attacked Zalos (faith: 15) dealing light damage (1).
Zalos now has 9999 hp.
Miguel (dexterity: 2) attacked Zalos (faith: 15) dealing no damage (0).
Zalos now has 9999 hp.`);
    });

    it("Should attack with defense stat specified", () => {
        turn("(Zalos, fireproof)");
        expect(state.out).toEqual(`
Zuibroldun (explosion: 17) attacked Zalos (fireproof: 5) dealing light damage (13).
Zalos now has 9987 hp.
Miguel (dexterity: 2) attacked Zalos (faith: 15) dealing no damage (0).
Zalos now has 9987 hp.`);
    });

    it("Should attack with both stats specified", () => {
        turn("(strength, Zalos, dexterity)");
        expect(state.out).toEqual(`
Zuibroldun (strength: 15) attacked Zalos (dexterity: 1) dealing medium damage (15).
Zalos now has 9985 hp.
Miguel (dexterity: 2) attacked Zalos (faith: 15) dealing no damage (0).
Zalos now has 9985 hp.`);
    });

    it("Should decrease effect time left", () => {
        InstanceEffect(
            "Zuibroldun",
            new Effect(
                "heroism",
                [["courage", 10]],
                3,
                "battle start",
                "self",
                "continuous",
                false
            ),
            2
        );

        InstanceEffect(
            "Zuibroldun",
            new Effect(
                "deadge",
                [
                    ["hp", -30],
                    ["strength", 5],
                ],
                5,
                "attack",
                "enemy",
                "on end",
                true
            ),
            1
        );

        InstanceEffect(
            "Miguel",
            new Effect(
                "poison",
                [["hp", -5]],
                5,
                "attack",
                "enemy",
                "every turn",
                false
            ),
            1
        );

        turn("(Zalos)");

        expect(state.out).toEqual(`
Zuibroldun (explosion: 17) attacked Zalos (faith: 15) dealing light damage (3).
Zalos now has 9997 hp.
Zuibroldun is no longer under influence of deadge.
Miguel (dexterity: 2) attacked Zalos (faith: 15) dealing no damage (0).
Zalos now has 9997 hp.
Miguel is no longer under influence of poison.`);

        expect(state.message).toEqual(`
Zuibroldun lost 30 hp, currently has 70.
Zuibroldun gained 5 strength, currently has 20.
Duration left of effect deadge on Zuibroldun: 0.
Miguel lost 5 hp, currently has 95.
Duration left of effect poison on Miguel: 1.
Current turn: Zalos`);
        expect(
            state.characters.Zuibroldun.activeEffects?.[0].durationLeft
        ).toEqual(1);
        expect(state.characters.Zuibroldun.activeEffects?.length).toEqual(1);
        expect(state.characters.Miguel.activeEffects).toEqual([]);
    });
});
