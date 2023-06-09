import { state } from "../Tests/proxy_state";

export const ExitBattle = (): void => {
    state.inBattle = false;
    delete state.attackingCharacter, state.activeCharacterName;
    delete state.side1, state.side2;
    delete state.currentSide;
};
