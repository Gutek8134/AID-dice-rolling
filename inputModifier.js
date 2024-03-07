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
        state[InfoOutput] =
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
    //Error checking
    if (
        commandArguments === undefined ||
        commandArguments === null ||
        commandArguments === ""
    ) {
        state[InfoOutput] = "Add Item: No arguments found.";
        return modifiedText;
    }
    //Looks for pattern name, slot, stat=value, target place (none by default) and character
    const exp =
        /(?<name>[\w ']+), (?<slot>[\w\s]+)(?<modifiers>(?:, [\w ']+ *= *-?\d+)+)(?<effectNames>(?:, (?!equip|inventory|[^\w '])[\w ']*)*)?(?:, *(?<target>inventory|equip)(?:, *(?<character>[\w\s']+))?)?/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Add Item: Arguments were not given in proper format.";
        return modifiedText;
    }
    if ((0, ElementInArray)(match.groups.name, Object.keys(state.items))) {
        state[
            InfoOutput
        ] = `Add Item: Item ${match.groups.name} already exists. Maybe you should use gainItem or equip instead?`;
        return modifiedText;
    }
    if (match.groups.target === "equip") {
        if (match.groups.character === undefined) {
            state[InfoOutput] =
                "Add Item: You must specify who will equip the item when you choose so.";
            return modifiedText;
        }
        if (
            !(0, ElementInArray)(
                match.groups.character,
                Object.keys(state.characters)
            )
        ) {
            state[
                InfoOutput
            ] = `Add Item: Character ${match.groups.character} doesn't exist.`;
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
    const effectNames = match.groups.effectNames
        ? match.groups.effectNames
              .substring(2)
              .split(", ")
              .map((el) => ["effect", el.trim()])
        : [];
    //Sanitizing
    let error = false;
    for (const modifier of initValues) {
        if ((0, ElementInArray)(modifier[0], restrictedStatNames)) {
            state[InfoOutput] += `\nAdd Item: ${modifier[0]} cannot be set.`;
            error = true;
            continue;
        }
        //Stats must exist prior
        if (!(0, isInStats)(modifier[0])) {
            state[
                InfoOutput
            ] += `\nAdd Item: Stat ${modifier[0]} does not exist.`;
            error = true;
        }
    }
    for (const [_, name] of effectNames) {
        if (!(0, ElementInArray)(name, Object.keys(state.effects))) {
            state[InfoOutput] += `\nAdd Item: Effect ${name} does not exist.`;
            error = true;
        }
    }
    if (error) return modifiedText;
    initValues.push(...effectNames);
    //Adds slot
    initValues.push(["slot", match.groups.slot]);
    //Passes to constructor and adds received item to the state
    const item = new Item(itemName, initValues);
    state.items[itemName] = item;
    //Gives the player necessary info.
    modifiedText =
        modifiedText.substring(0, currIndices[0]) +
        modifiedText.substring(currIndices[1]);
    state.out = `Item ${itemName} created with attributes:\n${(0, ItemToString)(
        item
    )}.`;
    if (match.groups.target === "equip")
        state.out += (0, _equip)(match.groups.character, item, "");
    else if (match.groups.target === "inventory") {
        state.inventory.push(itemName);
        state.out += `\nItem ${itemName} was put into inventory.`;
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
        state[InfoOutput] =
            "Add NPC: Arguments were not given in proper format.";
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
    // console.log(
    //     match.groups.startingItems
    //         .split(",")
    //         .map((el) => el.trim().substring(1))
    //         .slice(1)
    // );
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

const alterEffect = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Looks for pattern name, stat=value, duration, unique?, appliedOn?, appliedTo?, impact?W
    const exp =
        /^\s*(?<name>[\w ']+)(?<duration>, \d+)?(?<modifiers>(?:, [\w ']+ *= *-?\d+)+)?(?:, (?<unique>unique|u))?(?:, (?<appliedOn>a|attack|d|defense|b|battle start|n|not applied))?(?:, (?<appliedTo>self|enemy))?(?:, (?<impact>on end|e|every turn|t|continuous|c))?\s*$/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Alter Effect: Arguments were not given in proper format.";
        return modifiedText;
    }
    if (!state.effects) state.effects = {};
    if (!(0, ElementInArray)(match.groups.name, Object.keys(state.effects))) {
        state[
            InfoOutput
        ] = `Alter Effect: Effect ${match.groups.name} doesn't exist.`;
        return modifiedText;
    }
    const effect = state.effects[match.groups.name];
    const oldAttributes = (0, EffectToString)(effect);
    let modifiers = [];
    if (match.groups.modifiers) {
        modifiers = match.groups.modifiers
            .substring(2)
            .split(", ")
            .map((el) => {
                const temp = el.trim().split("=");
                return [temp[0].trim(), Number(temp[1].trim())];
            });
        let error = false;
        const existingModifiers = [];
        for (const modifier of modifiers) {
            if (
                (0, ElementInArray)(modifier[0], restrictedStatNames) &&
                modifier[0] !== "hp"
            ) {
                state[
                    InfoOutput
                ] += `\nAlter Effect: ${modifier[0]} cannot be set.`;
                error = true;
                continue;
            }
            //Stats must exist prior
            if (!(0, isInStats)(modifier[0]) && modifier[0] !== "hp") {
                state[
                    InfoOutput
                ] += `\nAlter Effect: Stat ${modifier[0]} does not exist.`;
                error = true;
            }
            if ((0, ElementInArray)(modifier[0], existingModifiers)) {
                state[
                    InfoOutput
                ] += `\nAlter Effect: Stat ${modifier[0]} appears more than once.`;
                error = true;
            } else existingModifiers.push(modifier[0]);
        }
        if (error) return modifiedText;
        let overriddenModifiers = {};
        for (const [stat, value] of modifiers) {
            overriddenModifiers[stat] = value;
        }
        effect.modifiers = overriddenModifiers;
    }
    if (match.groups.duration) {
        match.groups.duration = match.groups.duration.substring(2);
        if (!Number.isInteger(Number(match.groups.duration))) {
            state[InfoOutput] =
                "Create Effect: Duration is not a whole number.";
            return modifiedText;
        }
        effect.durationLeft = effect.baseDuration = Number(
            match.groups.duration
        );
    }
    if (match.groups.unique)
        switch (match.groups.unique) {
            case "u":
            case "unique":
                effect.applyUnique = true;
                break;
            case "i":
            case "not unique":
                effect.applyUnique = false;
                break;
        }
    if (match.groups.appliedOn)
        switch (match.groups.appliedOn.toLowerCase()) {
            case "a":
            case "attack":
                effect.appliedOn = "attack";
                break;
            case "b":
            case "battle start":
                effect.appliedOn = "battle start";
                break;
            case "d":
            case "defense":
                effect.appliedOn = "defense";
                break;
            case "n":
            case "not applied":
            default:
                effect.appliedOn = "not applied";
                break;
        }
    if (match.groups.appliedTo)
        switch (match.groups.appliedTo.toLowerCase()) {
            default:
            case "self":
                effect.appliedTo = "self";
                break;
            case "enemy":
                effect.appliedTo = "enemy";
                break;
        }
    if (match.groups.impact)
        switch (match.groups.impact.toLowerCase()) {
            default:
            case "c":
            case "continuous":
                effect.impact = "continuous";
                break;
            case "e":
            case "on end":
                effect.impact = "on end";
                break;
            case "t":
            case "every turn":
                effect.impact = "every turn";
                break;
        }
    modifiedText = `\n${
        match.groups.name
    }'s attributes has been altered\nfrom\n${oldAttributes}\nto\n${(0,
    EffectToString)(effect)}.`;
    return modifiedText;
};

const alterItem = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Looks for pattern name, slot, stat=value
    const exp =
        /(?<name>[\w ']+)(?<slot>, [\w\s]+)?(?<modifiers>(?:, [\w ']+ *= *-?\d+)+)(?<effectNames>(?:, [\w ']+)*)/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Alter Item: Arguments were not given in proper format.";
        return modifiedText;
    }
    if (!(0, ElementInArray)(match.groups.name, Object.keys(state.items))) {
        state[
            InfoOutput
        ] = `Alter Item: Item ${match.groups.name} does not exist.`;
        if (DEBUG) {
            state[InfoOutput] += "\n";
            for (const key in state.items) state[InfoOutput] += ", " + key;
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
    const effectNames = match.groups.effectNames
        ? match.groups.effectNames
              .substring(2)
              .split(", ")
              .map((el) => el.trim())
        : [];
    //Stats must exist prior
    let error = false;
    for (const modifier of initValues) {
        if ((0, ElementInArray)(modifier[0], restrictedStatNames)) {
            state[
                InfoOutput
            ] += `\nAlter Item: ${modifier[0]} cannot be altered.`;
            error = true;
            continue;
        }
        if (!(0, isInStats)(modifier[0])) {
            state[
                InfoOutput
            ] = `Alter Item: Stat ${modifier[0]} does not exist.`;
            error = true;
        }
    }
    for (const name of effectNames) {
        if (!(0, ElementInArray)(name, Object.keys(state.effects))) {
            state[InfoOutput] += `\nAlter Item: Effect ${name} does not exist.`;
            error = true;
        }
    }
    if (error) return modifiedText;
    const item = state.items[itemName];
    const oldAttributes = (0, ItemToString)(item);
    item.slot = match.groups.slot.substring(2);
    for (const modifier of initValues) {
        if (modifier[1] === 0) delete item.modifiers[modifier[0]];
        else item.modifiers[modifier[0]] = modifier[1];
    }
    if (effectNames.length > 0) {
        item.effects = effectNames;
    }
    state.out = `\n${itemName}'s attributes has been altered\nfrom\n${oldAttributes}\nto\n${(0,
    ItemToString)(item)}.`;
    return modifiedText;
};

const applyEffect = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Looks for pattern name, character, override duration?
    const exp =
        /^(?<effectName>[\w ']+), (?<characterName>[\w ']+)(?:, (?<overriddenDuration>\d+))?$/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Apply Effect: Arguments were not given in proper format.";
        return modifiedText;
    }
    const effectName = match.groups.effectName;
    const characterName = match.groups.characterName;
    const overriddenDurationAsString = match.groups.overriddenDuration;
    if (!(0, ElementInArray)(effectName, Object.keys(state.effects))) {
        state[
            InfoOutput
        ] = `Apply Effect: Effect ${effectName} does not exist.`;
        return modifiedText;
    }
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state[
            InfoOutput
        ] = `Apply Effect: Character ${characterName} does not exist.`;
        return modifiedText;
    }
    if (
        overriddenDurationAsString &&
        !Number.isInteger(overriddenDurationAsString)
    ) {
        state[InfoOutput] =
            "Apply Effect: Overridden duration is not a whole number.";
        return modifiedText;
    }
    const effect = state.effects[effectName];
    const character = state.characters[characterName];
    if (!character.activeEffects) character.activeEffects = [];
    if (effect.applyUnique)
        if (
            (0, ElementInArray)(
                effect.name,
                character.activeEffects.map((effect) => effect.name)
            )
        ) {
            state[
                InfoOutput
            ] = `Apply Effect: Effect ${effect.name} was not applied to ${characterName}. Reason: unique effect already applied.`;
            return modifiedText;
        }
    (0, InstanceEffect)(
        characterName,
        effect,
        overriddenDurationAsString
            ? Number(overriddenDurationAsString)
            : undefined
    );
    state.out = `Effect ${effectName} applied to ${characterName}.
Current ${characterName} state:
${(0, CharacterToString)(character)}`;
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
        state[InfoOutput] =
            "Attack: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Checks for format stat, character, stat, character
    const exp =
        /(?<attackingCharacter>[\w\s']+), *(?<attackStat>[\w ']+), *(?<defendingCharacter>[\w\s']+), *(?<defenseStat>[\w ']+)/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (match === null || !match.groups) {
        state[InfoOutput] = "Attack: No matching arguments found.";
        return modifiedText;
    }
    //Checks if stats exist
    if (!(0, ElementInArray)(match.groups.attackStat, state.stats)) {
        state[
            InfoOutput
        ] = `Attack: Stat ${match.groups.attackStat} was not created.`;
        return modifiedText;
    }
    if (!(0, ElementInArray)(match.groups.defenseStat, state.stats)) {
        state[
            InfoOutput
        ] = `Attack: Stat ${match.groups.defenseStat} was not created.`;
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
        state[
            InfoOutput
        ] = `Attack: Character ${attackingCharacterName} does not exist.`;
        return modifiedText;
    }
    if (
        !(0, ElementInArray)(
            defendingCharacterName,
            Object.keys(state.characters)
        )
    ) {
        state[
            InfoOutput
        ] = `Attack: Character ${defendingCharacterName} does not exist.`;
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
        state[InfoOutput] = "Battle: No arguments found.";
        return modifiedText;
    }
    //Looks for pattern (character1, character2, ...), (character3, character4, ...)
    const exp =
        /\((?<group1>[\w\s']+(?:, *[\w\s']+)*)\), *\((?<group2>[\w\s']+(?:, *[\w\s']+)*)\)/i;
    const match = modifiedText.match(exp);
    //Error checking
    if (match === null || !match.groups) {
        state[InfoOutput] =
            "Battle: Arguments were not given in proper format.";
        return modifiedText;
    }
    if (state.inBattle) {
        state[InfoOutput] = "Battle: You are already in a battle.";
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
                state[
                    InfoOutput
                ] = `Battle: Character ${characterName} is dead and cannot participate in battle.`;
                return modifiedText;
            }
            if ((0, ElementInArray)(characterName, side2CharactersNames)) {
                state[
                    InfoOutput
                ] = `Battle: Character ${characterName} cannot belong to both sides of the battle.`;
                return modifiedText;
            }
        } else {
            //console.log(`${el}\n\n${state.characters}`);
            state[
                InfoOutput
            ] = `Battle: Character ${characterName} doesn't exist.`;
            return modifiedText;
        }
    }
    for (const characterName of side2CharactersNames) {
        if (
            !(0, ElementInArray)(characterName, Object.keys(state.characters))
        ) {
            state[
                InfoOutput
            ] = `Battle: Character ${characterName} doesn't exist.`;
            return modifiedText;
        } else if (state.characters[characterName].hp <= 0) {
            state[
                InfoOutput
            ] = `Battle: Character ${characterName} is dead and cannot participate in battle.`;
            return modifiedText;
        }
    }
    state.out = "A battle has emerged between two groups!";
    //On battle start effects are instanced (applied) to self or random enemy
    for (const characterName of side1CharactersNames) {
        const character = state.characters[characterName];
        for (const item of Object.values(character.items)) {
            for (const effectName of item.effects) {
                const effect = state.effects[effectName];
                if (effect.appliedOn === "battle start")
                    if (effect.appliedTo === "self")
                        state.out += (0, InstanceEffect)(characterName, effect);
                    else if (effect.appliedTo === "enemy")
                        state.out += (0, InstanceEffect)(
                            side2CharactersNames[
                                (0, diceRoll)(side2CharactersNames.length) - 1
                            ],
                            effect
                        );
            }
        }
    }
    for (const characterName of side2CharactersNames) {
        const character = state.characters[characterName];
        for (const item of Object.values(character.items)) {
            for (const effectName of item.effects) {
                const effect = state.effects[effectName];
                if (effect.appliedOn === "battle start")
                    if (effect.appliedTo === "self")
                        state.out += (0, InstanceEffect)(characterName, effect);
                    else if (effect.appliedTo === "enemy")
                        state.out += (0, InstanceEffect)(
                            side1CharactersNames[
                                (0, diceRoll)(side1CharactersNames.length) - 1
                            ],
                            effect
                        );
            }
        }
    }
    //Setting up values for automatic turns
    state.side1 = side1CharactersNames;
    state.side2 = side2CharactersNames;
    state.currentSide = `side${(0, diceRoll)(2)}`;
    state.active = [...state[state.currentSide]];
    state.inBattle = true;
    const nextActiveCharacterIndex = (0, diceRoll)(state.active.length) - 1;
    state.activeCharacterName = state.active[nextActiveCharacterIndex];
    state.activeCharacter = state.characters[state.activeCharacterName];
    state.out += state.activeCharacterName;
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

