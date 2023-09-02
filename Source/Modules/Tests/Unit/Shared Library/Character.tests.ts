import { Character } from "../../../Shared Library/Character";
import { Item } from "../../../Shared Library/Item";
import { Stat } from "../../../Shared Library/Stat";
import { experienceCalculation } from "../../../Shared Library/Utils";
import { state } from "../../../proxy_state";

//TODO: update for effects - structural change

describe("Character creation", () => {
    it("Should create default character", () => {
        state.stats = [];
        let character: Character = new Character();
        let expectedObject: { [key: string]: any } = {
            hp: state.startingHP,
            level: 1,
            experience: 0,
            expToNextLvl: experienceCalculation(1),
            skillpoints: 0,
            items: {},
            type: "character",
            isNpc: false,
            stats: {},
        };

        for (const key in expectedObject) {
            expect(character).toHaveProperty(key);
            expect(character[key]).toEqual(expectedObject[key]);
        }

        state.stats = ["nano machines"];
        character = new Character();
        expectedObject = {
            hp: state.startingHP,
            level: 1,
            experience: 0,
            expToNextLvl: experienceCalculation(1),
            skillpoints: 0,
            items: {},
            type: "character",
            isNpc: false,
            stats: {
                "nano machines": new Stat("", 1),
            },
        };

        for (const key in expectedObject) {
            expect(character).toHaveProperty(key);
            expect(character[key]).toEqual(expectedObject[key]);
        }
    });

    it("Should create character with initial stats", () => {
        state.stats = [];
        let character: Character = new Character([
            ["dexterity", 5],
            ["strength", 2],
        ]);

        let expectedObject: { [key: string]: any } = {
            hp: state.startingHP,
            level: 1,
            experience: 0,
            expToNextLvl: experienceCalculation(1),
            skillpoints: 0,
            items: {},
            type: "character",
            isNpc: false,
            stats: {
                dexterity: new Stat("", 5),
                strength: new Stat("", 2),
            },
        };

        for (const key in expectedObject) {
            expect(character).toHaveProperty(key);
            expect(character[key]).toEqual(expectedObject[key]);
        }

        state.stats = ["nano machines"];
        character = new Character([
            ["dexterity", 5],
            ["strength", 2],
        ]);

        expectedObject = {
            hp: state.startingHP,
            level: 1,
            experience: 0,
            expToNextLvl: experienceCalculation(1),
            skillpoints: 0,
            items: {},
            type: "character",
            isNpc: false,
            stats: {
                dexterity: new Stat("", 5),
                strength: new Stat("", 2),
                "nano machines": new Stat("", 1),
            },
        };

        for (const key in expectedObject) {
            expect(character).toHaveProperty(key);
            expect(character[key]).toEqual(expectedObject[key]);
        }
    });

    it("Some values cannot be overridden", () => {
        state.stats = [];
        let character: Character = new Character([
            ["dexterity", 5],
            ["strength", 2],
            ["experience", 5],
            ["expToNextLvl", 11],
            ["skillpoints", 4],
        ]);

        let expectedObject: { [key: string]: any } = {
            hp: state.startingHP,
            level: 1,
            experience: 0,
            expToNextLvl: experienceCalculation(1),
            skillpoints: 0,
            items: {},
            type: "character",
            isNpc: false,
            stats: {
                dexterity: new Stat("", 5),
                strength: new Stat("", 2),
            },
        };

        for (const key in expectedObject) {
            expect(character).toHaveProperty(key);
            expect(character[key]).toEqual(expectedObject[key]);
        }
    });

    it("Should create character with Default items", () => {
        let testItem = new Item("Staff of Zalos", [
            ["slot", "head"],
            ["dexterity", -5],
            ["nano machines", 3],
            ["effect", "bleeding"],
        ]);

        state.stats = [];
        state.items = {
            "Staff of Zalos": testItem,
        };
        let character: Character = new Character(
            [
                ["dexterity", 5],
                ["strength", 2],
            ],
            ["Staff of Zalos"]
        );

        let expectedObject: { [key: string]: any } = {
            hp: state.startingHP,
            level: 1,
            experience: 0,
            expToNextLvl: experienceCalculation(1),
            skillpoints: 0,
            items: { head: testItem },
            type: "character",
            isNpc: false,
            stats: {
                dexterity: new Stat("", 5),
                strength: new Stat("", 2),
            },
        };

        for (const key in expectedObject) {
            expect(character).toHaveProperty(key);
            expect(character[key]).toEqual(expectedObject[key]);
        }
    });
});
