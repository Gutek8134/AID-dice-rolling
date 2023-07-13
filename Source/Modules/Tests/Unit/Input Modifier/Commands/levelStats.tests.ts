import levelStats from "../../../../Input Modifier/Commands/levelStats";
import { SetLevellingToOblivion } from "../../../../Input Modifier/constants";
import { Character } from "../../../../Shared Library/Character";
import { CharacterToString } from "../../../../Shared Library/Utils";
import { state } from "../../../proxy_state";

describe("Command level stats", () => {
    it("Leveling to oblivion error", () => {
        SetLevellingToOblivion(true);
        expect(levelStats("", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual(
            "Level Stats: This command will work only when you are levelling your characters.\nIn current mode stats are levelling by themselves when you are using them."
        );
    });

    beforeEach(() => SetLevellingToOblivion(false));
    it("Invalid args error", () => {
        SetLevellingToOblivion(false);
        expect(levelStats("", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual(
            "Level Stats: Arguments were not given in proper format."
        );
    });

    it("Nonexistent character error", () => {
        levelStats("Zuibroldun, stamina+1", [], "");
        expect(state.message).toEqual(
            "Level Stats: Nonexistent characters can't level up."
        );
    });

    it("No skillpoints used error", () => {
        state.characters = { Zuibroldun: new Character() };
        levelStats("Zuibroldun, stamina+0", [], "");
        expect(state.message).toEqual(
            "Level Stats: You need to use at least one skillpoint."
        );
    });

    it("Not enough skillpoints error", () => {
        state.characters = { Zuibroldun: new Character() };
        state.characters.Zuibroldun.skillpoints = 0;
        levelStats("Zuibroldun, stamina+1", [], "");
        expect(state.message).toEqual(
            "Level Stats: Zuibroldun doesn't have enough skillpoints (0/1)."
        );
    });

    it("Restricted name error", () => {
        state.characters = { Zuibroldun: new Character() };
        state.characters.Zuibroldun.skillpoints = 3;
        levelStats("Zuibroldun, hp+1, skillpoints+2", [], "");
        expect(state.message).toEqual(
            "\nLevel Stats: hp cannot be levelled up.\nLevel Stats: skillpoints cannot be levelled up."
        );
    });

    it("Should level up stats", () => {
        state.characters = { Zuibroldun: new Character() };
        state.characters.Zuibroldun.skillpoints = 3;

        const oldStats = CharacterToString(state.characters.Zuibroldun);
        levelStats("Zuibroldun, fire+1, explosion+2", [], "");

        expect(state.out).toEqual(
            `Zuibroldun's stats has been levelled\nfrom\n${oldStats}\nto\n${CharacterToString(
                state.characters.Zuibroldun
            )}.`
        );

        expect(state.characters.Zuibroldun.stats.fire.level).toEqual(1);
        expect(state.characters.Zuibroldun.stats.explosion.level).toEqual(2);
    });
});
