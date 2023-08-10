//You can edit this list to edit what will be displayed when dealing x damage.
//Format is [minimum damage, "displayed message"].
//Note that it is used in sentence like
//Miguel attacked Zuibroldun Jodem dealing {value from here} (x).
damageOutputs = [
    [1, "light damage"],
    [15, "medium damage"],
    [30, "significant damage"],
    [60, "heavy damage"],
    [100, "a killing blow"],
];

//!Does not check whether stats are equal to 0 when attacking. Change only if your damage function does not contain division or you've checked it properly.
ignoreZeroDiv = false;
//!Sets whether dead characters should be punished upon skillchecking
shouldPunish = true;
//!If set to true, !attack will work as !sAttack and vice versa
defaultDodge = false;
//!Switches between levelling each stat separately (true) and levelling character then distributing free points (false)
levellingToOblivion = false;
//!Should defending character also gain XP when !attack is used?
defendingCharacterLevels = false;

restrictedStatNames = [
    "hp",
    "level",
    "experience",
    "expToNextLvl",
    "skillpoints",
    "isNpc",
    "items",
    "type",
    "name",
];

const addCharacter = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Looks for pattern !addCharacter(name) or !addCharacter(name, stat1=value, stat2=value, ..., statN=value)
    //or !addCharacter(name, stat1=value, stat2=value, ..., statN=value, $itemName1, itemName2, ...)
    const exp =
        /^(?<character>[\w\s']+)(?<startingStats>(?:, *[\w ']+ *= *\d+)*)(?<startingItems>(?:, *(?:\$[\w\s']+)+)*)$/i;
    //Matches the RegEx
    const match = commandArguments.match(exp);
    //Null check
    if (!match || !match.groups) {
        state.message =
            "Add Character: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Grabbing info
    const characterName = match.groups.character;
    //Converts values to format [[stat, val], [stat2, val], ... [statN, val]]
    let values = match.groups.startingStats
        ? match.groups.startingStats
              .substring(2)
              .split(", ")
              .map((el) => {
                  const temp = el.trim().split("=");
                  return [temp[0].trim(), Number(temp[1].trim())];
              })
        : [];
    //Creates the character with stats. If none were given, every created stat is at state.startingLevel
    state.characters[characterName] = new Character(
        values,
        match.groups.startingItems
            .split(",")
            .map((el) => el.trim().substring(1))
            .slice(1)
    );
    state.out = `\nCharacter ${characterName} has been created with stats\n${state.characters[characterName]}.`;
    return modifiedText;
};

const addItem = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Error checking
    if (
        commandArguments === undefined ||
        commandArguments === null ||
        commandArguments === ""
    ) {
        state.message = "Add Item: No arguments found.";
        return modifiedText;
    }
    //Looks for pattern name, slot, stat=value, target place (none by default) and character
    const exp =
        /(?<name>[\w ']+), (?<slot>[\w\s]+)(?<modifiers>(?:, [\w ']+ *= *-?\d+)+)(?:, *(?<target>inventory|equip)(?:, *(?<character>[\w\s']+))?)?/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (!match || !match.groups) {
        state.message = "Add Item: Arguments were not given in proper format.";
        return modifiedText;
    }
    if ((0, ElementInArray)(match.groups.name, Object.keys(state.items))) {
        state.message = `Add Item: Item ${match.groups.name} already exists. Maybe you should use gainItem or equip instead?`;
        return modifiedText;
    }
    if (match.groups.target === "equip") {
        if (match.groups.character === undefined) {
            state.message =
                "Add Item: You must specify who will equip the item when you choose so.";
            return modifiedText;
        }
        if (
            !(0, ElementInArray)(
                match.groups.character,
                Object.keys(state.characters)
            )
        ) {
            state.message = `Add Item: Character ${match.groups.character} doesn't exist.`;
            return modifiedText;
        }
    }
    const itemName = match.groups.name.trim();
    //Converts values to format [[stat, val], [stat2, val], ... [statN, val]]
    const initValues = match.groups.modifiers
        .substring(2)
        .split(", ")
        .map((el) => {
            const temp = el.trim().split("=");
            return [temp[0].trim(), Number(temp[1].trim())];
        });
    let error = false;
    for (const modifier of initValues) {
        if ((0, ElementInArray)(modifier[0], restrictedStatNames)) {
            state.message += `\nAdd Item: ${modifier[0]} cannot be set.`;
            error = true;
            continue;
        }
        //Stats must exist prior
        if (!(0, isInStats)(modifier[0])) {
            state.message += `\nAdd Item: Stat ${modifier[0]} does not exist.`;
            error = true;
        }
    }
    if (error) return modifiedText;
    //Adds slot
    initValues.push(["slot", match.groups.slot]);
    //Passes to constructor and adds received item to the state
    const item = new Item(itemName, initValues);
    state.items[itemName] = item;
    modifiedText = `Item ${itemName} created with attributes:\n${(0,
    ItemToString)(item)}.`;
    if (match.groups.target === "equip")
        modifiedText = (0, _equip)(match.groups.character, item, modifiedText);
    else if (match.groups.target === "inventory") {
        state.inventory.push(itemName);
        modifiedText += `\nItem ${itemName} was put into inventory.`;
    }
    return modifiedText;
};

const addNPC = (commandArguments, currIndices, modifiedText) => {
    //Looks for pattern !addCharacter(name) or !addCharacter(name, stat1=value, stat2=value, ..., statN=value)
    const exp =
        /^(?<character>[\w\s']+)(?<startingStats>(?:, *[\w ']+ *= *\d+)*)(?<startingItems>(?:, *(?:\$[\w\s']+)+)*)$/i;
    //Matches the RegEx
    const match = commandArguments.match(exp);
    //Null check
    if (!match || !match.groups) {
        state.message = "Add NPC: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Grabbing info
    const characterName = match.groups.character;
    //Converts values to format [[stat, val], [stat2, val], ... [statN, val]]
    let values = match.groups.startingStats
        ? match.groups.startingStats
              .substring(2)
              .split(", ")
              .map((el) => {
                  const temp = el.trim().split("=");
                  return [temp[0].trim(), Number(temp[1].trim())];
              })
        : [];
    console.log(
        match.groups.startingItems
            .split(",")
            .map((el) => el.trim().substring(1))
            .slice(1)
    );
    //Creates the character with stats. If none were given, every created stat is at state.startingLevel
    state.characters[characterName] = new NPC(
        values,
        match.groups.startingItems
            .split(",")
            .map((el) => el.trim().substring(1))
            .slice(1)
    );
    (0, CutCommandFromContext)(modifiedText, currIndices);
    state.out = `\nNon-Playable Character ${characterName} has been created with stats\n${state.characters[characterName]}.`;
    return modifiedText;
};

const alterItem = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Looks for pattern name, slot, stat=value
    const exp =
        /(?<name>[\w ']+)(?<slot>, [\w\s]+)?(?<modifiers>(?:, [\w ']+ *= *-?\d+)+)/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (!match || !match.groups) {
        state.message =
            "Alter Item: Arguments were not given in proper format.";
        return modifiedText;
    }
    if (!(0, ElementInArray)(match.groups.name, Object.keys(state.items))) {
        state.message = `Alter Item: Item ${match.groups.name} doesn't exist.`;
        if (DEBUG) {
            state.message += "\n";
            for (const key in state.items) state.message += ", " + key;
        }
        return modifiedText;
    }
    const itemName = match.groups.name.trim();
    //Converts values to format [[stat, val], [stat2, val], ... [statN, val]]
    const initValues = match.groups.modifiers
        .substring(2)
        .split(", ")
        .map((el) => {
            const temp = el.trim().split("=");
            return [temp[0].trim(), Number(temp[1].trim())];
        });
    //Stats must exist prior
    for (const modifier of initValues) {
        if ((0, ElementInArray)(modifier[0], restrictedStatNames)) {
            state.message += `\nAlter Item: ${modifier[0]} cannot be altered.`;
            continue;
        }
        if (!(0, isInStats)(modifier[0])) {
            state.message = `Alter Item: Stat ${modifier[0]} does not exist.`;
            return modifiedText;
        }
    }
    //Passes to constructor and adds received item to the state
    const item = state.items[itemName];
    const oldAttributes = (0, ItemToString)(item);
    item.slot = match.groups.slot.substring(2);
    for (const modifier of initValues) {
        if (modifier[1] === 0) delete item.modifiers[modifier[0]];
        else item.modifiers[modifier[0]] = modifier[1];
    }
    state.out = `\n${itemName}'s attributes has been altered\nfrom\n${oldAttributes}\nto\n${(0,
    ItemToString)(item)}.`;
    return modifiedText;
};

const attack = (commandArguments, currIndices, textCopy, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Error checking
    if (
        commandArguments === undefined ||
        commandArguments === null ||
        commandArguments === ""
    ) {
        state.message = "Attack: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Checks for format stat, character, stat, character
    const exp =
        /(?<attackingCharacter>[\w\s']+), *(?<attackStat>[\w ']+), *(?<defendingCharacter>[\w\s']+), *(?<defenseStat>[\w ']+)/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (match === null || !match.groups) {
        state.message = "Attack: No matching arguments found.";
        return modifiedText;
    }
    //Checks if stats exist
    if (!(0, ElementInArray)(match.groups.attackStat, state.stats)) {
        state.message = `Attack: Stat ${match.groups.attackStat} was not created.`;
        return modifiedText;
    }
    if (!(0, ElementInArray)(match.groups.defenseStat, state.stats)) {
        state.message = `Attack: Stat ${match.groups.defenseStat} was not created.`;
        return modifiedText;
    }
    //Creates shortcuts to names and stats
    const attackingCharacterName = match.groups.attackingCharacter;
    const attackStat = match.groups.attackStat;
    const defendingCharacterName = match.groups.defendingCharacter;
    const defenseStat = match.groups.defenseStat;
    if (
        !(0, ElementInArray)(
            attackingCharacterName,
            Object.keys(state.characters)
        )
    ) {
        state.message = `Attack: Character ${attackingCharacterName} does not exist.`;
        return modifiedText;
    }
    if (
        !(0, ElementInArray)(
            defendingCharacterName,
            Object.keys(state.characters)
        )
    ) {
        state.message = `Attack: Character ${defendingCharacterName} does not exist.`;
        return modifiedText;
    }
    const { attackOutput, levelOutput, contextOutput } = (0, DealDamage)(
        attackingCharacterName,
        attackStat,
        defendingCharacterName,
        defenseStat,
        "Attack"
    );
    //Gives the player necessary info.
    modifiedText =
        textCopy.substring(0, currIndices[0]) +
        attackOutput +
        (levelOutput ? "\n" : "") +
        levelOutput +
        textCopy.substring(currIndices[1]);
    state.ctxt =
        textCopy.substring(0, currIndices[0]) +
        contextOutput +
        textCopy.substring(currIndices[1]);
    return modifiedText;
};

const battle = (commandArguments, modifiedText) => {
    //Error checking
    if (
        commandArguments === undefined ||
        commandArguments === null ||
        commandArguments === ""
    ) {
        state.message = "Battle: No arguments found.";
        return modifiedText;
    }
    //Looks for pattern (character1, character2, ...), (character3, character4, ...)
    const exp =
        /\((?<group1>[\w\s']+(?:, *[\w\s']+)*)\), *\((?<group2>[\w\s']+(?:, *[\w\s']+)*)\)/i;
    const match = modifiedText.match(exp);
    //Error checking
    if (match === null || !match.groups) {
        state.message = "Battle: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Grabs the info
    const side1CharactersNames = Array.from(
        new Set(
            match.groups.group1
                .trim()
                .split(",")
                .map((el) => el.trim())
        )
    );
    const side2CharactersNames = Array.from(
        new Set(
            match.groups.group2
                .trim()
                .split(",")
                .map((el) => el.trim())
        )
    );
    //Checks if follows rules:
    //Character cannot belong to both sides of the battle
    //Every element is a name of preexisting character
    //TODO: or character class with count
    for (const characterName of side1CharactersNames) {
        if ((0, ElementInArray)(characterName, Object.keys(state.characters))) {
            if (state.characters[characterName].hp <= 0) {
                state.message = `Battle: Character ${characterName} is dead and cannot participate in battle.`;
                return modifiedText;
            }
            if ((0, ElementInArray)(characterName, side2CharactersNames)) {
                state.message = `Battle: Character ${characterName} cannot belong to both sides of the battle.`;
                return modifiedText;
            }
        } else {
            //console.log(`${el}\n\n${state.characters}`);
            state.message = `Battle: Character ${characterName} doesn't exist.`;
            return modifiedText;
        }
    }
    for (const characterName of side2CharactersNames) {
        if (
            !(0, ElementInArray)(characterName, Object.keys(state.characters))
        ) {
            state.message = `Battle: Character ${characterName} doesn't exist.`;
            return modifiedText;
        } else if (state.characters[characterName].hp <= 0) {
            state.message = `Battle: Character ${characterName} is dead and cannot participate in battle.`;
            return modifiedText;
        }
    }
    //Setting up values for automatic turns
    state.side1 = side1CharactersNames;
    state.side2 = side2CharactersNames;
    state.currentSide = `side${(0, diceRoll)(2)}`;
    state.active = [...state[state.currentSide]];
    state.inBattle = true;
    state.out = "A battle has emerged between two groups!";
    const nextActiveCharacterIndex = (0, diceRoll)(state.active.length) - 1;
    state.activeCharacterName = state.active[nextActiveCharacterIndex];
    state.activeCharacter = state.characters[state.activeCharacterName];
    if (state.activeCharacter.isNpc) (0, turn)("");
    return modifiedText;
};

const CutCommandFromContext = (modifiedText, currIndices) => {
    state.ctxt =
        state.ctxt !== ""
            ? state.ctxt.substring(0, currIndices[0]) +
              state.ctxt.substring(currIndices[1])
            : modifiedText.substring(0, currIndices[0]) +
              modifiedText.substring(currIndices[1]);
};

const equip = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Error checking
    if (!commandArguments) {
        state.message = "Equip Item: No arguments found.";
        return DEBUG ? "error" : modifiedText;
    }
    //Looks for character, item1, item2, ..., itemN
    const exp = /(?<character>[\w\s']+)(?<items>(?:, *[\w ']+)+)/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (
        !match ||
        !(match === null || match === void 0 ? void 0 : match.groups)
    ) {
        state.message =
            "Equip Item: Arguments were not given in proper format.";
        return DEBUG ? "error" : modifiedText;
    }
    const characterName = match.groups.character,
        itemNames = match.groups.items
            .substring(1)
            .trim()
            .split(/, */)
            .map((x) => x.trim());
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state.message = `Equip Item: Character ${characterName} doesn't exist.`;
        return DEBUG ? "error" : modifiedText;
    }
    for (const name of itemNames) {
        if (!(0, ElementInArray)(name, Object.keys(state.items))) {
            state.message = `Equip Item: Item ${name} doesn't exist.`;
            return DEBUG ? "error" : modifiedText;
        }
        if (!(0, ElementInArray)(name, state.inventory)) {
            state.message = `Equip Item: You don't have item ${name} in your inventory.`;
            return DEBUG ? "error" : modifiedText;
        }
    }
    state.out = "";
    for (const name of itemNames)
        state.out += (0, _equip)(characterName, state.items[name], "");
    state.out += `\nItem${
        itemNames.length > 1 ? "s" : ""
    } successfully equipped.`;
    return modifiedText;
};

const gainItem = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Error checking
    if (
        commandArguments === undefined ||
        commandArguments === null ||
        commandArguments === ""
    ) {
        state.message = "Gain Item: No arguments found.";
        return modifiedText;
    }
    const exp = /(?<name>[\w ']+)(?:, *(?<character>[\w\s']+))?/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (!match || !match.groups) {
        state.message = "Gain Item: Arguments were not given in proper format.";
        return modifiedText;
    }
    const characterName = match.groups.character,
        itemName = match.groups.name;
    if (!(0, ElementInArray)(itemName, Object.keys(state.items))) {
        state.message = `Gain Item: Item ${itemName} doesn't exist.`;
        return modifiedText;
    }
    //If the character has been specified, it must exist
    if (
        characterName !== undefined &&
        !(0, ElementInArray)(characterName, Object.keys(state.characters))
    ) {
        state.message = `Gain Item: Character ${characterName} doesn't exist.`;
        return modifiedText;
    }
    state.inventory.push(itemName);
    if (characterName !== undefined) {
        modifiedText = (0, _equip)(characterName, state.items[itemName], "");
    } else modifiedText = `Item ${itemName} was put into inventory.`;
    return modifiedText;
};

const getState = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    if (commandArguments) {
        state.message = "Get State: command doesn't take any arguments.";
        return modifiedText;
    }
    //Sets data to print out
    state.out = "\n----------\n\n" + JSON.stringify(state) + "\n\n----------\n";
    return modifiedText;
};

const heal = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Looks for character, (d)number pattern. If d exists, dice is rolled, else number is used as is.
    const exp = /(?<character>[\w\s']+), *(?<value>(?:\d+ *: *\d+)|(?:d?\d+))/i;
    const match = commandArguments.match(exp);
    //Null check
    if (!match || !match.groups) {
        state.message = "Heal: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Shortcut
    const characterName = match.groups.character;
    //Checks if character exists
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state.message = `Heal: Character ${characterName} does not exist.`;
        return modifiedText;
    }
    //Another shortcut
    const character = state.characters[characterName];
    //Checks if character is dead
    if (character.hp < 1) {
        state.message = "Heal: Dead characters must be revived before healing.";
        return modifiedText;
    }
    //Initiates the value
    let value;
    //If : syntax is used, proper operations are performed
    if (match.groups.value.includes(":")) {
        const temp = match.groups.value
            .split(":")
            .map((el) => Number(el.trim()));
        if (temp[0] > temp[1]) {
            const t = temp[0];
            temp[0] = temp[1];
            temp[1] = t;
        }
        value = (0, diceRoll)(temp[1] - temp[0] + 1) + temp[0] - 1;
    }
    //Rolls a dice or just sets the value from args in other cases
    else
        value =
            match.groups.value.toLowerCase()[0] === "d"
                ? (0, diceRoll)(Number(match.groups.value.substring(1)))
                : Number(match.groups.value);
    //Healing
    state.characters[characterName].hp += value;
    //Output information
    state.out = `Character ${characterName} was healed by ${value} hp. Current hp: ${character.hp}.`;
    return modifiedText;
};

const levelStats = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    if (levellingToOblivion) {
        state.message =
            "Level Stats: This command will work only when you are levelling your characters.\nIn current mode stats are levelling by themselves when you are using them.";
        return modifiedText;
    }
    //Looks for format character, stat1+val1, stat2+val2...
    const exp = /(?<character>[\w\s']+)(?<stats>(?:, [\w ']+ *\+ *\d+)+)/i;
    const match = commandArguments.match(exp);
    if (!match || !match.groups) {
        state.message =
            "Level Stats: Arguments were not given in proper format.";
        return modifiedText;
    }
    const characterName = match.groups.character;
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state.message = "Level Stats: Nonexistent characters can't level up.";
        return modifiedText;
    }
    const character = state.characters[characterName];
    let usedSkillpoints = 0;
    //Converts values to format [[stat, addedVal], [stat2, addedVal], ... [statN, addedVal]] and counts required skillpoints
    const values = match.groups.stats
        .substring(2, match.groups.stats.length)
        .split(", ")
        .map((el) => el.trim().split("+"))
        .map((curr) => {
            usedSkillpoints += Number(curr[1]);
            return [curr[0].trim(), Number(curr[1])];
        });
    if (usedSkillpoints === 0) {
        state.message = "Level Stats: You need to use at least one skillpoint.";
        return modifiedText;
    }
    if (character.skillpoints < usedSkillpoints) {
        state.message = `Level Stats: ${characterName} doesn't have enough skillpoints (${character.skillpoints}/${usedSkillpoints}).`;
        return modifiedText;
    }
    //Caches old stats to show
    const oldStats = (0, CharacterToString)(character);
    //Changes stats
    for (const el of values) {
        if ((0, ElementInArray)(el[0], restrictedStatNames)) {
            state.message += `\nLevel Stats: ${el[0]} cannot be levelled up.`;
            continue;
        }
        //If stat doesn't exits on the character, creates it
        if (!character.stats[el[0]])
            character.stats[el[0]] = new Stat(el[0], el[1]);
        else character.stats[el[0]].level += el[1];
        character.skillpoints -= el[1];
    }
    state.out = `${characterName}'s stats has been levelled\nfrom\n${oldStats}\nto\n${(0,
    CharacterToString)(character)}.`;
    return modifiedText;
};

