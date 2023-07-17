import setState from "../../../../Input Modifier/Commands/setstate";
import { state } from "../../../proxy_state";

describe("Command set state", () => {
    it("Should return nothing and override given value", () => {
        expect(setState('{"dice": 15}', [0, 0], "")).toEqual(" ");
        expect(state.dice).toEqual(15);
        state.dice = 20;
    });

    it("Invalid JSON error", () => {
        expect(setState("{dice:15}", [0, 0], "Test message")).toEqual(
            "Test message"
        );
        expect(state.message).toEqual("Set State: Invalid JSON state.");
    });
});
