const modifier = (text) => {
    const temp = text.lastIndexOf(state.in);
    return {
        //Returns normally if context wasn't set in state, else whatever was set + previous context
        text: !state.ctxt
            ? text
            : text.substring(0, temp) +
                state.ctxt +
                text.substring(temp + state.in.length),
    };
};

modifier(text);