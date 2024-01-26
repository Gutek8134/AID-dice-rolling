import { modifier } from "../../../Input Modifier/modifier";
import { Character } from "../../../Shared Library/Character";
import { state } from "../../../proxy_state";

describe("Input Modifier", () => {
    it("In Battle", () => {
        state.inBattle = true;
        state.active = state.side1 = state.side2 = ["a", "b"];
        state.activeCharacter = new Character();
        modifier("");

        delete state.active;
        delete state.currentSide, state.side1, state.side2;
        state.inBattle = false;
    });

    it("Should set state.in", () => {
        state.inBattle = false;
        const cache = modifier("aaa !addcharacter(Zuibroldun)").text;

        expect(cache).toEqual(state.in);
    });
});
