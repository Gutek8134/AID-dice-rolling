import SetupState from "../../../Input Modifier/SetupState";
import { state } from "../../../proxy_state";

describe("State setup", () => {
    it("", () => {
        const expected: any = {
            stats: [],
            dice: 20,
            startingLevel: 1,
            startingHP: 100,
            characters: {},
            items: {},
            inventory: [],
            effects: {},
            punishment: 5,
            skillpointsOnLevelUp: 5,
            inBattle: false,
            ctxt: "",
            in: "",
            message: "",
            out: "",
            runEffectsOutsideBattle: false,
            seenOutput: false,
        };
        SetupState();

        expect(state).toEqual(expected);
    });
});
