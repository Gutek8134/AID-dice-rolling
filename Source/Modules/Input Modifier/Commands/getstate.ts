import { state } from "../../Tests/proxy_state";
import { CutCommandFromContext } from "./commandutils";

const getState = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);
    if (commandArguments) {
        state.message = "Get State: command doesn't take any arguments.";
        return modifiedText;
    }

    //Sets data to print out
    state.out = "\n----------\n\n" + JSON.stringify(state) + "\n\n----------\n";
    return modifiedText;
};

export default getState;
