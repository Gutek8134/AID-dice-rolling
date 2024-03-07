import {
    BestStat,
    GetStatWithMods,
    IncrementExp,
} from "../../../Input Modifier/characterutils";
import { SetLevellingToOblivion } from "../../../Input Modifier/constants";
import { Character } from "../../../Shared Library/Character";
import { Effect } from "../../../Shared Library/Effect";
import { Item } from "../../../Shared Library/Item";
import { state } from "../../../proxy_state";

//TODO: GSWM - update for effects

describe("Character Utilities", () => {
    it("Best stat", () => {
        expect(BestStat(new Character([["explosion", 1]]))).toEqual(
            "explosion"
        );

        expect(
            BestStat(
                new Character([
                    ["explosion", 1],
                    ["fireproof", 0],
                ])
            )
        ).toEqual("explosion");

        expect(
            BestStat(
                new Character([
                    ["fireproof", -5],
                    ["explosion", -1],
                ])
            )
        ).toEqual("explosion");

        expect(
            BestStat(
                new Character([
                    ["explosion", 100],
                    ["fireproof", 100],
                ])
            )
        ).toEqual("explosion");
    });

    it("Get stat with mods", () => {
        state.items = {
            "Staff of Zalos": new Item("Staff of Zalos", [
                ["slot", "artifact"],
                ["wizardry", 3],
                ["strength", -1],
            ]),
            stick: new Item("stick", [
                ["slot", "weapon"],
                ["strength", 3],
                ["dexterity", 1],
            ]),
        };
        const character = new Character(
            [
                ["dexterity", 2],
                ["strength", 2],
                ["explosion", 3],
            ],
            ["Staff of Zalos", "stick"]
        );
        expect(GetStatWithMods(character, "strength")).toEqual(4);
        expect(BestStat(character)).toEqual("strength");

        if (!character.activeEffects) character.activeEffects = [];
        character.activeEffects.push(
            new Effect(
                "",
                [["strength", -1]],
                1,
                "not applied",
                "self",
                "continuous"
            )
        );
        expect(GetStatWithMods(character, "strength")).toEqual(3);
    });

    it("Increment XP", () => {
        SetLevellingToOblivion(true);

        state.characters.Zuibroldun = new Character([["explosion", 1]]);

        expect(IncrementExp("Zuibroldun", "explosion")).toEqual("");
        expect(state.characters.Zuibroldun.stats["explosion"].level).toEqual(1);
        expect(
            state.characters.Zuibroldun.stats["explosion"].experience
        ).toEqual(1);

        expect(IncrementExp("Zuibroldun", "explosion")).toEqual(
            "\nZuibroldun's explosion has levelled up to level 2!"
        );
        expect(state.characters.Zuibroldun.stats["explosion"].level).toEqual(2);
        expect(
            state.characters.Zuibroldun.stats["explosion"].experience
        ).toEqual(0);

        SetLevellingToOblivion(false);

        expect(IncrementExp("Zuibroldun", "explosion")).toEqual("");
        expect(state.characters.Zuibroldun.level).toEqual(1);
        expect(state.characters.Zuibroldun.experience).toEqual(1);

        expect(IncrementExp("Zuibroldun", "explosion")).toEqual(
            "\nZuibroldun has levelled up to level 2 (free skillpoints: 5)!"
        );
        expect(state.characters.Zuibroldun.level).toEqual(2);
        expect(state.characters.Zuibroldun.experience).toEqual(0);
    });
});
