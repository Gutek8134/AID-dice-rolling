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
    this.hp = state.startingHP;

    if (values !== undefined) {
      for (const el of values) {
        if (el[0] === "hp") {
          this.hp = el[1];
          continue;
        }
        this[el[0]] = new Stat(el[0], el[1]);
      }
    }
  }

  toString() {
    let temp = "";
    for (const key in this) {
      if (key === "hp") {
        temp += `hp: ${this.hp}, `;
        continue;
      }
      const value = this[key];
      temp += `${key}: ${value.level}, `;
    }
    return temp.substring(0, temp.length - 2) == ""
      ? "none"
      : temp.substring(0, temp.length - 2);
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
  for (const key in character) {
    if (key === "hp") {
      temp += `hp: ${character.hp}, `;
      continue;
    }
    const value = character[key];
    temp += `${key}: ${value.level}, `;
  }
  return temp.substring(0, temp.length - 2) == ""
    ? "none"
    : temp.substring(0, temp.length - 2);
};

const CharLives = (characterName) => {
  if (!ElementInArray(characterName, Object.keys(state.characters)))
    return false;
  if (!ElementInArray()) return state.characters[characterName].hp > 0;
};

const ElementInArray = (element, array) => {
  ret = false;
  if (element !== undefined && typeof array === "object") {
    for (const el of array) {
      if (el === element) {
        ret = true;
        break;
      }
    }
  }
  return ret;
};
