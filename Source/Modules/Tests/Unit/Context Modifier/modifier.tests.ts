import { modifier } from "../../../Context Modifier/modifier";
import { state } from "../../proxy_state";

describe("Context Modifier", () => {
    it("Should return normally", () => {
        const inputText = `Zuibroldun Jodem is a great character name.`;
        state.in = "";
        state.ctxt = "";
        expect(modifier(inputText).text).toEqual(inputText);
    });

    it("Should cut info", () => {
        const inputText = `Zuibroldun arrived at the scene.
        Zuibroldun tries to solve the mystery. Skillcheck performed: Zuibroldun with int 5 rolled 11. 15 + 11 = 26. Difficulty 25. Outcome: success.`;
        state.in = `Zuibroldun tries to solve the mystery. Skillcheck performed: Zuibroldun with int 5 rolled 11. 15 + 11 = 26. Difficulty 25. Outcome: success.`;
        state.ctxt = "Zuibroldun tries to solve the mystery. Outcome: success.";
        expect(modifier(inputText).text).toEqual(
            `Zuibroldun arrived at the scene.\nZuibroldun tries to solve the mystery. Outcome: success.`
        );
    });
});
