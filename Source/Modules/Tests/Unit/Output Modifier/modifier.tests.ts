import { modifier } from "../../../Output Modifier/modifier";
import { state } from "../../../proxy_state";
import { RandomString } from "../../testutils";

describe("Output Modifier", () => {
    const inputText = `Zuibroldun Jodem is a great character name.`;

    it("Should return input text", () => {
        state.out = "";
        state.seenOutput = false;
        expect(modifier(inputText).text).toEqual(inputText);

        const randomText = RandomString(50);
        state.seenOutput = false;
        expect(modifier(randomText).text).toEqual(randomText);
    });

    it("Should return predefined state.out text", () => {
        const stateManualText = `\nMiguel Booble levelled up!`;
        state.out = stateManualText;
        state.seenOutput = false;
        expect(modifier(inputText).text).toEqual(stateManualText);

        const randomText = RandomString(50);
        state.seenOutput = false;
        expect(modifier(randomText).text).toEqual(stateManualText);
    });

    it("Should return random state.out text", () => {
        const stateRandomText = "\n" + RandomString(50);
        state.out = stateRandomText;
        state.seenOutput = false;
        expect(modifier(inputText).text).toEqual(stateRandomText);

        const randomText = RandomString(50);
        state.seenOutput = false;
        expect(modifier(randomText).text).toEqual(stateRandomText);
    });
});
