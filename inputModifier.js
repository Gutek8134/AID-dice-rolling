// Input modifier

//!Function for calculating damage. Adjust it to your heart's content.
//!Just make sure it won't divide by 0 (finally putting all the hours spent on learning math in high school to good use).
const damage = (attackStat, defenseStat) => {
  const dam =
    /*You can edit from here*/ attackStat +
    diceRoll(20) -
    defenseStat; /*to here*/

  //attackStat means attacker's statistic picked on calling !attack()
  //defenseStat is, accordingly, defender's stat
  //diceRoll(n) rolls an n-sided dice with values from 1 to n
  //Use only natural numbers, as the script will break otherwise

  //Other example
  //const dam = (attackStat / defenseStat) * diceRoll(20);
  //Where "*" means multiplication and "/" means division

  //Raising to the power can be done using Math.pow(number1, number2)
  //Where number one is base and number2 is exponential

  return dam;
};

//You can edit this list to edit what will be displayed when dealing x damage.
//Format is [minimum damage, "displayed message"].
//Note that it is used in sentence like
//Miguel attacked Zuibroldun Jodem dealing {value from here} (x).
const damageOutputs = [
  [1, "light damage"],
  [15, "medium damage"],
  [30, "significant damage"],
  [60, "heavy damage"],
  [100, "killing blow"],
];

//!Does not check whether stats are equal to 0 when attacking. Change only if your damage function does not contain division or you've checked it properly.
const ignoreZeroDiv = false;

//!Sets whether dead characters should be punished upon skillchecking
const shouldPunish = true;

//!Turns on debug code
const DEBUG = false;

