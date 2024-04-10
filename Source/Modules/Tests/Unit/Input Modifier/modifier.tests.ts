import { modifier } from "../../../Input Modifier/modifier";
import { Character, NPC } from "../../../Shared Library/Character";
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

    it("Run Command", () => {
        expect(
            modifier(
                " !addcharacter(Zuibroldun Jodem, dexterity=3, nano machines = 5)"
            ).text
        ).toEqual(
            " !addcharacter(Zuibroldun Jodem, dexterity=3, nano machines = 5)"
        );
    });

    describe("Should not crash when the battle ends", () => {
        it("Death on first turn", () => {
            state.characters = {
                "Zuibroldun Jodem": new NPC([["hp", 1]]),
                "Miguel Booble": new NPC([["hp", 1]]),
            };

            modifier("!battle((Zuibroldun Jodem), (Miguel Booble))");
            if (state.currentSide == "side1") modifier("(Miguel Booble)");
            else modifier("(Zuibroldun Jodem)");
        });

        it("Death on after more turns", () => {
            state.characters = {};
            state.stats = [];
            modifier("!addnpc(Zuibroldun Jodem, hp=50)");
            console.log(state.out);
            modifier("!addnpc(Miguel Booble, hp=50)");
            console.log(state.out);
            modifier("!battle((Zuibroldun Jodem), (Miguel Booble))");
            console.log(state.out);
            let i = 0;
            while (
                state.characters["Zuibroldun Jodem"]?.hp > 0 &&
                state.characters["Miguel Booble"]?.hp > 0 &&
                state.characters["Zuibroldun Jodem"] &&
                state.characters["Miguel Booble"]
            ) {
                console.log(
                    `Turn ${i++} - Z ${
                        state.characters["Zuibroldun Jodem"].hp
                    } M ${state.characters["Miguel Booble"].hp}`
                );
                if (state.currentSide == "side1") modifier("(Miguel Booble)");
                else modifier("(Zuibroldun Jodem)");
            }
        });
    });
});
