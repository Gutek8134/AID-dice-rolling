import SetupState from "../../../Input Modifier/SetupState";
import { state } from "../../proxy_state";

describe("State setup", () => {
    const expected: any = {
        stats: [],
        dice: 20,
        startingLevel: 1,
        startingHP: 100,
        characters: {},
        items: {},
        inventory: [],
        punishment: 5,
        skillpointsonLevelUp: 5,
        inBattle: false,
    };
    SetupState();

    for (const key in expected) {
        expect(state[key]).toEqual(expected[key]);
    }
});
