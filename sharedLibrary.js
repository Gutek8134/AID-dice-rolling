class Stat {
  constructor(name, level) {
    if (
      typeof name === "string" &&
      (typeof level === "number" || typeof level === "undefined")
    ) {
      if (!isInStats(name)) {
        state.stats.push(name);
      }
      this.level = level === undefined ? state.startingLevel : level;
    }
  }
  toString() {
    return this.level.toString();
  }
}

//Blank character with starting level stats
class Character {
  constructor(values) {
    state.stats.forEach((stat) => {
      this[stat] = new Stat(stat, state.startingLevel);
    });

    if (values !== undefined) {
      values.forEach((el) => {
        this[el[0]] = new Stat(el[0], el[1]);
      });
    }
  }

  toString() {
    let temp = "";
    for (let key in this) {
      const value = this[key];
      temp += `${key}: ${value.level}, `;
    }
    return temp.substring(0, temp.length - 2);
  }
}

const isInStats = (name) => {
  for (i in state.stats) {
    if (name == state.stats[i]) {
      return true;
    }
  }
  return false;
};

//Generates a value between 1 and maxValue
const diceRoll = (maxValue) => {
  return Math.floor(Math.random() * maxValue) + 1;
};

const CharToString = (character) => {
  let temp = "";
  for (let key in character) {
    const value = character[key];
    temp += `${key}: ${value.level}, `;
  }
  return temp.substring(0, temp.length - 2);
};
