import { state } from "../../Tests/proxy_state";
import { CutCommandFromContext } from "./commandutils";

const setState = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);

    //Looks for pattern !setState(anything)
    const exp = /(?<json>.+)/i;
    const match = commandArguments.match(exp);

    //Null check
    if (!match || !match.groups) {
        state.message =
            "Set State: You need to enter a parameter to setState command.";
        return modifiedText;
    }

    //Ensuring data won't be accidentally purged along with error handling
    //TODO: Still can override it poorly and break everything :p
    let cache: any;
    try {
        cache = JSON.parse(match.groups.json);
    } catch (SyntaxError) {
        cache = state;
        state.message = "Set State: Invalid JSON state.";
        return modifiedText;
    }

    if (cache) {
        for (const key in cache) {
            state[key] = cache[key];
        }
    }

    return " ";
};

export default setState;
