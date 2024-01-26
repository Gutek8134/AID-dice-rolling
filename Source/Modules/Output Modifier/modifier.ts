import { state } from "../proxy_state";

export const modifier = (text: string): { text: string; stop?: boolean } => {
    if (state.message == "") delete state.message;
    return {
        //Returns normally if output wasn't set in state, else whatever was set
        text: state.out === undefined || state.out === "" ? text : state.out,
    };
};
