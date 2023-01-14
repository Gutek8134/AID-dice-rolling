# State object:

    stats: ["stat", "names"]
    dice: Number representing value range for rolling a dice on skillcheck and other commands
    startingLevel, startingHP, skillpointsOnLevelUp: Numbers (integers)
    characters: {
        "name": Character object
        ...
    }
    punishment: Number (integer) - stat punishment when skillcheck is performed by "dead" character
    items: {
        "name": Item object
        ...
    } - holds EXISTING items
    inventory: ["item", "names"]
    ctxt, out, message - see AID docs for information about context modifier, output modifier and message property
    inBattle: bool
    side1, side2: ["characters", "participating", "in", "battle"]
    active: ["characters", "that", "haven't", "made", "their", "move", "this", "turn"]

# Character and NPC objects:

    "stat": Stat object
    "hp", "level", "experience", "expToNextLvl", "skillpoints": Numbers (integers)
    "items": {
        "name": Item object
        ...
    }
    "type": "character"
    "isNpc": bool

## String Character representation

    "
    hp: ...
    [
    level: ...
    skillpoints: ...
    experience: ... (needed to lvl up: ...)
    ]
    isNpc: ...
    stat: [lvl=, exp= (toLvlUp=) | lvl]
    ...
    item slot: item representation
    ...
    "

# Stat object:

    "level", "experience", "expToNextLvl": Numbers (integers)
    "type": "stat"

# Item object:

    "name", "slot": strings
    "effects": ["effect", "names"]
    "modifiers":{
        "stat": Number (integer)
    }
    "type": "item"

## String Item representation

    "
    slot: ...
    modifier: ...
    ...
    "