const revive = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Looks for pattern reviving character, revived character, revive value
    const exp =
        /(?<revivingCharacter>[\w\s']+), *(?<revivedCharacter>[\w\s']+), *(?<value>\d+)/i;
    const match = commandArguments.match(exp);
    //Null check
    if (!match || !match.groups) {
        state.message = "Revive: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Shortcuts
    const value = Number(match.groups.value);
    const revivingCharacterName = match.groups.revivingCharacter;
    const revivedCharacterName = match.groups.revivedCharacter;
    //Checks for reviving char
    if (
        !(0, ElementInArray)(
            revivingCharacterName,
            Object.keys(state.characters)
        )
    ) {
        state.message = "Revive: Reviving character doesn't exist.";
        return modifiedText;
    }
    const revivingCharacter = state.characters[revivingCharacterName];
    if (revivingCharacter.hp <= value) {
        state.message =
            "Revive: Reviving character would die if this action would be performed. Their hp is too low.\nRevive was not performed.";
        return modifiedText;
    }
    //Check for revived char
    if (
        !(0, ElementInArray)(
            revivedCharacterName,
            Object.keys(state.characters)
        )
    ) {
        state.message = "Revive: Revived character doesn't exist.";
        return modifiedText;
    }
    const revivedCharacter = state.characters[revivedCharacterName];
    //Reviving/transfusion
    state.characters[revivingCharacterName].hp -= value;
    state.characters[revivedCharacterName].hp += value;
    //Custom output
    state.out = `${revivingCharacterName} transfused ${value} hp to ${revivedCharacterName}${
        revivedCharacter.hp === value
            ? ", reviving " + revivedCharacterName
            : ""
    }. Resulting hp: ${revivingCharacterName}: ${
        revivingCharacter.hp
    }, ${revivedCharacterName}: ${revivedCharacter.hp}.`;
    return modifiedText;
};

