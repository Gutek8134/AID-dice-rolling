import addNPC from "../../../../Input Modifier/Commands/addnpc";
import { Item } from "../../../../Shared Library/Item";
import { Stat } from "../../../../Shared Library/Stat";
import {
    CharacterToString,
    experienceCalculation,
} from "../../../../Shared Library/Utils";
import { state } from "../../../proxy_state";

describe("Command add npc", () => {
    it("Invalid args error", () => {
        expect(addNPC("", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual(
            "Add NPC: Arguments were not given in proper format."
        );
    });

    it("Should create default NPC", () => {
        state.stats = [];
        state.characters = {};
        const commandArguments = "Zuibroldun Jodem";
        const input: string = `Test !addnpc(${commandArguments}) message`;

        expect(addNPC(commandArguments, [0, 0], input)).toEqual(input);
        expect(state.characters).toHaveProperty("Zuibroldun Jodem");
        expect(state.out).toEqual(
            `\nNon-Playable Character Zuibroldun Jodem has been created with stats\n${CharacterToString(
                state.characters["Zuibroldun Jodem"]
            )}.`
        );

        const expected: { [key: string]: any } = {
            hp: state.startingHP,
            level: 1,
            experience: 0,
            expToNextLvl: experienceCalculation(1),
            skillpoints: 0,
            items: {},
            type: "character",
            isNpc: true,
            stats: {},
        };

        for (const key in expected) {
            expect(state.characters["Zuibroldun Jodem"]).toHaveProperty(key);
            expect(state.characters["Zuibroldun Jodem"][key]).toEqual(
                expected[key]
            );
        }

        state.characters = {};
    });

    it("Should create NPC with stats", () => {
        state.stats = [];
        state.characters = {};
        const commandArguments =
            "Zuibroldun Jodem, dexterity=1, strength = 2, nano machines  =3";
        const input: string = `Test !addnpc(${commandArguments}) message`;

        expect(addNPC(commandArguments, [0, 0], input)).toEqual(input);
        expect(state.characters).toHaveProperty("Zuibroldun Jodem");
        expect(state.out).toEqual(
            `\nNon-Playable Character Zuibroldun Jodem has been created with stats\n${CharacterToString(
                state.characters["Zuibroldun Jodem"]
            )}.`
        );

        const expected: { [key: string]: any } = {
            hp: state.startingHP,
            level: 1,
            experience: 0,
            expToNextLvl: experienceCalculation(1),
            skillpoints: 0,
            items: {},
            type: "character",
            isNpc: true,
            stats: {
                dexterity: new Stat("dexterity", 1),
                strength: new Stat("strength", 2),
                "nano machines": new Stat("nano machines", 3),
            },
        };

        for (const key in expected) {
            expect(state.characters["Zuibroldun Jodem"]).toHaveProperty(key);
            expect(state.characters["Zuibroldun Jodem"][key]).toEqual(
                expected[key]
            );
        }

        state.stats = [];
        state.characters = {};
    });

    it("Should create NPC with items", () => {
        state.stats = [];
        state.characters = {};
        let testItem = new Item("Staff of Zalos", [
            ["slot", "head"],
            ["dexterity", -5],
            ["nano machines", 3],
            ["effect", "bleeding"],
        ]);
        state.items = { "Staff of Zalos": testItem };

        const commandArguments = "Zuibroldun Jodem, $Staff of Zalos";
        const input: string = `Test !addnpc(${commandArguments}) message`;

        expect(addNPC(commandArguments, [0, 0], input)).toEqual(input);
        expect(state.characters).toHaveProperty("Zuibroldun Jodem");
        expect(state.out).toEqual(
            `\nNon-Playable Character Zuibroldun Jodem has been created with stats\n${CharacterToString(
                state.characters["Zuibroldun Jodem"]
            )}.`
        );

        const expected: { [key: string]: any } = {
            hp: state.startingHP,
            level: 1,
            experience: 0,
            expToNextLvl: experienceCalculation(1),
            skillpoints: 0,
            items: { head: testItem },
            type: "character",
            isNpc: true,
            stats: {},
        };

        for (const key in expected) {
            expect(state.characters["Zuibroldun Jodem"]).toHaveProperty(key);
            expect(state.characters["Zuibroldun Jodem"][key]).toEqual(
                expected[key]
            );
        }

        state.stats = [];
        state.characters = {};
    });
});
