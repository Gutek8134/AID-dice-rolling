import { Stat } from "../../../Shared Library/Stat";
import { state } from "../../proxy_state";
import { SetLevellingToOblivion } from "../../../Input Modifier/constants";
import { experienceCalculation } from "../../../Shared Library/Utils";

describe("Stat creation", () => {
    it("Should create default level common stat", () => {
        SetLevellingToOblivion(false);
        state.startingLevel = 1;
        state.stats = [];

        const stat = new Stat("dexterity");
        const expected: { [key: string]: any } = {
            level: 1,
            type: "stat",
        };
        for (const key in stat) {
            expect(stat).toHaveProperty(key);
            expect(stat[key]).toEqual(expected[key]);
        }
    });

    it("Should create default level Oblivion stat", () => {
        SetLevellingToOblivion(true);
        state.startingLevel = 1;
        state.stats = ["strength"];

        const stat = new Stat("strength");
        const expected: { [key: string]: any } = {
            level: 1,
            experience: 0,
            expToNextLvl: experienceCalculation(1),
            type: "stat",
        };
        for (const key in stat) {
            expect(stat).toHaveProperty(key);
            expect(stat[key]).toEqual(expected[key]);
        }
    });

    it("Should create common stat", () => {
        SetLevellingToOblivion(true);
        state.startingLevel = 1;
        state.stats = [];

        const stat = new Stat("dexterity", 5);
        const expected: { [key: string]: any } = {
            level: 5,
            type: "stat",
        };
        for (const key in stat) {
            expect(stat).toHaveProperty(key);
            expect(stat[key]).toEqual(expected[key]);
        }
    });

    it("Should create Oblivion stat", () => {
        SetLevellingToOblivion(true);
        state.startingLevel = 1;
        state.stats = [];

        const stat = new Stat("dexterity", 3);
        const expected: { [key: string]: any } = {
            level: 3,
            experience: 0,
            expToNextLvl: experienceCalculation(3),
            type: "stat",
        };
        for (const key in stat) {
            expect(stat).toHaveProperty(key);
            expect(stat[key]).toEqual(expected[key]);
        }
    });

    it("Should not have create copy names in state.stats", () => {
        SetLevellingToOblivion(true);
        state.startingLevel = 1;
        state.stats = ["dexterity"];

        new Stat("strength");
        new Stat("strength");
        new Stat("strength");
        new Stat("intelligence");
        new Stat("intelligence");

        expect(state.stats).toEqual(["dexterity", "strength", "intelligence"]);
    });
});
