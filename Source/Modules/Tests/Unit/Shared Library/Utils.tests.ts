import { SetLevellingToOblivion } from "../../../Input Modifier/constants";
import { Character } from "../../../Shared Library/Character";
import { Effect } from "../../../Shared Library/Effect";
import { Item } from "../../../Shared Library/Item";
import {
    CharacterToString,
    EffectToString,
    ElementInArray,
    ItemToString,
    _equip,
    experienceCalculation,
} from "../../../Shared Library/Utils";
import { state } from "../../../proxy_state";

describe("Utilities", () => {
    it("Element In Array", () => {
        expect(ElementInArray("a", ["c", "b", "d", "a"])).toStrictEqual(true);
        expect(ElementInArray(1, [3, 2, 5, 1])).toStrictEqual(true);
        expect(ElementInArray("a", ["c", 3, "d", "a"])).toStrictEqual(true);
        expect(ElementInArray("a", ["c", "b", "d"])).toStrictEqual(false);
        expect(ElementInArray(1, [3, 2, 5])).toStrictEqual(false);
        expect(ElementInArray("a", ["c", 3, "d"])).toStrictEqual(false);
    });

    it("Effect To String", () => {
        expect(
            EffectToString(
                new Effect(
                    "bleeding",
                    [["hp", -5]],
                    3,
                    "attack",
                    "enemy",
                    "every turn",
                    false
                )
            )
        ).toEqual(`bleeding:
duration left: 3 (base 3),
unique per entity: false,
applied when: attack,
applied to: enemy,
activates when: every turn,
activation consequences:
hp: -5`);
    });

    it("Item To String", () => {
        state.effects = {
            bleeding: new Effect(
                "bleeding",
                [["hp", -5]],
                3,
                "attack",
                "enemy",
                "every turn",
                false
            ),
        };
        let values: [string, string | number][] = [
            ["slot", "head"],
            ["dexterity", -5],
            ["nano machines", 3],
            ["effect", "bleeding"],
        ];
        expect(ItemToString(new Item("Staff of Zalos", values))).toStrictEqual(
            `Staff of Zalos:
slot: head
dexterity: -5
nano machines: 3
Effects:
${EffectToString(state.effects["bleeding"])}`
        );
    });

    it("Character To String - default character", () => {
        SetLevellingToOblivion(false);
        state.stats = [];
        state.startingHP = 100;
        state.startingLevel = 1;
        let character = new Character();
        expect(CharacterToString(character)).toEqual(
            `hp: 100,
level: 1,
skillpoints: 0,
experience: 0,
to level up: ${experienceCalculation(1)}(need ${experienceCalculation(1)} more),
isNPC: false,

Items:
none

Applied effects:
none`
        );
        SetLevellingToOblivion(true);
        state.stats = [];
        state.startingHP = 100;
        state.startingLevel = 1;
        character = new Character();
        expect(CharacterToString(character)).toEqual(
            `hp: 100,
isNPC: false,

Items:
none

Applied effects:
none`
        );
    });

    it("Character to String - custom stats", () => {
        SetLevellingToOblivion(false);
        state.stats = [];
        state.startingHP = 100;
        state.startingLevel = 1;
        let character = new Character([
            ["dexterity", 5],
            ["strength", 2],
        ]);
        expect(CharacterToString(character)).toEqual(
            `hp: 100,
level: 1,
skillpoints: 0,
experience: 0,
to level up: ${experienceCalculation(1)}(need ${experienceCalculation(1)} more),
isNPC: false,
dexterity: 5,
strength: 2,

Items:
none

Applied effects:
none`
        );

        SetLevellingToOblivion(true);
        state.stats = [];
        state.startingHP = 100;
        state.startingLevel = 1;
        character = new Character([
            ["dexterity", 5],
            ["strength", 2],
        ]);
        expect(CharacterToString(character)).toEqual(
            `hp: 100,
isNPC: false,
dexterity: level=5, exp=0, to lvl up=${experienceCalculation(
                5
            )}(need ${experienceCalculation(5)} more),
strength: level=2, exp=0, to lvl up=${experienceCalculation(
                2
            )}(need ${experienceCalculation(2)} more),

Items:
none

Applied effects:
none`
        );
    });

    it("Character to String - items", () => {
        SetLevellingToOblivion(false);
        state.stats = [];
        state.items = {
            "Staff of Zalos": new Item("Staff of Zalos", [
                ["slot", "head"],
                ["dexterity", -5],
                ["nano machines", 3],
            ]),
        };
        state.startingHP = 100;
        state.startingLevel = 1;
        let character = new Character([], ["Staff of Zalos"]);
        expect(CharacterToString(character)).toEqual(
            `hp: 100,
level: 1,
skillpoints: 0,
experience: 0,
to level up: ${experienceCalculation(1)}(need ${experienceCalculation(1)} more),
isNPC: false,

Items:
Staff of Zalos:
slot: head
dexterity: -5
nano machines: 3
Effects:
none

Applied effects:
none`
        );

        SetLevellingToOblivion(true);
        state.stats = [];
        state.startingHP = 100;
        state.startingLevel = 1;
        character = new Character([], ["Staff of Zalos"]);
        expect(CharacterToString(character)).toEqual(
            `hp: 100,
isNPC: false,

Items:
Staff of Zalos:
slot: head
dexterity: -5
nano machines: 3
Effects:
none

Applied effects:
none`
        );

        character = new Character([], ["Staff of Zalos"]);
        character.activeEffects = [
            new Effect(
                "bleeding",
                [["hp", -5]],
                3,
                "attack",
                "enemy",
                "every turn",
                false
            ),
        ];
        expect(CharacterToString(character)).toEqual(
            `hp: 100,
isNPC: false,

Items:
Staff of Zalos:
slot: head
dexterity: -5
nano machines: 3
Effects:
none

Applied effects:
${EffectToString(character.activeEffects[0])}`
        );
        state.items = {};
    });

    it("Internal Equip", () => {
        state.items = {
            "Staff of Zalos": new Item("Staff of Zalos", [
                ["slot", "head"],
                ["dexterity", -5],
                ["nano machines", 3],
            ]),
            "Staff of Żulos": new Item("Staff of Żulos", [
                ["slot", "head"],
                ["dexterity", -10],
                ["nano machines", -3],
            ]),
        };

        state.characters = {
            Zuibroldun: new Character([], ["Staff of Żulos"]),
        };

        expect(Object.values(state.characters.Zuibroldun.items)).toContain(
            state.items["Staff of Żulos"]
        );
        let modifiedText = "";
        expect(
            _equip("Zuibroldun", state.items["Staff of Zalos"], modifiedText)
        ).toEqual(
            "\nCharacter Zuibroldun unequipped Staff of Żulos.\nCharacter Zuibroldun equipped Staff of Zalos."
        );
        expect(state.inventory).toEqual(["Staff of Żulos"]);
        expect(state.characters.Zuibroldun.items["head"]).toEqual(
            state.items["Staff of Zalos"]
        );

        state.items = {};
        state.characters = {};
        state.inventory = [];
    });
});
