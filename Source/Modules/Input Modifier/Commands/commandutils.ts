import { state } from "../../Tests/proxy_state";

export const CutCommandFromContext = (
    modifiedText: string,
    currIndices: number[]
) => {
    state.ctxt =
        state.ctxt !== ""
            ? state.ctxt.substring(0, currIndices[0]) +
              state.ctxt.substring(currIndices[1])
            : modifiedText.substring(0, currIndices[0]) +
              modifiedText.substring(currIndices[1]);
};