const sattack = (commandArguments, currIndices, textCopy, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Error checking
    if (
        commandArguments === undefined ||
        commandArguments === null ||
        commandArguments === ""
    ) {
        state.message = "Attack: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Checks for format stat, character, stat, character
    const exp =
        /(?<attackingCharacter>[\w\s']+), *(?<attackStat>[\w ']+), *(?<defendingCharacter>[\w\s']+), *(?<defenseStat>[\w ']+)/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (match === null || !match.groups) {
        state.message = "Attack: No matching arguments found.";
        return modifiedText;
    }
    //Checks if stats exist
    if (!(0, ElementInArray)(match.groups.attackStat, state.stats)) {
        state.message = `Attack: Stat ${match.groups.attackStat} was not created.`;
        return modifiedText;
    }
    if (!(0, ElementInArray)(match.groups.defenseStat, state.stats)) {
        state.message = `Attack: Stat ${match.groups.defenseStat} was not created.`;
        return modifiedText;
    }
    //Creates shortcuts to names and stats
    const attackingCharacterName = match.groups.attackingCharacter;
    const attackStat = match.groups.attackStat;
    const defendingCharacterName = match.groups.defendingCharacter;
    const defenseStat = match.groups.defenseStat;
    if (
        !(0, ElementInArray)(
            attackingCharacterName,
            Object.keys(state.characters)
        )
    ) {
        state.message = `Attack: Character ${attackingCharacterName} does not exist.`;
        return modifiedText;
    }
    if (
        !(0, ElementInArray)(
            defendingCharacterName,
            Object.keys(state.characters)
        )
    ) {
        state.message = `Attack: Character ${defendingCharacterName} does not exist.`;
        return modifiedText;
    }
    const { attackOutput, levelOutput, contextOutput } = (0,
    DealDamageIfNotDodged)(
        attackingCharacterName,
        attackStat,
        defendingCharacterName,
        defenseStat,
        "Attack"
    );
    //Gives the player necessary info.
    modifiedText =
        textCopy.substring(0, currIndices[0]) +
        attackOutput +
        (levelOutput ? "\n" : "") +
        levelOutput +
        textCopy.substring(currIndices[1]);
    state.ctxt =
        textCopy.substring(0, currIndices[0]) +
        contextOutput +
        textCopy.substring(currIndices[1]);
    return modifiedText;
};

const setState = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
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
    let cache;
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

const setStats = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Looks for pattern !addCharacter(name) or !addCharacter(name, stat1=value, stat2=value, ..., statN=value)
    const exp =
        /(?<character>[\w\s']+)(?<stats>(?:, [\w ']+ *= *(?:\d+|[\w ']+))+)/i;
    //Matches the RegEx
    const match = commandArguments.match(exp);
    //Null check
    if (!match || !match.groups) {
        state.message = "Set Stats: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Grabbing info
    const characterName = match.groups.character;
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state.message = `Set Stats: Character ${characterName} doesn't exist.`;
        return modifiedText;
    }
    const character = state.characters[characterName];
    //Converts values to format [[stat, newVal], [stat2, newVal], ... [statN, newVal]]
    let values = match.groups.stats
        .substring(2, match.groups.stats.length)
        .split(", ")
        .map((el) => el.trim().split("="))
        .map((curr) => {
            curr.map((el) => el.trim());
            return [curr[0].trim(), Number(curr[1])];
        });
    //Caches old stats to show
    const oldStats = (0, CharacterToString)(character);
    //Changes stats
    for (const el of values) {
        if ((0, ElementInArray)(el[0], restrictedStatNames)) {
            character[el[0]] = el[1];
            continue;
        }
        character.stats[el[0]] = new Stat(el[0], el[1]);
    }
    state.characters[characterName] = character;
    state.out = `\n${characterName}'s stats has been changed\nfrom\n${oldStats}\nto\n${(0,
    CharacterToString)(character)}.`;
    return modifiedText;
};

const showInventory = (commandArguments, modifiedText) => {
    if (commandArguments !== "") {
        state.message = "Show Inventory: Command doesn't take any arguments.";
        return modifiedText;
    }
    //console.log(state.inventory);
    return (
        "Currently your inventory holds: " +
        (state.inventory.length ? state.inventory.join(", ") : "nothing") +
        "."
    );
};

const showStats = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Looks for pattern !showStats(already-created-character)
    const exp = /(?<character>[\w\s']+)/i;
    const match = commandArguments.match(exp);
    //Null check
    if (!match || !match.groups) {
        state.message =
            "Show Stats: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Grabbing info
    const characterName = match.groups.character;
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state.message = `Show Stats: Character ${characterName} doesn't exist.`;
        return modifiedText;
    }
    const character = state.characters[characterName];
    //Sets info to print out
    state.out = `\n${characterName}'s current stats are:\n${(0,
    CharacterToString)(character)}.`;
    return modifiedText;
};

const skillcheck = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    const textCopy = modifiedText;
    //Checks for format stat, character, thresholds , outputs groups character and thresholds, that are matched later
    const exp = /(?<stat>[\w ']+), (?<character>[\w\s']+), (?<thresholds>.+)/i;
    //Checks for thresholds type
    const thresholdCheck =
        /(?<thresholdsC>\d+ *= *.+(?: *: *\d+ *= *.+)+)|(?<thresholds4>\d+ *: *\d+ *: *\d+ *: *\d+)|(?<thresholds3>\d+ *: *\d+ *: *\d+)|(?<thresholds2>\d+ *: *\d+)|(?<thresholds1>\d+)/i;
    const match = commandArguments.match(exp);
    //console.log(match);
    //Firstly, checks if something matched
    if (match === null || !match.groups) {
        state.message =
            "Skillcheck: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Regex matched, so program is rolling the dice
    const roll = (0, diceRoll)(state.dice);
    //Grabbing necessary info
    const statName = match.groups.stat;
    const characterName = match.groups.character;
    //Testing if stat exists, throwing error otherwise
    if (!(0, ElementInArray)(statName, state.stats)) {
        state.message = `Skillcheck: Stat ${statName} does not exist.`;
        return modifiedText;
    }
    //Shortening access path to character object
    let character = state.characters[characterName];
    if (!character) {
        state.message = `Skillcheck: Character ${characterName} doesn't exist.`;
        return modifiedText;
    }
    //Don't have a stat? No problem! You'll have a 0 instead! That's even worse than the default starting value!
    const characterStatLevelWithMods = (0, GetStatWithMods)(
        character,
        statName
    );
    let effectiveCharacterStatLevel = characterStatLevelWithMods;
    //Punishing
    if (character.hp < 1 && shouldPunish) {
        state.message = `Skillcheck: Testing against dead character. Punishment: -${state.punishment} (temporary).`;
        effectiveCharacterStatLevel -= state.punishment;
    }
    //console.log(char + ", " + stat + ": "+ charStat);
    //Grabs thresholds
    const thresholds = commandArguments.match(thresholdCheck);
    if (!thresholds || !thresholds.groups) {
        state.message = "Skillcheck: Thresholds are not in proper format.";
        return DEBUG ? "Threshold fail" : modifiedText;
    }
    //console.log(thresholds);
    const bonus = characterStatLevelWithMods - character.stats[statName].level;
    // console.log("skill bonus:", bonus);
    //Tricky part, checking every group for data
    for (const key in thresholds.groups) {
        //Grabbing necessary info
        const thresholdsAsString = thresholds.groups[key];
        //null check
        if (!thresholdsAsString) continue;
        const score = roll + effectiveCharacterStatLevel;
        let mess = `Skillcheck performed: ${characterName} with ${statName}: ${effectiveCharacterStatLevel}${
            bonus === 0 ? "" : " (base " + character.stats[statName].level + ")"
        } rolled ${roll}. ${effectiveCharacterStatLevel} + ${roll} = ${score}. `;
        let outcome = "";
        let custom = false;
        let thresholdsAsNumberStringArr = [];
        //#region threshold check
        //Handling the skillcheck
        switch (key) {
            //One threshold means success or failure
            case "thresholds1": {
                mess += `Difficulty: ${thresholdsAsString} Outcome: `;
                outcome =
                    score >= Number(thresholdsAsString.trim())
                        ? "success."
                        : "failure.";
                break;
            }
            //Two of them - success, nothing, failure
            case "thresholds2": {
                const thresholdsAsNumberArr = thresholdsAsString
                    .split(":")
                    .map((el) => Number(el.trim()))
                    .sort((a, b) => a - b);
                mess += `Difficulty: ${thresholdsAsNumberArr.join(
                    ", "
                )} Outcome: `;
                if (score >= thresholdsAsNumberArr[1]) {
                    outcome = "success.";
                } else if (score >= thresholdsAsNumberArr[0]) {
                    outcome = "nothing happens.";
                } else {
                    outcome = "failure.";
                }
                break;
            }
            //Three of them - critical success, success, failure or critical failure
            case "thresholds3": {
                const thresholdsAsNumberArr = thresholdsAsString
                    .split(":")
                    .map((el) => Number(el.trim()))
                    .sort((a, b) => a - b);
                mess += `Difficulty: ${thresholdsAsNumberArr.join(
                    ", "
                )} Outcome: `;
                if (score >= thresholdsAsNumberArr[2]) {
                    outcome = "critical success.";
                } else if (score >= thresholdsAsNumberArr[1]) {
                    outcome = "success.";
                } else if (score >= thresholdsAsNumberArr[0]) {
                    outcome = "failure.";
                } else {
                    outcome = "critical failure.";
                }
                break;
            }
            //Four of them - critical success, success, nothing, failure or critical failure
            case "thresholds4": {
                const thresholdsAsNumberArr = thresholdsAsString
                    .split(":")
                    .map((el) => Number(el.trim()))
                    .sort((a, b) => a - b);
                mess += `Difficulty: ${thresholdsAsNumberArr.join(
                    ", "
                )} Outcome: `;
                if (score >= thresholdsAsNumberArr[3]) {
                    outcome = "critical success.";
                } else if (score >= thresholdsAsNumberArr[2]) {
                    outcome = "success.";
                } else if (score >= thresholdsAsNumberArr[1]) {
                    outcome = "nothing happens.";
                } else if (score >= thresholdsAsNumberArr[0]) {
                    outcome = "failure.";
                } else {
                    outcome = "critical failure.";
                }
                break;
            }
            //Custom thresholds with outcomes
            case "thresholdsC":
                //Converts n1=s1 : n2=s2 to [[n1, s1], [n2, s2]]
                thresholdsAsNumberStringArr = thresholdsAsString
                    .split(":")
                    .map((el) => {
                        const temp = el.split("=").map((el) => el.trim());
                        return [Number(temp[0]), temp[1]];
                    });
                mess += `Difficulty: ${CustomDifficulties(
                    thresholdsAsNumberStringArr
                )} Outcome: `;
                custom = true;
                break;
            //Read message
            default:
                console.error("WTF is this?!");
                state.message =
                    "Skillcheck: no group has been matched.\nIDK how did you make it, but think about creating an issue.";
                return modifiedText;
        }
        //#endregion threshold check
        //Modifying context and input. Custom thresholds are handled differently, so they are separated
        if (!custom) {
            state.ctxt =
                modifiedText.substring(0, currIndices[0]) +
                "Outcome: " +
                outcome +
                modifiedText.substring(currIndices[1]);
            modifiedText =
                modifiedText.substring(0, currIndices[0]) + mess + outcome;
        } else {
            state.ctxt =
                modifiedText.substring(0, currIndices[0]) +
                CustomOutcome(score, thresholdsAsNumberStringArr) +
                modifiedText.substring(currIndices[1]);
            modifiedText =
                modifiedText.substring(0, currIndices[0]) +
                mess +
                CustomOutcome(score, thresholdsAsNumberStringArr);
        }
    }
    modifiedText += (0, IncrementExp)(characterName, statName);
    modifiedText += textCopy.substring(currIndices[1]);
    return modifiedText;
};
const CustomOutcome = (score, thresholdsAsStringNumberArr) => {
    let i = 0;
    let out = "nothing happens.";
    while (score >= thresholdsAsStringNumberArr[i][0]) {
        out = thresholdsAsStringNumberArr[i++][1];
        if (thresholdsAsStringNumberArr[i] === undefined) {
            break;
        }
    }
    return out;
};
const CustomDifficulties = (thresholdsAsStringNumberArr) => {
    let temp = "";
    thresholdsAsStringNumberArr.forEach((element) => {
        temp += element[0] + ", ";
    });
    return temp.substring(0, temp.length - 2);
};

const unequip = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    const exp = /(?<character>[\w\s']+)(?<slots>(?:(?:, [\w ]+)+|, all))/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (!match || !match.groups) {
        state.message = "Unequip: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Grabs character name
    const characterName = match.groups.character;
    //Checks if character exists
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state.message = `Unequip: Character ${characterName} doesn't exist.`;
        return DEBUG ? "error" : modifiedText;
    }
    const character = state.characters[characterName];
    if (match.groups.slots.substring(1).trim() === "all") {
        for (const slot of Object.keys(character.items)) {
            if (character.items[slot]) {
                state.inventory.push(character.items[slot].name);
                modifiedText += `\n${characterName} unequipped ${character.items[slot].name}.`;
            }
        }
        character.items = {};
    } else {
        //Puts items from slots back into inventory
        for (const slot of match.groups.slots
            .substring(1)
            .trim()
            .split(",")
            .map((x) => x.trim())) {
            if (character.items[slot]) {
                state.inventory.push(character.items[slot].name);
                modifiedText += `\n${characterName} unequipped ${character.items[slot].name}.`;
                delete character.items[slot];
            }
        }
    }
    return modifiedText;
};

const BestStat = (character) => {
    let bestStat = "",
        bestStatValue = -Infinity;
    for (const stat of Object.keys(character.stats)) {
        if ((0, GetStatWithMods)(character, stat) > bestStatValue) {
            bestStat = stat;
            bestStatValue = (0, GetStatWithMods)(character, stat);
        }
    }
    return bestStat || state.stats[0];
};
const GetStatWithMods = (character, stat) => {
    if (!character || !stat || character.stats[stat] === undefined) return 0;
    let itemModifiersSum = 0;
    for (const itemName of Object.keys(character.items)) {
        const item = character.items[itemName];
        if (item.modifiers[stat]) itemModifiersSum += item.modifiers[stat];
    }
    return character.stats[stat].level + itemModifiersSum;
};
const IncrementExp = (characterName, statName) => {
    if (state.characters[characterName].isNpc) return "";
    if (levellingToOblivion) {
        return IncrementExpOnStat(characterName, statName);
    } else {
        return IncrementExpOnCharacter(characterName);
    }
};
const IncrementExpOnCharacter = (characterName) => {
    const character = state.characters[characterName];
    //Increases experience by 1 and checks whether it's enough to level the character up
    if (++character.experience >= character.expToNextLvl) {
        //If it is, experience is set to 0,
        character.experience = 0;
        //level increased and expToNextLevel re-calculated
        character.expToNextLvl = (0, experienceCalculation)(++character.level);
        //In the case of attackingCharacter levelling up, it also gains free skillpoints
        character.skillpoints += state.skillpointsOnLevelUp;
        return `\n${characterName} has levelled up to level ${character.level} (free skillpoints: ${character.skillpoints})!`;
    }
    return "";
};
const IncrementExpOnStat = (characterName, statName) => {
    const character = state.characters[characterName];
    const stat = character.stats[statName];
    if (stat.experience === undefined || stat.expToNextLvl === undefined) {
        return "";
    }
    //Increases experience by 1 and checks whether it's enough to level the stat up
    if (++stat.experience >= stat.expToNextLvl) {
        //If it is, experience is set to 0,
        stat.experience = 0;
        //level increased and expToNextLevel re-calculated
        stat.expToNextLvl = (0, experienceCalculation)(++stat.level);
        return `\n${characterName}'s ${statName} has levelled up to level ${stat.level}!`;
    }
    return "";
};

//Debug purposes only
const SetDamageOutputs = (inValue) => {
    damageOutputs = inValue;
};
const SetEquipmentParts = (inValue) => {
    equipmentParts = inValue;
};
const SetIgnoredValues = (inValue) => {
    restrictedStatNames = inValue;
};
const SetIgnoreZeroDiv = (inValue) => {
    ignoreZeroDiv = inValue;
};
const SetShouldPunish = (inValue) => {
    shouldPunish = inValue;
};
const SetDefaultDodge = (inValue) => {
    defaultDodge = inValue;
};
const SetLevellingToOblivion = (inValue) => {
    levellingToOblivion = inValue;
};
const SetDefendingCharacterLevels = (inValue) => {
    defendingCharacterLevels = inValue;
};

const CustomDamageOutput = (damage, values) => {
    let i = 0;
    let out = "no damage";
    while (values[i] && damage >= values[i][0]) {
        out = values[i++][1];
    }
    return out;
};
/**
 * state.ctxt is NOT modified by this function
 *
 * @param attackStatName Name of stat used to attack
 * @param defenseStatName Name of stat used to defend
 * @param outputTargetByRef String variable used for output. May be state.out or modifiedText
 * @param debugPrefix Prefix added to debug messages, preferably command name
 * @returns Object containing attackOutput "a attacked b" and levelOutput "a levelled up"
 */
const DealDamage = (
    attackingCharacterName,
    attackStatName,
    defendingCharacterName,
    defenseStatName,
    debugPrefix
) => {
    //Grabs the info
    let attackingCharacter = state.characters[attackingCharacterName];
    let defendingCharacter = state.characters[defendingCharacterName];
    //If you didn't create the characters earlier, they get all stats at starting level from state
    if (attackingCharacter === undefined) {
        state.characters[attackingCharacterName] = new Character();
        attackingCharacter = state.characters[attackingCharacterName];
    } else if (attackingCharacter.hp <= 0) {
        state.message = `${debugPrefix}: Character ${attackingCharacterName} cannot attack, because they are dead.`;
        return { attackOutput: "", levelOutput: "", contextOutput: "" };
    }
    if (defendingCharacter === undefined) {
        state.characters[defendingCharacterName] = new Character();
        defendingCharacter = state.characters[defendingCharacterName];
    } else if (defendingCharacter.hp <= 0) {
        state.message = `${debugPrefix}: Character ${defendingCharacterName} cannot be attacked, because they are dead.`;
        return { attackOutput: "", levelOutput: "", contextOutput: "" };
    }
    let attackingCharacterStatLevelWithMods = (0, GetStatWithMods)(
        attackingCharacter,
        attackStatName
    );
    let defendingCharacterStatLevelWithMods = (0, GetStatWithMods)(
        defendingCharacter,
        defenseStatName
    );
    //If you don't ignore zero division possibility, stats are set to 1 instead of 0
    if (!ignoreZeroDiv) {
        attackingCharacterStatLevelWithMods =
            attackingCharacterStatLevelWithMods === 0
                ? 1
                : attackingCharacterStatLevelWithMods;
        defendingCharacterStatLevelWithMods =
            defendingCharacterStatLevelWithMods === 0
                ? 1
                : defendingCharacterStatLevelWithMods;
    }
    const attackModifier =
        attackingCharacterStatLevelWithMods -
        attackingCharacter.stats[attackStatName].level;
    const defenseModifier =
        defendingCharacterStatLevelWithMods -
        defendingCharacter.stats[defenseStatName].level;
    //Calculating damage
    const damageInflicted = (0, damage)(
        attackingCharacterStatLevelWithMods,
        defendingCharacterStatLevelWithMods
    );
    //Damaging
    state.characters[defendingCharacterName].hp -= damageInflicted;
    //Gives the player necessary info.
    const attackOutput = `${attackingCharacterName} (${attackStatName}: ${attackingCharacterStatLevelWithMods}${
        attackModifier === 0
            ? ""
            : " (base: " +
              (attackingCharacterStatLevelWithMods - attackModifier) +
              ")"
    }) attacked ${defendingCharacterName} (${defenseStatName}: ${defendingCharacterStatLevelWithMods}${
        defenseModifier === 0
            ? ""
            : " (base: " +
              (defendingCharacterStatLevelWithMods - defenseModifier) +
              ")"
    }) dealing ${(0, CustomDamageOutput)(
        damageInflicted,
        damageOutputs
    )} (${damageInflicted}).\n${
        state.characters[defendingCharacterName].hp <= 0
            ? defendingCharacterName +
              (state.characters[defendingCharacterName].isNpc
                  ? " has died."
                  : " has retreated.")
            : defendingCharacterName +
              " now has " +
              state.characters[defendingCharacterName].hp +
              " hp."
    }`;
    let levelOutput = (0, IncrementExp)(
        attackingCharacterName,
        attackStatName
    ).substring(1);
    if (defendingCharacterLevels) {
        levelOutput += (0, IncrementExp)(
            defendingCharacterName,
            defenseStatName
        );
    }
    //Modifies the context, so AI will not know the exact values
    const contextOutput = `${attackingCharacterName} attacked ${defendingCharacterName} dealing ${(0,
    CustomDamageOutput)(damageInflicted, damageOutputs)}.${
        state.characters[defendingCharacterName].hp <= 0
            ? "\n" +
              defendingCharacterName +
              " has " +
              (state.characters[defendingCharacterName].isNpc
                  ? "died."
                  : "retreated.")
            : ""
    }`;
    if (state.characters[defendingCharacterName].hp <= 0)
        if (!defendingCharacter.isNpc)
            state.characters[defendingCharacterName].hp = 0;
        else delete state.characters[defendingCharacterName];
    return { attackOutput, levelOutput, contextOutput };
};
/**
 * state.ctxt is NOT modified by this function
 * Basically DealDamage, but checks for dodging before damaging
 *
 * @param attackStatName Name of stat used to attack
 * @param defenseStatName Name of stat used to defend
 * @param outputTargetByRef String variable used for output. May be state.out or modifiedText
 * @param debugPrefix Prefix added to debug messages, preferably command name
 * @returns Object containing attackOutput "a attacked b" and levelOutput "a levelled up"
 */
const DealDamageIfNotDodged = (
    attackingCharacterName,
    attackStatName,
    defendingCharacterName,
    defenseStatName,
    debugPrefix
) => {
    //Grabs the info
    let attackingCharacter = state.characters[attackingCharacterName];
    let defendingCharacter = state.characters[defendingCharacterName];
    //If you didn't create the characters earlier, they get all stats at starting level from state
    if (attackingCharacter === undefined) {
        state.characters[attackingCharacterName] = new Character();
        attackingCharacter = state.characters[attackingCharacterName];
    } else if (attackingCharacter.hp <= 0) {
        state.message = `${debugPrefix}: Character ${attackingCharacterName} cannot attack, because they are dead.`;
        return { attackOutput: "", levelOutput: "", contextOutput: "" };
    }
    if (defendingCharacter === undefined) {
        state.characters[defendingCharacterName] = new Character();
        defendingCharacter = state.characters[defendingCharacterName];
    } else if (defendingCharacter.hp <= 0) {
        state.message = `${debugPrefix}: Character ${defendingCharacterName} cannot be attacked, because they are dead.`;
        return { attackOutput: "", levelOutput: "", contextOutput: "" };
    }
    let attackingCharacterStatLevelWithMods = (0, GetStatWithMods)(
        attackingCharacter,
        attackStatName
    );
    let defendingCharacterStatLevelWithMods = (0, GetStatWithMods)(
        defendingCharacter,
        defenseStatName
    );
    const attackModifier =
        attackingCharacterStatLevelWithMods -
        attackingCharacter.stats[attackStatName].level;
    const defenseModifier =
        defendingCharacterStatLevelWithMods -
        defendingCharacter.stats[defenseStatName].level;
    //Checks if the character dodged the attack
    if (
        (0, dodge)(
            attackingCharacterStatLevelWithMods,
            defendingCharacterStatLevelWithMods
        )
    ) {
        const attackOutput = `${attackingCharacterName} (${attackStatName}: ${attackingCharacterStatLevelWithMods}${
            attackModifier === 0
                ? ""
                : " (base: " +
                  (attackingCharacterStatLevelWithMods - attackModifier) +
                  ")"
        }) attacked ${defendingCharacterName} (${defenseStatName}: ${defendingCharacterStatLevelWithMods}${
            defenseModifier === 0
                ? ""
                : " (base: " +
                  (defendingCharacterStatLevelWithMods - defenseModifier) +
                  ")"
        }), but missed.`;
        return {
            attackOutput,
            levelOutput: "",
            contextOutput: `${attackingCharacterName} attacked ${defendingCharacterName}, but missed.`,
        };
    }
    return (0, DealDamage)(
        attackingCharacterName,
        attackStatName,
        defendingCharacterName,
        defenseStatName,
        debugPrefix
    );
};

DEBUG = false;
const modifier = (text) => {
    var _a, _b, _c;
    //#region logs
    const logs = () => {
        //!Debug info, uncomment when you need
        if (DEBUG) {
            //console.log(`Og: ${textCopy}`);
            console.log(`In: ${modifiedText}`);
            console.log(`Context: ${state.ctxt}`);
            console.log(`Out: ${state.out}`);
            console.log(`Message: ${state.message}`);
            //console.log(state.side1, state.side2);
            //console.log(state.characters);
            //console.log(state.inBattle);
            /*for (key in state.characters) {
          console.log(`\n\n${key}:\n${state.characters[key]}`);
        }*/
            console.log("------------");
        }
    };
    //#endregion logs
    (0, SetupState)();
    //Resets values
    state.out = state.ctxt = "";
    state.message = " ";
    let modifiedText = text,
        textCopy = text;
    //#region battle handling
    if (state.inBattle) {
        const battleMatch =
            (_a = text.match(
                /\((?:(?<attackStat>[\w ']+), *)?(?<defendingCharacter>[\w\s']+)(?:, *(?<defenseStat>[\w ']+))?\)/i
            )) === null || _a === void 0
                ? void 0
                : _a[0];
        if (battleMatch !== undefined)
            modifiedText =
                modifiedText.substring(0, text.indexOf(battleMatch)) +
                modifiedText.substring(
                    text.indexOf(battleMatch) + battleMatch.length
                );
        if (
            !((_b = state.active) === null || _b === void 0
                ? void 0
                : _b.length)
        ) {
            const temp =
                Number(
                    (_c = state.currentSide) === null || _c === void 0
                        ? void 0
                        : _c.substring(4)
                ) + 1;
            state.currentSide = `side${temp >= 3 ? 1 : temp}`;
            const side = state[state.currentSide];
            state.active = [...side];
        }
        (0, turn)(textCopy);
        logs();
        return { text: modifiedText };
    }
    //#endregion battle handling
    //#region globalCommand
    //Checks for pattern !command(args)
    const globalExp = /!(?<command>[^\s()]+)\((?<arguments>.*)\)/i;
    const globalMatch = text.match(globalExp);
    //If something matched, calls functions with further work
    if (globalMatch && globalMatch.groups) {
        const temp = text.indexOf(globalMatch[0]);
        //Creates indices, because d flag is not allowed
        const currIndices = [temp, temp + globalMatch[0].length];
        //Matches the command and forwards arguments to them
        switch (globalMatch.groups.command.toLowerCase()) {
            case "skillcheck":
                modifiedText = (0, skillcheck)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "battle":
                modifiedText = (0, battle)(
                    globalMatch.groups.arguments,
                    modifiedText
                );
                break;
            case "attack":
                modifiedText = !constantsDodge
                    ? (0, attack)(
                          globalMatch.groups.arguments,
                          currIndices,
                          textCopy,
                          modifiedText
                      )
                    : (0, sattack)(
                          globalMatch.groups.arguments,
                          currIndices,
                          textCopy,
                          modifiedText
                      );
                break;
            case "sattack":
                modifiedText = constantsDodge
                    ? (0, attack)(
                          globalMatch.groups.arguments,
                          currIndices,
                          textCopy,
                          modifiedText
                      )
                    : (0, sattack)(
                          globalMatch.groups.arguments,
                          currIndices,
                          textCopy,
                          modifiedText
                      );
                break;
            case "heal":
                modifiedText = (0, heal)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "revive":
                modifiedText = (0, revive)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "additem":
                modifiedText = (0, addItem)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "alteritem":
                modifiedText = (0, alterItem)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "gainitem":
                modifiedText = (0, gainItem)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "equip":
                modifiedText = (0, equip)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "unequip":
                modifiedText = (0, unequip)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "showinventory":
                modifiedText = (0, showInventory)(
                    globalMatch.groups.arguments,
                    modifiedText
                );
                break;
            case "addcharacter":
                modifiedText = (0, addCharacter)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "addnpc":
                modifiedText = (0, addNPC)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "setstats":
                modifiedText = (0, setStats)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "showstats":
                modifiedText = (0, showStats)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "levelstats":
                modifiedText = (0, levelStats)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "getstate":
                modifiedText = (0, getState)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "setstate":
                modifiedText = (0, setState)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            default:
                state.message = "Command not found.";
                break;
        }
        if (state.ctxt.length <= 1) state.ctxt = " \n";
    }
    //#endregion globalCommand
    state.in = modifiedText;
    logs();
    // You must return an object with the text property defined.
    return { text: modifiedText };
};

const SetupState = () => {
    state.stats = state.stats === undefined ? [] : state.stats;
    state.dice = state.dice === undefined ? 20 : state.dice;
    state.startingLevel =
        state.startingLevel === undefined ? 1 : state.startingLevel;
    state.startingHP = state.startingHP === undefined ? 100 : state.startingHP;
    state.characters = state.characters === undefined ? {} : state.characters;
    state.items = state.items === undefined ? {} : state.items;
    state.inventory = state.inventory === undefined ? [] : state.inventory;
    state.punishment = state.punishment === undefined ? 5 : state.punishment;
    state.skillpointsOnLevelUp =
        state.skillpointsOnLevelUp === undefined
            ? 5
            : state.skillpointsOnLevelUp;
    state.inBattle = state.inBattle === undefined ? false : state.inBattle;
};

// import { DEBUG } from "./modifier";
/**
 * Executes next battle turn until player can take action.
 * Does not modify text
 */
const turn = (textCopy) => {
    // if (DEBUG) console.log("Active: ", state.active);
    var _a, _b, _c, _d, _e;
    if (!state.activeCharacter) {
        if (
            !((_a = state.active) === null || _a === void 0
                ? void 0
                : _a.length)
        ) {
            const temp =
                Number(
                    (_b = state.currentSide) === null || _b === void 0
                        ? void 0
                        : _b.substring(4)
                ) + 1;
            state.currentSide = `side${temp >= 3 ? 1 : temp}`;
            state.active = [...state[state.currentSide]];
        }
        const nextActiveCharacterIndex = (0, diceRoll)(state.active.length) - 1;
        state.activeCharacterName = state.active[nextActiveCharacterIndex];
        state.activeCharacter = state.characters[state.activeCharacterName];
    }
    //Attacking character set and is not an NPC
    if (!state.activeCharacter.isNpc) {
        if (!state.activeCharacterName) {
            state.message = "Battle turn: active character name not found.";
            return;
        }
        const expression =
            /(?<escape>retreat|escape|exit)|(?:\((?<attackStat>[\w ']+), *)?(?<defendingCharacter>[\w\s']+)(?:, *(?<defenseStat>[\w ']+))?\)/i;
        const match = textCopy.match(expression);
        // Player written something wrong
        if (
            !match ||
            !(match === null || match === void 0 ? void 0 : match.groups)
        ) {
            state.message =
                "Battle turn: In battle you can only retreat or attack.\nFor further information read !battle section of README.";
            return;
        }
        // Retreat, escape or exit were in input, party retreats
        if (match.groups.escape) {
            state.out += "\nParty retreated from the fight.";
            ExitBattle();
            return;
        }
        //Shifts values if necessary
        if ((0, isInStats)(match.groups.defendingCharacter)) {
            if (
                (0, ElementInArray)(
                    match.groups.attackStat,
                    Object.keys(state.characters)
                ) &&
                !match.groups.defenseStat
            ) {
                match.groups.defenseStat = match.groups.defendingCharacter;
                match.groups.defendingCharacter = match.groups.attackStat;
                match.groups.attackStat = "";
            } else if (
                (0, ElementInArray)(
                    match.groups.defenseStat,
                    Object.keys(state.characters)
                ) &&
                !match.groups.attackStat
            ) {
                match.groups.attackStat = match.groups.defendingCharacter;
                match.groups.defendingCharacter = match.groups.defenseStat;
                match.groups.defenseStat = "";
            }
        }
        const attackingCharacterName = state.activeCharacterName;
        //You ALWAYS have to pick a target
        const defendingCharacterName = match.groups.defendingCharacter;
        //Grabs values or default for stats
        const attackStat =
            match.groups.attackStat ||
            (0, BestStat)(state.characters[attackingCharacterName]);
        const defenseStat =
            match.groups.defenseStat ||
            (0, BestStat)(state.characters[defendingCharacterName]);
        takeTurn(
            attackingCharacterName,
            defendingCharacterName,
            attackStat,
            defenseStat
        );
    }
    while (
        ((_c = state.activeCharacter) === null || _c === void 0
            ? void 0
            : _c.isNpc) ||
        state.activeCharacter === undefined
    ) {
        const attackingCharacterName = state.activeCharacterName;
        if (!attackingCharacterName) {
            state.message =
                "Battle turn: ERROR active character name is undefined";
            return;
        }
        //Gets names of possibly attacked characters
        const sideNumber =
            Number(
                (_d = state.currentSide) === null || _d === void 0
                    ? void 0
                    : _d.substring(4)
            ) + 1;
        const attacked = sideNumber >= 3 || sideNumber == 1 ? "side1" : "side2";
        const attackedSideCharactersNames =
            (_e = state[attacked]) !== null && _e !== void 0 ? _e : [];
        //Randomly chooses one
        const defendingCharacterIndex =
            (0, diceRoll)(attackedSideCharactersNames.length) - 1;
        const defendingCharacterName =
            attackedSideCharactersNames[defendingCharacterIndex];
        const defendingCharacter = state.characters[defendingCharacterName];
        //Gets necessary values
        const attackStat = (0, BestStat)(state.activeCharacter);
        const defenseStat = (0, BestStat)(defendingCharacter);
        takeTurn(
            attackingCharacterName,
            defendingCharacterName,
            attackStat,
            defenseStat
        );
    }
};
const takeTurn = (
    attackingCharacterName,
    defendingCharacterName,
    attackStat,
    defenseStat
) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    //Gets names of possibly attacked characters to check whether the target is one
    const sideNumber =
        Number(
            (_a = state.currentSide) === null || _a === void 0
                ? void 0
                : _a.substring(4)
        ) + 1;
    const attacked = sideNumber >= 3 || sideNumber == 1 ? "side1" : "side2";
    const attackedSideCharactersNames =
        (_b = state[attacked]) !== null && _b !== void 0 ? _b : [];
    const attackingCharacter = state.characters[attackingCharacterName];
    //You ALWAYS have to pick a target
    const defendingCharacterIndex = attackedSideCharactersNames.findIndex(
        (el) => el === defendingCharacterName
    );
    if (
        !(0, ElementInArray)(
            defendingCharacterName,
            attackedSideCharactersNames
        )
    ) {
        state.message = `Battle turn: character ${defendingCharacterName} doesn't belong to the other side of the battle.`;
        return;
    }
    const defendingCharacter = state.characters[defendingCharacterName];
    let attackingCharacterStatLevelWithMods = (0, GetStatWithMods)(
        attackingCharacter,
        attackStat
    );
    let defendingCharacterStatLevelWithMods = (0, GetStatWithMods)(
        defendingCharacter,
        defenseStat
    );
    //If you don't ignore zero division possibility, stats are set to 1 instead of 0
    if (!ignoreZeroDiv) {
        attackingCharacterStatLevelWithMods =
            attackingCharacterStatLevelWithMods === 0
                ? 1
                : attackingCharacterStatLevelWithMods;
        defendingCharacterStatLevelWithMods =
            defendingCharacterStatLevelWithMods === 0
                ? 1
                : defendingCharacterStatLevelWithMods;
    }
    const attackModifier =
        attackingCharacterStatLevelWithMods -
        attackingCharacter.stats[attackStat].level;
    const defenseModifier =
        defendingCharacterStatLevelWithMods -
        defendingCharacter.stats[defenseStat].level;
    if (constantsDodge) {
        if (
            (0, dodge)(
                attackingCharacterStatLevelWithMods,
                defendingCharacterStatLevelWithMods
            )
        ) {
            state.out += `\n${attackingCharacterName} (${attackStat}: ${attackingCharacterStatLevelWithMods}${
                attackModifier === 0
                    ? ""
                    : " (base: " +
                      (attackingCharacterStatLevelWithMods - attackModifier) +
                      ")"
            }) attacked ${defendingCharacterName} (${defenseStat}: ${defendingCharacterStatLevelWithMods}${
                defenseModifier === 0
                    ? ""
                    : " (base: " +
                      (defendingCharacterStatLevelWithMods - defenseModifier) +
                      ")"
            }), but missed.`;
            //End turn on miss
            EndTurn();
            return;
        }
    }
    //Calculating damage
    const damageInflicted = (0, damage)(
        attackingCharacterStatLevelWithMods,
        defendingCharacterStatLevelWithMods
    );
    //Damaging
    state.characters[defendingCharacterName].hp -= damageInflicted;
    //Gives the player necessary info.
    state.out += `\n${attackingCharacterName} (${attackStat}: ${attackingCharacterStatLevelWithMods}${
        attackModifier === 0
            ? ""
            : " (base: " +
              (attackingCharacterStatLevelWithMods - attackModifier) +
              ")"
    }) attacked ${defendingCharacterName} (${defenseStat}: ${defendingCharacterStatLevelWithMods}${
        defenseModifier === 0
            ? ""
            : " (base: " +
              (defendingCharacterStatLevelWithMods - defenseModifier) +
              ")"
    }) dealing ${(0, CustomDamageOutput)(
        damageInflicted,
        damageOutputs
    )} (${damageInflicted}).\n${
        state.characters[defendingCharacterName].hp <= 0
            ? defendingCharacterName +
              (state.characters[defendingCharacterName].isNpc
                  ? " has died."
                  : " has retreated.")
            : defendingCharacterName +
              " now has " +
              state.characters[defendingCharacterName].hp +
              " hp."
    }`;
    //Always grants 1 Exp to attacking character, for defending it's up to user
    state.out += (0, IncrementExp)(attackingCharacterName, attackStat);
    if (defendingCharacterLevels) {
        state.out += (0, IncrementExp)(defendingCharacterName, defenseStat);
    }
    //If character's hp falls below 0, they are removed from the battle
    if (
        ((_c = state.characters[defendingCharacterName]) === null ||
        _c === void 0
            ? void 0
            : _c.hp) <= 0
    ) {
        state.characters[defendingCharacterName].hp = 0;
        attackedSideCharactersNames.splice(defendingCharacterIndex, 1);
        //NPCs die when they are killed
        if (state.characters[defendingCharacterName].isNpc)
            delete state.characters[defendingCharacterName];
    }
    //Checks if the battle should end after every attack
    if (!((_d = state.side1) === null || _d === void 0 ? void 0 : _d.length)) {
        state.message =
            "HP of all party members dropped to 0. Party retreated.";
        state.out += "\nThe adventurers retreated, overwhelmed by the enemy.";
        ExitBattle();
        return;
    } else if (
        !((_e = state.side2) === null || _e === void 0 ? void 0 : _e.length)
    ) {
        state.out += "\nThe adventurers have won the battle.";
        ExitBattle();
        state.message = "You have won the battle!";
        return;
    }
    const attackingCharacterIndex =
        (_g =
            (_f = state.active) === null || _f === void 0
                ? void 0
                : _f.indexOf(attackingCharacterName)) !== null && _g !== void 0
            ? _g
            : 0;
    //Removes current character from active ones and if the active array is empty,
    //populates is with characters from the other side of the battle
    (_h = state.active) === null || _h === void 0
        ? void 0
        : _h.splice(attackingCharacterIndex, 1);
    if (!((_j = state.active) === null || _j === void 0 ? void 0 : _j.length)) {
        const temp =
            Number(
                (_k = state.currentSide) === null || _k === void 0
                    ? void 0
                    : _k.substring(4)
            ) + 1;
        state.currentSide = `side${temp >= 3 ? 1 : temp}`;
        state.active = [...state[state.currentSide]];
    }
    EndTurn();
};
const EndTurn = () => {
    var _a, _b, _c;
    const nextActiveCharacterIndex =
        (0, diceRoll)(
            (_b =
                (_a = state.active) === null || _a === void 0
                    ? void 0
                    : _a.length) !== null && _b !== void 0
                ? _b
                : 1
        ) - 1;
    const activeCharacterName =
        (_c = state.active) === null || _c === void 0
            ? void 0
            : _c[nextActiveCharacterIndex];
    if (!activeCharacterName) {
        state.message = "Battle turn: ERROR active character is undefined.";
        return;
    }
    state.activeCharacterName = activeCharacterName;
    state.activeCharacter = state.characters[state.activeCharacterName];
    state.message = `Current turn: ${state.activeCharacterName}`;
};
const ExitBattle = () => {
    state.inBattle = false;
    delete state.activeCharacter, state.activeCharacterName, state.active;
    delete state.side1, state.side2;
    delete state.currentSide;
    state.message = "";
};

modifier(text);
