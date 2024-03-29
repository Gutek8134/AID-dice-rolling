import getState from "../../../../Input Modifier/Commands/getState";
import { state } from "../../../../proxy_state";

describe("Command get state", () => {
    it("Command doesn't take arguments error", () => {
        getState("aaaa", [], "");
        expect(state.message).toEqual(
            "Get State: command doesn't take any arguments."
        );
    });

    it("Should print state", () => {
        const cache = JSON.stringify(state);
        getState("", [], "");
        expect(state.out).toEqual(
            "\n----------\n\n" + cache + "\n\n----------\n"
        );
    });
});
