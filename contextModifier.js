//Context modifier

modifier = (text) => {
  return {
    //Returns normally if context wasn't set in state, else whatever was set
    text: state.ctxt === undefined || state.ctxt === "" ? text : state.ctxt,
  };
};

// Don't modify this part
modifier(text);
