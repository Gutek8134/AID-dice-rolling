import skillcheck from "../../../../Input Modifier/Commands/skillcheck";
import { SetLevellingToOblivion } from "../../../../Input Modifier/constants";
import { Character } from "../../../../Shared Library/Character";
import { SetFixedRollOutcome } from "../../../../Shared Library/Utils";
import { state } from "../../../proxy_state";

describe("Command skillcheck", () => {
    it("Invalid args error", () => {
        expect(skillcheck("", [0, 0], "Test message")).toEqual("Test message");
        expect(state.message).toEqual(
            "Skillcheck: Arguments were not given in proper format."
        );
    });

    it("Nonexistent stat error", () => {
        expect(
            skillcheck("explosion, Zuibroldun, 5", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Skillcheck: Stat explosion does not exist."
        );
    });

    it("Nonexistent character error", () => {
        state.stats = ["explosion"];

        expect(
            skillcheck("explosion, Zuibroldun, 5", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Skillcheck: Character Zuibroldun doesn't exist."
        );
    });

    it("Bad thresholds error", () => {
        state.stats = ["explosion"];
        state.characters = { Zuibroldun: new Character() };

        expect(
            skillcheck("explosion, Zuibroldun, :5", [0, 0], "Test message")
        ).toEqual("Test message");
        expect(state.message).toEqual(
            "Skillcheck: Thresholds are not in proper format."
        );
    });

    beforeEach(() => SetFixedRollOutcome(true, 1));

    it("Should perform skillcheck", () => {
        SetLevellingToOblivion(false);
        state.stats = ["explosion"];
        state.characters = { Zuibroldun: new Character() };

        expect(skillcheck("explosion, Zuibroldun, 5", [0, 0], "")).toEqual(
            "Skillcheck performed: Zuibroldun with explosion: 1 rolled 1. 1 + 1 = 2. Difficulty: 5 Outcome: failure."
        );
        expect(state.ctxt).toEqual("Outcome: failure.");
        state.characters.Zuibroldun.experience = 0;
        state.characters.Zuibroldun.stats["explosion"].level += 5;

        expect(skillcheck("explosion, Zuibroldun, 5:10", [0, 0], "")).toEqual(
            "Skillcheck performed: Zuibroldun with explosion: 1 rolled 1. 6 + 1 = 7. Difficulty: 5, 10 Outcome: nothing happens."
        );
        expect(state.ctxt).toEqual("Outcome: nothing happens.");
        state.characters.Zuibroldun.experience = 0;
        state.characters.Zuibroldun.stats["explosion"].level += 5;

        expect(
            skillcheck("explosion, Zuibroldun, 5:10:15", [0, 0], "")
        ).toEqual(
            "Skillcheck performed: Zuibroldun with explosion: 1 rolled 1. 11 + 1 = 12. Difficulty: 5, 10, 15 Outcome: success."
        );
        expect(state.ctxt).toEqual("Outcome: success.");
        state.characters.Zuibroldun.experience = 0;
        state.characters.Zuibroldun.stats["explosion"].level += 5;

        expect(
            skillcheck("explosion, Zuibroldun, 5:10:15:20", [0, 0], "")
        ).toEqual(
            "Skillcheck performed: Zuibroldun with explosion: 1 rolled 1. 16 + 1 = 17. Difficulty: 5, 10, 15, 20 Outcome: success."
        );
        expect(state.ctxt).toEqual("Outcome: success.");
        state.characters.Zuibroldun.experience = 0;
        state.characters.Zuibroldun.stats["explosion"].level += 5;

        expect(
            skillcheck(
                "explosion, Zuibroldun, 5 = a : 10 = b : 15 = c : 20 = d : 25 = e",
                [0, 0],
                ""
            )
        ).toEqual(
            "Skillcheck performed: Zuibroldun with explosion: 1 rolled 1. 21 + 1 = 22. Difficulty: 5, 10, 15, 20, 25 Outcome: d"
        );
        expect(state.ctxt).toEqual("Outcome: d");
    });

    it("Should add xp", () => {
        state.stats = ["explosion"];
        state.characters = { Zuibroldun: new Character() };
        SetLevellingToOblivion(true);
        skillcheck("explosion, Zuibroldun, 5", [0, 0], "");
        expect(
            state.characters.Zuibroldun.stats["explosion"].experience
        ).toEqual(1);
        SetLevellingToOblivion(false);
        skillcheck("explosion, Zuibroldun, 5", [0, 0], "");
        expect(state.characters.Zuibroldun.experience).toEqual(1);
    });

    it("Should punish", () => {
        state.stats = ["explosion"];
        state.characters = { Zuibroldun: new Character() };

        state.punishment = 5;
        state.characters.Zuibroldun.hp = 0;
        expect(skillcheck("explosion, Zuibroldun, 5", [0, 0], "")).toEqual(
            "Skillcheck performed: Zuibroldun with explosion: -4 rolled 1. -4 + 1 = -3. Difficulty: 5 Outcome: failure."
        );
        expect(state.message).toEqual(
            "Skillcheck: Testing against dead character. Punishment: -5 (temporary)."
        );
    });
});
