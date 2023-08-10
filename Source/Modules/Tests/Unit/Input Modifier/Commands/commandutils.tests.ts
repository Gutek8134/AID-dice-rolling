import { CutCommandFromContext } from "../../../../Input Modifier/Commands/commandutils";
import { state } from "../../../proxy_state";

describe("Command Utilities", () => {
    it("Should cut command from context", () => {
        CutCommandFromContext("aaabbbb", [2, 4]);
        expect(state.ctxt).toEqual("aabbb");
        state.ctxt = "";
        CutCommandFromContext("Yolo !test lo", [5, 10]);
        expect(state.ctxt).toEqual("Yolo  lo");
    });
});