const createEffect = (commandArguments, currIndices, modifiedText) => {
    var _a, _b, _c;
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Looks for pattern name, stat=value, duration, unique?, appliedOn?, appliedTo?, impact?
    const exp =
        /^\s*(?<name>[\w ']+), (?<duration>\d+)(?<modifiers>(?:, [\w ']+ *= *-?\d+)+)(?:, (?<unique>unique|u))?(?:, (?<appliedOn>a|attack|d|defense|b|battle start|n|not applied))?(?:, (?<appliedTo>self|enemy))?(?:, (?<impact>on end|e|every turn|t|continuous|c))?\s*$/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Create Effect: Arguments were not given in proper format.";
        return modifiedText;
    }
    if (!state.effects) state.effects = {};
    if ((0, ElementInArray)(match.groups.name, Object.keys(state.effects))) {
        state[
            InfoOutput
        ] = `Create Effect: Effect ${match.groups.name} already exists.`;
        return modifiedText;
    }
    const initModifiers = match.groups.modifiers
        .substring(2)
        .split(", ")
        .map((el) => {
            const temp = el.trim().split("=");
            return [temp[0].trim(), Number(temp[1].trim())];
        });
    let error = false;
    const existingModifiers = [];
    for (const modifier of initModifiers) {
        if (
            (0, ElementInArray)(modifier[0], restrictedStatNames) &&
            modifier[0] !== "hp"
        ) {
            state[
                InfoOutput
            ] += `\nCreate Effect: ${modifier[0]} cannot be set.`;
            error = true;
            continue;
        }
        //Stats must exist prior
        if (!(0, isInStats)(modifier[0]) && modifier[0] !== "hp") {
            state[
                InfoOutput
            ] += `\nCreate Effect: Stat ${modifier[0]} does not exist.`;
            error = true;
        }
        if ((0, ElementInArray)(modifier[0], existingModifiers)) {
            state[
                InfoOutput
            ] += `\nCreate Effect: Stat ${modifier[0]} appears more than once.`;
            error = true;
        } else existingModifiers.push(modifier[0]);
    }
    if (error) return modifiedText;
    if (!Number.isInteger(Number(match.groups.duration))) {
        state[InfoOutput] = "Create Effect: Duration is not a whole number.";
        return modifiedText;
    }
    let appliedOn;
    switch (
        (_a = match.groups.appliedOn) === null || _a === void 0
            ? void 0
            : _a.toLowerCase()
    ) {
        case "a":
        case "attack":
            appliedOn = "attack";
            break;
        case "b":
        case "battle start":
            appliedOn = "battle start";
            break;
        case "d":
        case "defense":
            appliedOn = "defense";
            break;
        default:
            appliedOn = "not applied";
            break;
    }
    let appliedTo;
    switch (
        (_b = match.groups.appliedTo) === null || _b === void 0
            ? void 0
            : _b.toLowerCase()
    ) {
        default:
        case "self":
            appliedTo = "self";
            break;
        case "enemy":
            appliedTo = "enemy";
            break;
    }
    let impact;
    switch (
        (_c = match.groups.impact) === null || _c === void 0
            ? void 0
            : _c.toLowerCase()
    ) {
        default:
        case "c":
        case "continuous":
            impact = "continuous";
            break;
        case "e":
        case "on end":
            impact = "on end";
            break;
        case "t":
        case "every turn":
            impact = "every turn";
            break;
    }
    const effect = new Effect(
        match.groups.name.trim(),
        initModifiers,
        Number(match.groups.duration.trim()),
        appliedOn,
        appliedTo,
        impact,
        match.groups.unique !== undefined
    );
    state.effects[effect.name] = effect;
    modifiedText = `\nEffect ${effect.name} created with attributes:\n${(0,
    EffectToString)(effect)}.`;
    return modifiedText;
};

