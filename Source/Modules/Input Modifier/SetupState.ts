import { state } from "../Tests/proxy_state";

const SetupState = (): void => {
    if (state !== undefined && state !== null) {
        state.stats = state.stats === undefined ? [] : state.stats;
        state.dice = state.dice === undefined ? 20 : state.dice;
        state.startingLevel =
            state.startingLevel === undefined ? 1 : state.startingLevel;
        state.startingHP =
            state.startingHP === undefined ? 100 : state.startingHP;
        state.characters =
            state.characters === undefined ? {} : state.characters;
        state.items = state.items === undefined ? {} : state.items;
        state.inventory = state.inventory === undefined ? [] : state.inventory;
        state.punishment =
            state.punishment === undefined ? 5 : state.punishment;
        state.skillpointsOnLevelUp =
            state.skillpointsOnLevelUp === undefined
                ? 5
                : state.skillpointsOnLevelUp;
        state.inBattle = state.inBattle === undefined ? false : state.inBattle;
    }
};

export default SetupState;
