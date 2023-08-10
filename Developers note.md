# State object:

    stats: ["stat", "names"]
    dice: Number representing value range for rolling a dice on skillcheck and other commands
    startingLevel, startingHP, skillpointsOnLevelUp: Numbers (integers)
    characters: {
        "name": Character object
        ...
    }
    punishment: Number (integer)
    items: {
        "name": Item object
        ...
    }
    inventory: ["item", "names"]
    ctxt, out, message: "strings"
    inBattle: bool
    side1, side2: ["characters", "participating", "in", "battle"]
    active: ["characters", "that", "haven't", "made", "their", "move", "this", "turn"]

# Character and NPC objects:

    "stat": Stat object
    "hp", "level", "experience", "expToNextLvl", "skillpoints": Numbers (integers)
    "items": {
        "item slot": Item object
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

<br><br>

# Explanations

## State

### Stats

`"stats": ["stat", "names"]`<br>
Holds stats player can use. New on new characters are automatically added.<br>
New characters are created with all of them.<br>
Example: `["dexterity", "strength", "nanobots"]`<br><br>

### Dice

`"dice": number`<br>
Used when script is rolling an n-sided dice with 1-n values<br><br>

### Starting level

`"startingLevel": number`<br>
It's the default when player is adding a character with some stats not specified, it uses this value.<br><br>

### Starting HP

`"startingHP": number`<br>
Default hp of a newly created character.<br><br>

### Skillpoints On Level Up

`"skillpointsOnLevelUp": number`<br>
When not leveling to oblivion, characters get this many skillpoints when they level up.<br><br>

### Punishment

`"punishment": number`<br>
Defines the punishment when dead character is skillchecked.<br><br>

### Characters

`"characters": {characters}`<br>
Holds character objects.<br><br>

Be wary that AI Dungeon's JSON format doesn't allow trailing commas or newline characters.<br>
When setting up a character this way, check if all of their stats are in the "stats" array.<br>
All characters need an "hp" value set or the code will start throwing errors at every<br>
attack, heal, and revive command.<br>
When not levelling to oblivion, skillcheck, attack, and levelStats commands will do the same if level, experience, expToNextLvl or skillpoints are not specified on the character.<br>
Levelling to oblivion needs experience and expToNextLvl specified on the stats.

### Items

"items": {items}<br>
Holds item objects.

### Inventory

`"inventory": ["item", "names"]`<br>
Keeps names of items currently in groups' inventory. Items worn by its members are not counted in.<br><br>

### In Battle

`"inBattle": bool`<br>
Determines whether player's party is in battle, restricting actions to attack and escape. Make sure to not overwrite it by excluding from `!setState` state argument.<br><br>

### Side1, Side2

`"side1", "side2": ["characters", "participating", "in", "battle"]`<br>
Holds `!battle` participants' names for randomizing and keeping track of turn order.<br><br>

### Active

`"active": ["characters", "that", "haven't", "made", "their", "move", "this", "turn"]`<br>
Keeps track of characters that didn't attack yet in their turn order. When empty, switches to a copy of the other side's characters. When last character of side1 makes its move, side2's turn starts and vice-versa.<br><br>

### Out

`"out": "some text"`<br>
overwrites output, leave as empty string to not do it<br><br>

### Ctxt

`"ctxt": "some text"`<br>
overwrites what AI sees as your input, leave as empty string to not do it<br><br>

### Memory

`"memory": "player's memory"`<br>
[More information.](https://github.com/latitudegames/Scripting#memory)<br><br>

## Character

### Stats

`"{stat}": Stat object`<br>
Holds character's stat of name `{stat}`.<br><br>

### HP

`"hp": number`<br>
Holds character's current health points, no coded upper cap.<br><br>

### Level

`"level": number`<br>
Character's level, used when not leveling to oblivion to calculate `expToLevelUp`.<br><br>

### Experience

`"experience": number`<br>
Holds character's current experience, used when not leveling to oblivion.<br><br>

### Exp To Next Level

`"expToNextLevel": number`<br>
Determines minimal `experience` for the next level up, used when not leveling to oblivion.<br><br>

### Skillpoints

`"skillpoints": number`<br>
Holds character's free skillpoints player can distribute, used when not leveling to oblivion.<br><br>

### Items

`"items": {"slot": Item}`<br>
Holds items the character has equipped in their slots.<br><br>

### Is NPC

`"isNPC": bool`<br>
The difference between character and NPC is [here](/README.md#addnpc).<br><br>

### Type

`"type": "character"`<br>
Held for usage of external tools. Do not change, unless you are developing said tools.<br><br>

## Stat

### Level

`"level": number`<br>
Stat's level, used for skillchecks and calculating `expToLevelUp`.<br><br>

### Experience

`"experience": number`<br>
Holds stat's current experience, used when leveling to oblivion.<br><br>

### Exp To Next Level

`"expToNextLevel": number`<br>
Determines minimal `experience` for the next level up, used when leveling to oblivion.<br><br>

### Type

`"type": "stat"`<br>
Held for usage of external tools. Do not change, unless you are developing said tools.<br><br>

## Item

### Name

`"name": string`<br>
Holds item's name.<br><br>

### Slot

`"slot": string`<br>
Holds slot name on which item can be equipped.<br><br>

### Effects

`"effects": ["effect", "names"]`
Currently unused, will hold effect names item will apply when worn or used.<br><br>

### Modifiers

`"modifiers":{"{stat}": number}`<br>
Holds modifiers added to skillchecks of item's wearer when they are trying against `{stat}`.<br><br>

### Type

`"type": "item"`<br>
Held for usage of external tools. Do not change, unless you are developing said tools.<br><br>

## Examples of commands

[//]: # "To be expanded"

> !setState({"memory":""})<br>

will clear player's memory<br>

> !setState({"dice":15})<br>

will leave it as is.<br>

### Generally it's best to write desired state in external program and then remove all newline characters. This may not be needed in the future, but is now
