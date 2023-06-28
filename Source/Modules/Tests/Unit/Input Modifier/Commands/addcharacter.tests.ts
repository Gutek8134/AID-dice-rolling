import addCharacter from "../../../../Input Modifier/Commands/addcharacter";
import { state } from "../../../proxy_state";

describe("Command add character", () => {
    it("Improper args", () => {
        expect(addCharacter("", [0, 0], "Test message")).toEqual(
            "Test message"
        );
        expect(state.message).toEqual(
            "Add Character: Arguments were not given in proper format."
        );
    });
});
