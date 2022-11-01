//Context modifier

modifier = (text) => {
    const temp = text.indexOf(state.in);
    return {
        //Returns normally if context wasn't set in state, else whatever was set
        text:
            state.ctxt === undefined || state.ctxt === ""
                ? text
                : text.substring(0, temp) +
                  state.ctxt +
                  text.substring(temp + state.in.length),
    };
};

// Don't modify this part
modifier(text);