const equip = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Error checking
    if (!commandArguments) {
        state[InfoOutput] = "Equip Item: No arguments found.";
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
        state[InfoOutput] =
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
        state[
            InfoOutput
        ] = `Equip Item: Character ${characterName} doesn't exist.`;
        return DEBUG ? "error" : modifiedText;
    }
    for (const name of itemNames) {
        if (!(0, ElementInArray)(name, Object.keys(state.items))) {
            state[InfoOutput] = `Equip Item: Item ${name} doesn't exist.`;
            return DEBUG ? "error" : modifiedText;
        }
        if (!(0, ElementInArray)(name, state.inventory)) {
            state[
                InfoOutput
            ] = `Equip Item: You don't have item ${name} in your inventory.`;
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
        state[InfoOutput] = "Gain Item: No arguments found.";
        return modifiedText;
    }
    const exp = /(?<name>[\w ']+)(?:, *(?<character>[\w\s']+))?/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Gain Item: Arguments were not given in proper format.";
        return modifiedText;
    }
    const characterName = match.groups.character,
        itemName = match.groups.name;
    if (!(0, ElementInArray)(itemName, Object.keys(state.items))) {
        state[InfoOutput] = `Gain Item: Item ${itemName} doesn't exist.`;
        return modifiedText;
    }
    //If the character has been specified, it must exist
    if (
        characterName !== undefined &&
        !(0, ElementInArray)(characterName, Object.keys(state.characters))
    ) {
        state[
            InfoOutput
        ] = `Gain Item: Character ${characterName} doesn't exist.`;
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
        state[InfoOutput] = "Heal: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Shortcut
    const characterName = match.groups.character;
    //Checks if character exists
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state[InfoOutput] = `Heal: Character ${characterName} does not exist.`;
        return modifiedText;
    }
    //Another shortcut
    const character = state.characters[characterName];
    //Checks if character is dead
    if (character.hp < 1) {
        state[InfoOutput] =
            "Heal: Dead characters must be revived before healing.";
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
        state[InfoOutput] =
            "Level Stats: This command will work only when you are levelling your characters.\nIn current mode stats are levelling by themselves when you are using them.";
        return modifiedText;
    }
    //Looks for format character, stat1+val1, stat2+val2...
    const exp = /(?<character>[\w\s']+)(?<stats>(?:, [\w ']+ *\+ *\d+)+)/i;
    const match = commandArguments.match(exp);
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Level Stats: Arguments were not given in proper format.";
        return modifiedText;
    }
    const characterName = match.groups.character;
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state[InfoOutput] =
            "Level Stats: Nonexistent characters can't level up.";
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
        state[InfoOutput] =
            "Level Stats: You need to use at least one skillpoint.";
        return modifiedText;
    }
    if (character.skillpoints < usedSkillpoints) {
        state[
            InfoOutput
        ] = `Level Stats: ${characterName} doesn't have enough skillpoints (${character.skillpoints}/${usedSkillpoints}).`;
        return modifiedText;
    }
    //Caches old stats to show
    const oldStats = (0, CharacterToString)(character);
    //Changes stats
    for (const el of values) {
        if ((0, ElementInArray)(el[0], restrictedStatNames)) {
            state[
                InfoOutput
            ] += `\nLevel Stats: ${el[0]} cannot be levelled up.`;
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

const removeEffect = (commandArguments, currIndices, modifiedText) => {
    (0, CutCommandFromContext)(modifiedText, currIndices);
    //Looks for pattern name|all, character
    const exp = /^(?<effectName>[\w ']+), (?<characterName>[\w ']+)$/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Remove Effect: Arguments were not given in proper format.";
        return modifiedText;
    }
    const effectName = match.groups.effectName;
    const characterName = match.groups.characterName;
    if (
        !(0, ElementInArray)(effectName, Object.keys(state.effects)) &&
        effectName !== "all"
    ) {
        state[
            InfoOutput
        ] = `Remove Effect: Effect ${effectName} does not exist.`;
        return modifiedText;
    }
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state[
            InfoOutput
        ] = `Remove Effect: Character ${characterName} does not exist.`;
        return modifiedText;
    }
    const character = state.characters[characterName];
    if (!character.activeEffects) character.activeEffects = [];
    if (effectName === "all") {
        character.activeEffects = [];
        state.out = `All effects have been removed from ${characterName}.
Current ${characterName} state:
${(0, CharacterToString)(character)}`;
        return modifiedText;
    }
    if (
        !(0, ElementInArray)(
            effectName,
            character.activeEffects.map((effect) => effect.name)
        )
    ) {
        state[
            InfoOutput
        ] += `Remove Effect: Character ${characterName} is not under influence of effect ${effectName}.`;
        return modifiedText;
    }
    (0, RemoveEffect)(characterName, effectName);
    state.out = `Effect ${effectName} removed from ${characterName}.
Current ${characterName} state:
${(0, CharacterToString)(character)}`;
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
        state[InfoOutput] =
            "Revive: Arguments were not given in proper format.";
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
        state[InfoOutput] = "Revive: Reviving character doesn't exist.";
        return modifiedText;
    }
    const revivingCharacter = state.characters[revivingCharacterName];
    if (revivingCharacter.hp <= value) {
        state[InfoOutput] =
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
        state[InfoOutput] = "Revive: Revived character doesn't exist.";
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
        state[InfoOutput] =
            "Attack: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Checks for format stat, character, stat, character
    const exp =
        /(?<attackingCharacter>[\w\s']+), *(?<attackStat>[\w ']+), *(?<defendingCharacter>[\w\s']+), *(?<defenseStat>[\w ']+)/i;
    const match = commandArguments.match(exp);
    //Error checking
    if (match === null || !match.groups) {
        state[InfoOutput] = "Attack: No matching arguments found.";
        return modifiedText;
    }
    //Checks if stats exist
    if (!(0, ElementInArray)(match.groups.attackStat, state.stats)) {
        state[
            InfoOutput
        ] = `Attack: Stat ${match.groups.attackStat} was not created.`;
        return modifiedText;
    }
    if (!(0, ElementInArray)(match.groups.defenseStat, state.stats)) {
        state[
            InfoOutput
        ] = `Attack: Stat ${match.groups.defenseStat} was not created.`;
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
        state[
            InfoOutput
        ] = `Attack: Character ${attackingCharacterName} does not exist.`;
        return modifiedText;
    }
    if (
        !(0, ElementInArray)(
            defendingCharacterName,
            Object.keys(state.characters)
        )
    ) {
        state[
            InfoOutput
        ] = `Attack: Character ${defendingCharacterName} does not exist.`;
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
        state[InfoOutput] =
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
        state[InfoOutput] = "Set State: Invalid JSON state.";
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
        state[InfoOutput] =
            "Set Stats: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Grabbing info
    const characterName = match.groups.character;
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state[
            InfoOutput
        ] = `Set Stats: Character ${characterName} doesn't exist.`;
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
        state[InfoOutput] =
            "Show Inventory: Command doesn't take any arguments.";
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
        state[InfoOutput] =
            "Show Stats: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Grabbing info
    const characterName = match.groups.character;
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state[
            InfoOutput
        ] = `Show Stats: Character ${characterName} doesn't exist.`;
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
        state[InfoOutput] =
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
        state[InfoOutput] = `Skillcheck: Stat ${statName} does not exist.`;
        return modifiedText;
    }
    //Shortening access path to character object
    let character = state.characters[characterName];
    if (!character) {
        state[
            InfoOutput
        ] = `Skillcheck: Character ${characterName} doesn't exist.`;
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
        state[
            InfoOutput
        ] = `Skillcheck: Testing against dead character. Punishment: -${state.punishment} (temporary).`;
        effectiveCharacterStatLevel -= state.punishment;
    }
    //console.log(char + ", " + stat + ": "+ charStat);
    //Grabs thresholds
    const thresholds = commandArguments.match(thresholdCheck);
    if (!thresholds || !thresholds.groups) {
        state[InfoOutput] = "Skillcheck: Thresholds are not in proper format.";
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
                state[InfoOutput] =
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
        state[InfoOutput] =
            "Unequip: Arguments were not given in proper format.";
        return modifiedText;
    }
    //Grabs character name
    const characterName = match.groups.character;
    //Checks if character exists
    if (!(0, ElementInArray)(characterName, Object.keys(state.characters))) {
        state[
            InfoOutput
        ] = `Unequip: Character ${characterName} doesn't exist.`;
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
    if (!character.activeEffects) character.activeEffects = [];
    let effectModifiersSum = 0;
    for (const effect of character.activeEffects) {
        if (effect.modifiers[stat] && effect.impact === "continuous")
            effectModifiersSum += effect.modifiers[stat];
    }
    let itemModifiersSum = 0;
    for (const itemName of Object.keys(character.items)) {
        const item = character.items[itemName];
        if (item.modifiers[stat]) itemModifiersSum += item.modifiers[stat];
    }
    return character.stats[stat].level + itemModifiersSum + effectModifiersSum;
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
const CustomDamageOutput = (damage, values) => {
    let i = 0;
    let out = "no damage";
    while (values[i] && damage >= values[i][0]) {
        out = values[i++][1];
    }
    return out;
};
const ApplyEffectsOnAttack = (
    attackingCharacterName,
    defendingCharacterName
) => {
    //Grabs the info
    let attackingCharacter = state.characters[attackingCharacterName];
    let defendingCharacter = state.characters[defendingCharacterName];
    //If you didn't create the characters earlier, they get all stats at starting level from state
    if (attackingCharacter === undefined) {
        state.characters[attackingCharacterName] = new Character();
        attackingCharacter = state.characters[attackingCharacterName];
    }
    if (defendingCharacter === undefined) {
        state.characters[defendingCharacterName] = new Character();
        defendingCharacter = state.characters[defendingCharacterName];
    }
    let effectsToApplyOnAttacker = [];
    let effectsToApplyOnDefender = [];
    for (const item of Object.values(attackingCharacter.items)) {
        for (const effectName of item.effects) {
            const effect = state.effects[effectName];
            if (!effect) continue;
            if (effect.appliedOn === "attack") {
                if (effect.appliedTo === "self")
                    effectsToApplyOnAttacker.push(effect);
                else if (effect.appliedTo === "enemy")
                    effectsToApplyOnDefender.push(effect);
            }
        }
    }
    for (const item of Object.values(defendingCharacter.items)) {
        for (const effectName of item.effects) {
            const effect = state.effects[effectName];
            if (!effect) continue;
            if (effect.appliedOn === "defense") {
                if (effect.appliedTo === "self")
                    effectsToApplyOnDefender.push(effect);
                else if (effect.appliedTo === "enemy")
                    effectsToApplyOnAttacker.push(effect);
            }
        }
    }
    if (!attackingCharacter.activeEffects)
        attackingCharacter.activeEffects = [];
    if (!defendingCharacter.activeEffects)
        defendingCharacter.activeEffects = [];
    let output = "";
    for (const effect of effectsToApplyOnAttacker) {
        output += (0, InstanceEffect)(attackingCharacterName, effect);
    }
    if (defendingCharacter.hp >= 0 || !defendingCharacter.isNpc)
        for (const effect of effectsToApplyOnDefender) {
            output += (0, InstanceEffect)(defendingCharacterName, effect);
        }
    return output;
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
        state[
            InfoOutput
        ] = `${debugPrefix}: Character ${attackingCharacterName} cannot attack, because they are dead.`;
        return { attackOutput: "", levelOutput: "", contextOutput: "" };
    }
    if (defendingCharacter === undefined) {
        state.characters[defendingCharacterName] = new Character();
        defendingCharacter = state.characters[defendingCharacterName];
    } else if (defendingCharacter.hp <= 0) {
        state[
            InfoOutput
        ] = `${debugPrefix}: Character ${defendingCharacterName} cannot be attacked, because they are dead.`;
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
    let effectsText = "";
    if (state.inBattle) {
        effectsText = (0, ApplyEffectsOnAttack)(
            attackingCharacterName,
            defendingCharacterName
        );
    }
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
    }${effectsText}`;
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
    }${effectsText}`;
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
        state[
            InfoOutput
        ] = `${debugPrefix}: Character ${attackingCharacterName} cannot attack, because they are dead.`;
        return { attackOutput: "", levelOutput: "", contextOutput: "" };
    }
    if (defendingCharacter === undefined) {
        state.characters[defendingCharacterName] = new Character();
        defendingCharacter = state.characters[defendingCharacterName];
    } else if (defendingCharacter.hp <= 0) {
        state[
            InfoOutput
        ] = `${debugPrefix}: Character ${defendingCharacterName} cannot be attacked, because they are dead.`;
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
InfoOutput = "out";
const CommandsAccessibleInBattle = [
    "heal",
    "revive",
    "additem",
    "alteritem",
    "gainitem",
    "showinventory",
    "altereffect",
    "createeffect",
    "applyeffect",
    "removeeffect",
    "equip",
    "unequip",
    "setstats",
    "showstats",
    "levelstats",
    "setstate",
    "getstate",
];
const RunCommand = (textCopy, globalMatch, currIndices) => {
    let modifiedText = textCopy;
    if (globalMatch.groups) {
        if (
            state.inBattle &&
            !CommandsAccessibleInBattle.includes(
                globalMatch.groups.command.toLocaleLowerCase()
            )
        ) {
            state[
                InfoOutput
            ] = `Command ${globalMatch.groups.command} is not accessible in battle.`;
            return textCopy;
        }
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
                modifiedText = !defaultDodge
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
                modifiedText = defaultDodge
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
            case "altereffect":
                modifiedText = (0, alterEffect)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "createeffect":
                modifiedText = (0, createEffect)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "applyeffect":
                modifiedText = (0, applyEffect)(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;
            case "removeeffect":
                modifiedText = (0, removeEffect)(
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
                state[InfoOutput] = "Command not found.";
                break;
        }
    }
    return modifiedText;
};
const modifier = (text) => {
    var _a, _b;
    //#region logs
    const logs = () => {
        //!Debug info, uncomment when you need
        if (DEBUG) {
            //console.log(`Og: ${textCopy}`);
            console.log(`In: ${modifiedText}`);
            console.log(`Context: ${state.ctxt}`);
            console.log(`Out: ${state.out}`);
            console.log(`Message: ${state[InfoOutput]}`);
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
    state.seenOutput = false;
    state[InfoOutput] = "";
    let modifiedText = text,
        textCopy = text;
    //#region battle handling
    if (state.inBattle) {
        const battleMatch = text.match(
            /!(?<command>[^\s()]+)\((?<arguments>.*)\)|\((?:(?<attackStat>[\w ']+), *)?(?<defendingCharacter>[\w\s']+)(?:, *(?<defenseStat>[\w ']+))?\)/i
        );
        if (battleMatch && battleMatch.groups) {
            //Command overrides turn
            if (battleMatch.groups.command) {
                const temp = text.indexOf(battleMatch[0]);
                //Creates indices, because d flag is not allowed
                const currIndices = [temp, temp + battleMatch[0].length];
                battleMatch.groups.arguments =
                    battleMatch.groups.arguments.trim();
                modifiedText = RunCommand(textCopy, battleMatch, currIndices);
            } else {
                modifiedText =
                    modifiedText.substring(0, text.indexOf(battleMatch[0])) +
                    modifiedText.substring(
                        text.indexOf(battleMatch[0]) + battleMatch.length
                    );
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
                    const side = state[state.currentSide];
                    state.active = [...side];
                }
                (0, turn)(textCopy);
            }
        }
        logs();
        return { text: modifiedText };
    }
    //#endregion battle handling
    if (state.runEffectsOutsideBattle)
        for (const characterName of Object.keys(state.characters)) {
            const character = state.characters[characterName];
            if (!character.activeEffects) character.activeEffects = [];
            for (const effect of character.activeEffects) {
                if (effect.impact === "every turn")
                    (0, RunEffect)(characterName, effect);
                if (--effect.durationLeft === 0) {
                    if (effect.impact === "on end") {
                        (0, RunEffect)(characterName, effect);
                    }
                    modifiedText += (0, RemoveEffect)(
                        characterName,
                        effect.name
                    );
                }
            }
        }
    //#region globalCommand
    //Checks for pattern !command(args)
    const globalExp = /!(?<command>[^\s()]+)\((?<arguments>.*)\)/i;
    const globalMatch = text.match(globalExp);
    //If something matched, calls functions with further work
    if (globalMatch && globalMatch.groups) {
        const temp = text.indexOf(globalMatch[0]);
        //Creates indices, because d flag is not allowed
        const currIndices = [temp, temp + globalMatch[0].length];
        globalMatch.groups.arguments = globalMatch.groups.arguments.trim();
        //Matches the command and forwards arguments to them
        modifiedText = RunCommand(textCopy, globalMatch, currIndices);
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
    state.effects = state.effects === undefined ? {} : state.effects;
    state.inventory = state.inventory === undefined ? [] : state.inventory;
    state.punishment = state.punishment === undefined ? 5 : state.punishment;
    state.skillpointsOnLevelUp =
        state.skillpointsOnLevelUp === undefined
            ? 5
            : state.skillpointsOnLevelUp;
    state.inBattle = state.inBattle === undefined ? false : state.inBattle;
    state.runEffectsOutsideBattle =
        state.runEffectsOutsideBattle === undefined
            ? false
            : state.runEffectsOutsideBattle;
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
            state[InfoOutput] = "Battle turn: active character name not found.";
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
            state[InfoOutput] =
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
            state[InfoOutput] =
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
        state[
            InfoOutput
        ] = `Battle turn: character ${defendingCharacterName} doesn't belong to the other side of the battle.`;
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
    if (defaultDodge) {
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
    const effectsText = (0, ApplyEffectsOnAttack)(
        attackingCharacterName,
        defendingCharacterName
    );
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
    }${effectsText}`;
    //Always grants 1 Exp to attacking character, for defending it's up to user
    state.out += (0, IncrementExp)(attackingCharacterName, attackStat);
    if (defendingCharacterLevels) {
        state.out += (0, IncrementExp)(defendingCharacterName, defenseStat);
    }
    if (!attackingCharacter.activeEffects)
        attackingCharacter.activeEffects = [];
    for (const effect of attackingCharacter.activeEffects) {
        if (effect.impact === "every turn") {
            (0, RunEffect)(attackingCharacterName, effect);
        }
        if (--effect.durationLeft === 0) {
            if (effect.impact === "on end") {
                (0, RunEffect)(attackingCharacterName, effect);
            }
            state.out += (0, RemoveEffect)(attackingCharacterName, effect.name);
        }
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
        state[InfoOutput] =
            "HP of all party members dropped to 0. Party retreated.";
        state.out += "\nThe adventurers retreated, overwhelmed by the enemy.";
        ExitBattle();
        return;
    } else if (
        !((_e = state.side2) === null || _e === void 0 ? void 0 : _e.length)
    ) {
        state.out += "\nThe adventurers have won the battle.";
        ExitBattle();
        state[InfoOutput] = "You have won the battle!";
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
        state[InfoOutput] = "Battle turn: ERROR active character is undefined.";
        return;
    }
    state.activeCharacterName = activeCharacterName;
    state.activeCharacter = state.characters[state.activeCharacterName];
    if (state[InfoOutput] && typeof state[InfoOutput] == "string") {
        state[InfoOutput] = state[InfoOutput].replace(
            /\nCurrent turn: \w+/,
            ""
        );
        state[InfoOutput] += `\nCurrent turn: ${state.activeCharacterName}`;
    } else state[InfoOutput] = `Current turn: ${state.activeCharacterName}`;
};
const ExitBattle = () => {
    var _a, _b, _c;
    state.inBattle = false;
    state.side1 = (_a = state.side1) !== null && _a !== void 0 ? _a : [];
    state.side2 = (_b = state.side2) !== null && _b !== void 0 ? _b : [];
    for (const characterName of state.side1.concat(state.side2)) {
        const character = state.characters[characterName];
        (_c = character.activeEffects) !== null && _c !== void 0
            ? _c
            : (character.activeEffects = []);
        for (const effect of character.activeEffects) {
            state.out += (0, RemoveEffect)(characterName, effect.name);
        }
    }
    delete state.activeCharacter, state.activeCharacterName, state.active;
    delete state.side1, state.side2;
    delete state.currentSide;
    state[InfoOutput] = "";
};

modifier(text);
