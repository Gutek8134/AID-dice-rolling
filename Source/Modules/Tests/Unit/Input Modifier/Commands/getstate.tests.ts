import getState from "../../../../Input Modifier/Commands/getstate";
import { state } from "../../../proxy_state";

describe("Command get state", () => {
    it("Command doesn't take arguments error", () => {
        getState("aaaa", [], "");
        expect(state.message).toEqual(
            "Get State: command doesn't take any arguments."
        );
    });

    it("Should print state", () => {
        getState("", [], "");
        expect(state.out).toEqual(
            "\n----------\n\n" + JSON.stringify(state) + "\n\n----------\n"
        );
    });
});