//Comment this if statement when debugging. End at line 170.
if (DEBUG) {
  //Dummy state
  let state = {
    stats: [],
    dice: 20,
    startingLevel: 1,
    startingHP: 100,
    characters: {},
    punishment: 5,
  };

  //!Since I cannot import shared library locally, I will copy everything here. Debug purposes only.

  //Increasing scalability by OOP
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

  //Returns whether character exists and has more than 0 HP, returns bool
  const CharLives = (character) => {
    if (!ElementInArray(character, Object.keys(state.characters))) return false;

    return state.characters[character].hp > 0;
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
  //!End of shared library

  //dummy character
  /*
state.characters.Miguel = new Character();
state.characters.Miguel.str = new Stat("str");
state.characters.Miguel.dex = new Stat("dex", 10);
state.characters.Miguel.int = new Stat("int", 5);*/
}

//Produces outcome from two-dimensional array in format [[minimum score, outcome],]
const CustomOutcome = (score, values) => {
  let i = 0;
  let out = "nothing happens.";

  while (score >= values[i][0]) {
    out = values[i++][1];
    if (values[i] === undefined) {
      break;
    }
  }
  return out;
};

const CustomDamageOutput = (dam, values) => {
  let i = 0;
  let out = "no damage";

  while (dam >= values[i][0]) {
    out = values[i++][1];
    if (values[i] === undefined) {
      break;
    }
  }
  return out;
};

//Produces a string of difficulties from an array
const CustomDifficulties = (values) => {
  let temp = "";
  values.forEach((element) => {
    temp += element[0] + ", ";
  });
  return temp.substring(0, temp.length - 1);
};

const SetupState = () => {
  if (state !== undefined && state !== null) {
    state.stats = state.stats === undefined ? [] : state.stats;
    state.dice = state.dice === undefined ? 20 : state.dice;
    state.startingLevel =
      state.startingLevel === undefined ? 1 : state.startingLevel;
    state.startingHP = state.startingHP === undefined ? 100 : state.startingHP;
    state.characters = state.characters === undefined ? {} : state.characters;
    state.punishment = state.punishment === undefined ? 5 : state.punishment;
  }
};

//Purges the command from context
const CutCommand = () => {
  state.ctxt =
    state.ctxt !== ""
      ? state.ctxt.substring(0, currIndices[0]) +
        state.ctxt.substring(currIndices[1], state.ctxt.length)
      : modifiedText.substring(0, currIndices[0]) +
        modifiedText.substring(currIndices[1], modifiedText.length);
};

//#region skillcheck
const skillcheck = (arguments) => {
  //Error checking
  if (arguments === undefined || arguments === null || arguments === "") {
    state.message = "No arguments found.";
    CutCommand();
    return;
  }

  //Checks for format stat, character, thresholds , outputs groups character and thresholds, that are matched later
  const exp = /(?<stat>\w+), (?<character>[\w\s']+), (?<thresholds>.+)/i;

  //Checks for thresholds type
  const thresholdCheck =
    /(?<thresholdsC>\d+ *= *\w[\w\s\.]*(?: *: *\d+ *= *\w[\w\s\.]*)+)|(?<thresholds4>\d+ *: *\d+ *: *\d+ *: *\d+)|(?<thresholds3>\d+ *: *\d+ *: *\d+)|(?<thresholds2>\d+ *: *\d+)|(?<thresholds1>\d+)/i;

  const match = arguments.match(exp);
  //console.log(match);

  //Firstly, checks if something matched
  if (match === null) {
    state.message = "Arguments were not given in proper format.";
    CutCommand();
    return;
  }
  //Regex matched, so program is rolling the dice
  const roll = diceRoll(state.dice);

  //Grabbing necessary info
  const stat = match.groups["stat"];
  const char = match.groups["character"];

  //Testing if stat exists, throwing error otherwise
  if (!ElementInArray(stat, state.stats)) {
    state.message = "Specified stat does not exist";
    CutCommand();
    return;
  }

  //Shortening access path to character object
  let character = state.characters[char];

  //If you didn't create a character earlier, they get all stats at starting level from state
  if (character === undefined) {
    state.characters[char] = new Character();
    character = state.characters[char];
  }

  let punishment = false;
  if (character.hp < 1 && shouldPunish) {
    state.message = `Testing against dead character. Punishment: -${state.punishment} to all stats (temporary).`;
    for (key in character) {
      if (key !== "hp") {
        character[key].level -= state.punishment;
      }
    }
    punishment = true;
  }

  //Don't have a stat? No problem! You'll have a 0 instead! That's even worse than the default starting value!
  const charStat = character[stat] !== undefined ? character[stat].level : 0;
  //console.log(char + ", " + stat + ": "+ charStat);

  //Grabs thresholds
  const thresholds = arguments.match(thresholdCheck);
  if (thresholds === null) {
    state.message = "Thresholds are not in proper format";
    CutCommand();
    return;
  }

  //Tricky part, checking every group for data
  for (key in thresholds.groups) {
    //Grabbing necessary info
    let value = thresholds.groups[key];

    //null check
    if (
      value !== undefined &&
      currIndices !== undefined &&
      character !== undefined
    ) {
      const score = roll + charStat;
      let mess = `Skillcheck performed: ${char} with ${stat} ${charStat} rolled ${roll}. ${charStat} + ${roll} = ${score}. Difficulty: ${value} Outcome: `;

      let outcome;
      let custom = false;
      //Handling the skillcheck
      switch (key) {
        //One threshold means success or failure
        case "thresholds1":
          outcome = score >= Number(value.trim()) ? "success." : "failure.";
          break;

        //Two of them - success, nothing, failure
        case "thresholds2":
          value = value
            .split(":")
            .map((el) => Number(el.trim()))
            .sort((a, b) => a - b);

          mess = `Skillcheck performed: ${char} with ${stat} ${charStat} rolled ${roll}. ${charStat} + ${roll} = ${score}. Difficulty: ${value.join(
            ", "
          )} Outcome: `;

          if (score >= value[1]) {
            outcome = "success.";
          } else if (score >= value[0]) {
            outcome = "nothing happens.";
          } else {
            outcome = "failure.";
          }
          break;

        //Three of them - critical success, success, failure or critical failure
        case "thresholds3":
          value = value
            .split(":")
            .map((el) => Number(el.trim()))
            .sort((a, b) => a - b);

          mess = `Skillcheck performed: ${char} with ${stat} ${charStat} rolled ${roll}. ${charStat} + ${roll} = ${score}. Difficulty: ${value.join(
            ", "
          )} Outcome: `;

          if (score >= value[2]) {
            outcome = "critical success.";
          } else if (score >= value[1]) {
            outcome = "success.";
          } else if (score >= value[0]) {
            outcome = "failure.";
          } else {
            outcome = "critical failure.";
          }
          break;

        //Four of them - critical success, success, nothing, failure or critical failure
        case "thresholds4":
          value = value
            .split(":")
            .map((el) => Number(el.trim()))
            .sort((a, b) => a - b);
          mess = `Skillcheck performed: ${char} with ${stat} ${charStat} rolled ${roll}. ${charStat} + ${roll} = ${score}. Difficulty: ${value.join(
            ", "
          )} Outcome: `;

          if (score >= value[3]) {
            outcome = "critical success.";
          } else if (score >= value[2]) {
            outcome = "success.";
          } else if (score >= value[1]) {
            outcome = "nothing happens.";
          } else if (score >= value[0]) {
            outcome = "failure.";
          } else {
            outcome = "critical failure.";
          }
          break;

        //Custom thresholds with outcomes
        case "thresholdsC":
          value = value.split(":").map((el) => {
            const temp = el.split("=").map((el) => el.trim());
            return [Number(temp[0]), temp[1]];
          });

          mess = `Skillcheck performed: ${char} with ${stat} ${charStat} rolled ${roll}. ${charStat} + ${roll} = ${score}. Difficulty: ${CustomDifficulties(
            value
          )} Outcome: `;
          custom = true;
          break;

        //Read message
        default:
          console.error("WTF is this?!");
          state.message =
            "An error has ocurred. Context: no group has been matched. \nIDK how did you make it, but think about creating an issue.";
          return;
      }

      //Modifying context and input. Custom thresholds are handled differently, so they are separated
      if (!custom) {
        state.ctxt =
          modifiedText.substring(0, currIndices[0]) +
          "Outcome: " +
          outcome +
          modifiedText.substring(currIndices[1], modifiedText.length);

        modifiedText =
          modifiedText.substring(0, currIndices[0]) +
          mess +
          outcome +
          modifiedText.substring(currIndices[1], modifiedText.length);
      } else {
        state.ctxt =
          modifiedText.substring(0, currIndices[0]) +
          CustomOutcome(score, value) +
          modifiedText.substring(currIndices[1], modifiedText.length);

        modifiedText =
          modifiedText.substring(0, currIndices[0]) +
          mess +
          CustomOutcome(score, value) +
          modifiedText.substring(currIndices[1], modifiedText.length);
      }
    }
  }
  if (punishment) {
    for (key in character) {
      if (key !== "hp") {
        character[key].level += state.punishment;
      }
    }
  }
};
//#endregion skillcheck

//#region attack
const attack = (arguments) => {
  //Error checking
  if (arguments === undefined || arguments === null || arguments === "") {
    state.message = "No arguments found.";
    CutCommand();
    return;
  }

  //Checks for format stat, character, stat, character
  const exp =
    /(?<attackingCharacter>[\w\s']+), *(?<attackStat>\w+), *(?<defendingCharacter>[\w\s']+), *(?<defenseStat>\w+)/i;

  const match = arguments.match(exp);

  //Error checking
  if (match === null) {
    state.message = "No matching arguments found.";
    CutCommand();
    return;
  }

  //Checks if stats exist
  if (!ElementInArray(match.groups.attackStat, state.stats)) {
    state.message = "Attacking stat was not created.";
    CutCommand();
    return;
  }
  if (!ElementInArray(match.groups.defenseStat, state.stats)) {
    state.message = "Defending stat was not created.";
    CutCommand();
    return;
  }

  //Creates shortcuts to names and stats
  const attChar = match.groups.attackingCharacter;
  const attackStat = match.groups.attackStat;
  const defChar = match.groups.defendingCharacter;
  const defenseStat = match.groups.defenseStat;

  //Grabs the info
  let attackingCharacter = state.characters[attChar];
  let defendingCharacter = state.characters[defChar];

  //If you didn't create the characters earlier, they get all stats at starting level from state
  if (attackingCharacter === undefined) {
    state.characters[attChar] = new Character();
    attackingCharacter = state.characters[attChar];
  } else if (attackingCharacter.hp <= 0) {
    state.message = `${attChar} cannot attack, because they are dead.`;
    CutCommand();
    return;
  }

  if (defendingCharacter === undefined) {
    state.characters[defChar] = new Character();
    defendingCharacter = state.characters[defChar];
  } else if (defendingCharacter.hp <= 0) {
    state.message = `${defChar} cannot be attacked, because they are dead.`;
    CutCommand();
    return;
  }

  //Don't have a stat? No problem! You'll have a 0 instead! That's even worse than the default starting value!
  let attCharStat =
    attackingCharacter[attackStat] !== undefined
      ? attackingCharacter[attackStat].level
      : 0;
  let defCharStat =
    defendingCharacter[defenseStat] !== undefined
      ? defendingCharacter[defenseStat].level
      : 0;

  //(Unless you are not ignoring zero division. In this case zeroes are changed to ones to avoid zero division error.)
  if (!ignoreZeroDiv) {
    attCharStat = attCharStat === 0 ? 1 : attCharStat;
    defCharStat = defCharStat === 0 ? 1 : defCharStat;
  }

  //Calculating damage
  const dam = damage(attCharStat, defCharStat);
  //Damaging
  state.characters[defChar].hp -= dam;
  if (state.characters[defChar].hp < 0) {
    state.characters[defChar].hp = 0;
  }

  //Modifies the context, so AI will not know the exact values
  const mess = `${attChar} attacked ${defChar} dealing ${CustomDamageOutput(
    dam,
    damageOutputs
  )}.${state.characters[defChar].hp <= 0 ? "\n" + defChar + " died." : ""}`;

  state.ctxt =
    state.ctxt !== ""
      ? state.ctxt.substring(0, currIndices[0]) +
        mess +
        state.ctxt.substring(currIndices[1], state.ctxt.length)
      : modifiedText.substring(0, currIndices[0]) +
        mess +
        modifiedText.substring(currIndices[1], modifiedText.length);

  //Gives the player necessary info.
  modifiedText =
    modifiedText.substring(0, currIndices[0]) +
    `${attChar} (${attackStat}: ${attCharStat}) attacked ${defChar} (${defenseStat}: ${defCharStat}) dealing ${CustomDamageOutput(
      dam,
      damageOutputs
    )} (${dam}).\n${
      state.characters[defChar].hp <= 0
        ? defChar + " died."
        : defChar + " now has " + state.characters[defChar].hp + "hp."
    }` +
    modifiedText.substring(currIndices[1]);
};
//#endregion attack

//#region heal
const heal = (arguments) => {
  CutCommand();
  //Looks for character, (d)number pattern. If d exists, dice is rolled, else number is used as is.
  const exp = /(?<character>[\w\s']+), *(?<value>d{0,1}\d+)/i;
  const match = arguments.match(exp);

  //Null check
  if (match === null) {
    state.message = "Heal: Arguments were not given in proper format.";
    return;
  }

  //Shortcut
  const char = match.groups.character;
  //Checks if character exists
  if (!ElementInArray(char, Object.keys(state.characters))) {
    state.message = "Heal: Nonexistent characters can't be healed.";
    return;
  }

  //Another shortcut
  const character = state.characters[char];
  //Checks if character is dead
  if (character.hp < 1) {
    state.message = "Heal: Dead characters must be revived before healing.";
    return;
  }

  //Rolls a dice or just sets the value from args
  const value =
    match.groups.value.toLowerCase()[0] === "d"
      ? diceRoll(Number(match.groups.value.substring(1)))
      : Number(match.groups.value);

  //Healing
  state.characters[char].hp += value;

  //Output information
  state.out = `Character ${char} was healed by ${value} hp. Current hp: ${character.hp}.`;
};
//#endregion heal

//#region revive
const revive = (arguments) => {
  CutCommand();
  //Looks for pattern reviving character, revived character, revive value
  const exp =
    /(?<revivingCharacter>[\w\s']+), *(?<revivedCharacter>[\w\s']+), *(?<value>\d+)/i;
  const match = arguments.match(exp);

  //Null check
  if (match === null) {
    state.message = "Revive: Arguments were not given in proper format.";
    return;
  }

  //Shortcuts
  const value = Number(match.groups.value);
  const revChar = match.groups.revivingCharacter;
  const dedChar = match.groups.revivedCharacter;

  //Checks for reviving char
  if (!ElementInArray(revChar, Object.keys(state.characters))) {
    state.message = "Revive: Reviving character doesn't exist.";
    return;
  }
  const revCharacter = state.characters[revChar];
  if (revCharacter.hp <= value) {
    state.message =
      "Revive: Reviving character would die if this action would be performed. Their hp is too low.\nRevive was not performed.";
    return;
  }

  //Check for revived char
  if (!ElementInArray(dedChar, Object.keys(state.characters))) {
    state.message = "Revive: Revived character doesn't exist.";
    return;
  }
  const dedCharacter = state.characters[dedChar];

  //Reviving/transfusion
  state.characters[revChar].hp -= value;
  state.characters[dedChar].hp += value;

  //Custom output
  state.out = `${revChar} transfused ${value} hp to ${dedChar}${
    dedCharacter.hp === value ? ", reviving " + dedChar : ""
  }. Resulting hp: ${revChar}: ${revCharacter.hp}, ${dedChar}: ${
    dedCharacter.hp
  }.`;
};
//#endregion revive

//#region addCharacter
addCharacter = (arguments) => {
  //Looks for pattern !addCharacter(name) or !addCharacter(name, stat1=value, stat2=value, ..., statN=value)
  const exp = /(?<character>[\w\s'`]+)(?<startingStats>(?:, \w+ *= *\d+)*)/i;

  //Matches the RegEx
  const match = arguments.match(exp);

  //Null check
  if (match !== null) {
    //Grabbing info
    const char = match.groups.character;

    //Converts values to format [[stat, val], [stat2, val], ... [statN, val]]
    let values = match.groups.startingStats
      .substring(2, match.groups.startingStats.length)
      .split(", ")
      .map((el) => el.trim().split("="));

    for (i in values) {
      curr = values[i];
      curr = [curr[0].trim(), Number(curr[1])];
      values[i] = curr;
    }
    //End of conversion

    //Creates the character with stats. If none were given, every created stat is at state.startingLevel
    state.characters[char] =
      values[0][0] === "" ? new Character() : new Character(values);

    CutCommand();
    state.out = `\nCharacter ${char} has been created with stats ${state.characters[char]}.`;
  }
};
//#endregion addCharacter

//#region setStats
setStats = (arguments) => {
  //Looks for pattern !addCharacter(name) or !addCharacter(name, stat1=value, stat2=value, ..., statN=value)
  const exp = /(?<character>[\w\s']+)(?<stats>(?:, \w+ *= *\d+)+)/i;

  //Matches the RegEx
  const match = arguments.match(exp);

  //Null check
  if (match !== null) {
    //Grabbing info
    const char = match.groups.character;
    if (!ElementInArray(char, Object.keys(state.characters))) {
      state.message =
        "Character has not been created and its stats cannot be altered.";
      CutCommand();
      return;
    }
    let character = state.characters[char];

    //Converts values to format [[stat, newVal], [stat2, newVal], ... [statN, newVal]]
    let values = match.groups.stats
      .substring(2, match.groups.stats.length)
      .split(", ")
      .map((el) => el.trim().split("="));

    for (i in values) {
      curr = values[i];
      curr = [curr[0].trim(), Number(curr[1])];
      values[i] = curr;
    }

    //Caches old stats to show
    oldStats = CharToString(character);

    //Changes stats
    for (el of values) {
      if (el[0] == "hp") {
        character.hp = el[1];
        continue;
      }
      character[el[0]] = new Stat(el[0], el[1]);
    }

    state.characters[char] = character;

    CutCommand();

    state.out = `\n${char}'s stats has been changed\nfrom ${oldStats}\nto ${CharToString(
      character
    )}.`;
  } else {
    state.message = "Invalid arguments.";
    CutCommand();
    return;
  }
};
//#endregion setStats

//#region showStats
showStats = (arguments) => {
  //Looks for pattern !showStats(already-created-character)
  const exp = /(?<character>[\w\s']+)/i;
  match = arguments.match(exp);
  //Null check
  if (match !== null) {
    //Grabbing info
    const char = match.groups.character;
    if (!ElementInArray(char, Object.keys(state.characters))) {
      state.message =
        "Character has not been created and its stats cannot be shown.";
      //Removing command from context
      CutCommand();
      return;
    }
    const character = state.characters[char];

    CutCommand();
    //Sets info to print out
    state.out = `\n${char}'s current stats are: ${CharToString(character)}.`;
  }
};
//#endregion showStats

//#region getState
getState = (arguments) => {
  if (arguments !== "") {
    state.message = "getState command doesn't take any arguments.";
    CutCommand();
    return;
  }
  CutCommand();

  //Sets data to print out
  state.out = "\n----------\n\n" + JSON.stringify(state) + "\n\n----------\n";
};
//#endregion getState

//#region setState
setState = (arguments) => {
  //Looks for pattern !setState(anything)
  const exp = /(?<json>.+)/i;
  match = arguments.match(exp);

  //Null check
  if (match !== null) {
    CutCommand();

    //Ensuring data won't be accidentally purged along with error handling
    let cache;
    try {
      cache = JSON.parse(match.groups.json);
    } catch (SyntaxError) {
      cache = state;
      state.message = "Invalid JSON state.";
    }

    if (cache !== null && cache !== undefined) {
      for (let key in cache) {
        state[key] = cache[key];
      }
    }
  } else {
    state.message = "You need to enter a parameter to setState command.";
    CutCommand();
    return;
  }
};
//#endregion setState

//Main function
let currIndices, modifiedText;
const modifier = (text) => {
  SetupState();
  //Resets values
  state.out = state.ctxt = "";
  state.message = " ";
  modifiedText = text;

  //#region globalCommand
  //Checks for pattern !command(args)
  const globalExp = /!(?<command>[^\s]+)\((?<arguments>.*)\)/i;
  const globalMatch = text.match(globalExp);

  //If something matched, calls functions with further work
  if (globalMatch !== null) {
    const temp = text.indexOf(globalMatch[0]);
    //Creates indices, because d flag is not allowed
    currIndices = [temp, temp + globalMatch[0].length];

    //Matches the command and forwards arguments to them
    switch (globalMatch.groups.command.toLowerCase()) {
      case "skillcheck":
        skillcheck(globalMatch.groups.arguments);
        break;

      case "attack":
        attack(globalMatch.groups.arguments);
        break;

      case "heal":
        heal(globalMatch.groups.arguments);
        break;

      case "revive":
        revive(globalMatch.groups.arguments);
        break;

      case "addcharacter":
        addCharacter(globalMatch.groups.arguments);
        break;

      case "setstats":
        setStats(globalMatch.groups.arguments);
        break;

      case "showstats":
        showStats(globalMatch.groups.arguments);
        break;

      case "getstate":
        getState(globalMatch.groups.arguments);
        break;

      case "setstate":
        setState(globalMatch.groups.arguments);
        break;

      default:
        state.message = "Command not found.";
        return;
    }
    if (state.ctxt.length <= 1) state.ctxt = " \n";
  }
  //#endregion globalCommand

  //!Debug info, uncomment when you need
  if (DEBUG) {
    //console.log(`Og: ${text}`)
    //console.log(`In: ${modifiedText}`);
    //console.log(`Context: ${state.ctxt}`);
    //console.log(`Out: ${state.out}`);
    //console.log(`Message: ${state["message"]}`);
    //console.log(state);
    //console.log("------------");
  }
  // You must return an object with the text property defined.
  return { text: modifiedText };
};

if (!DEBUG) {
  // Don't modify this part
  modifier(text);
} else {
  //!tests
  modifier("!addcharacter(Librun)");
  modifier("!showstats(Librun)");
  modifier("!addCharacter(Miguel, str=1, dex=5, int=3, hp=1000)");
  modifier(
    "Miguel tries to evade an arrow. !skillcheck(dex, Miguel, 3) Is he blind?"
  );
  modifier("!skillcheck(int, Miguel, 5000)");
  modifier("!skillcheck(str, Miguel, 5 : 11)");
  modifier("!skillcheck(str, Miguel, 25 : 14 : 22)");
  modifier("!skillcheck(dex, Miguel, 5 : 12 : 15 : 20)");
  modifier("!This is a normal input!");
  modifier("abc !addCharacter(Zuibroldun Jodem, dex = 5, magic = 11) def");
  modifier(
    "Zuibroldun Jodem tries to die. !skillcheck(dex, Zuibroldun Jodem, 5 = lol : 10 = lmao it Works. Hi 5. : 15 = You lose.) Paparapapa."
  );
  modifier("!skillcheck(magic, Miguel, 3)");
  modifier("Setting stats... !setStats(Miguel, magic=120) Stats set");
  modifier("!showstats(Miguel)");
  modifier("!attack(Miguel, magic, Zuibroldun Jodem, str)");
  modifier("!showstats(Zuibroldun Jodem)");
  modifier("!attack(Librun, magic, Zuibroldun Jodem, str)");
  modifier("!skillcheck(str, Zuibroldun Jodem, 5)");
  modifier(
    "Miguel felt guilty about what he has done. !revive(Miguel, Zuibroldun Jodem, 10)"
  );
  modifier("!heal(Zuibroldun Jodem, 100)");
  /*modifier("!getState()");
  console.log("\n\n\n");
  modifier('!setState({"dice":10})');*/
}
