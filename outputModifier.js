//Output modifier

modifier = (text) => {
  return {
    //Returns normally if output wasn't set in state, else whatever was set
    text: state.out === undefined || state.out === "" ? text : state.out,
  };
};

// Don't modify this part
modifier(text);
