import { BestStat, IncrementExp } from "../../../Input Modifier/characterutils";
import { SetLevellingToOblivion } from "../../../Input Modifier/constants";
import { Character } from "../../../Shared Library/Character";
import { Item } from "../../../Shared Library/Item";
import { state } from "../../proxy_state";

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
                ["strength", 2],
                ["dexterity", 1],
            ]),
        };

        expect(
            BestStat(
                new Character(
                    [
                        ["dexterity", 2],
                        ["strength", 2],
                        ["explosion", 3],
                    ],
                    ["Staff of Zalos", "stick"]
                )
            )
        ).toEqual("strength");
    });

    it("Increment XP", () => {
        state.characters.Zuibroldun = new Character([["explosion", 1]]);

        SetLevellingToOblivion(true);

        expect(IncrementExp("Zuibroldun", "explosion")).toEqual("");
        expect(state.characters.Zuibroldun.stats["explosion"].level).toEqual(1);
        expect(
            state.characters.Zuibroldun.stats["explosion"].experience
        ).toEqual(1);

        expect(IncrementExp("Zuibroldun", "explosion")).toEqual(
            " Zuibroldun's explosion has levelled up to level 2!"
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
            " Zuibroldun has levelled up to level 2 (free skillpoints: 5)!"
        );
        expect(state.characters.Zuibroldun.level).toEqual(2);
        expect(state.characters.Zuibroldun.experience).toEqual(0);
    });
});
