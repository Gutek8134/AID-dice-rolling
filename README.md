## Description

This project gives you tools to play AI Dungeon like an RPG loosely based on Dungeons&Dragons.<br>
[Installation Guide](#installation).

# COMMANDS

Issue with AI not printing custom outputs have been resolved as you have voted in the questionnaire:<br>
I've made sure that the least AI sees is a space and newline (enter) character, which forces it to generate output.<br>
The script will utilize only the first command in the input.

## !addCharacter

Syntax: `!addCharacter(name, stat = value, stat2=value, stat3 = value, ..., statN=value)`

Creates a character with given stats.
There can be additional whitespace around "=" sign, but nowhere else.

You can specify hp and level the same way.

Allowed characters for the characters' names are: all latin characters, numbers,<br>
whitespace characters and ' (apostrophe).

If another character already has or had a stat not mentioned here, it is set to starting value.

## !addNPC

Syntax: `!addNPC(name, stat = value, stat2=value, stat3 = value, ..., statN=value)`

Creates an NPC with given stats.

Works the same way !addCharacter does, but:

-   NPCs die when they are killed (AKA they are deleted)
-   NPCs don't level
-   NPCs attack automatically in battles, targeting a random enemy

## !setStats

Syntax: `!setStats(character, stat = value, stat2=value, stat3 = value, ..., statN=value)`

Sets an already created character's stats.<br>
Please avoid changing things like HP and level here.<br>
There can be additional whitespace around "=" sign, but nowhere else.

Outputs stat changes.

## !showStats

Syntax: `!showStats(character)`

Shows stats of a specified character.
Works only on created characters.

## !levelStats

Syntax: `!levelStats(character, stat + value, stat2+value, stat3 +value, ..., statN+value)`

Uses acquired skillpoints to increase stats.<br>
Works only when not levelling to oblivion.

## !skillcheck

Syntax: `!skillcheck(stat, name, thresholds)`

### Thresholds syntax:

    a) number - outcome - success or failure
    b) number : number - outcome - success, nothing happens, failure
    c) number : number : number - outcome - critical success, success, failure, critical failure
    d) number : number : number : number - outcome - critical success, success, nothing happens, failure, critical failure
    e) number = outcome1 : number = outcome2 : number = outcome3 : ... : number = outcomeN - custom outcomes. If score is lower than the lowest threshold, nothing happens.

Stat must be an already created one. Stats are automatically created when they are set on any character. If you create a character with a new stat, others don't have it automatically set. When stat is not set, it is assumed its value is 0.

If you use skillcheck on a dead character, they are tested as if all of their stats were <br>5 levels lower (adjustable by `!setstate`).<br>
Can be also turned off in the code.

## !attack

Syntax: `!attack(attacking character, attacking stat, defending character, defending stat)`

While characters will be created with default stats, used stats need to be created BEFORE calling this command.<br>
You can view and edit damage calculation at the top of input modifier. Additional info is provided there.<br>
Default calculation: attacker's stat + score of rolling a 20-sided dice - defender's stat.

Instead of outputting something, it changes the input the way skillcheck does.

## !sattack

Syntax: `!sattack(attacking character, attacking stat, defending character, defending stat, dodging stat)`

Main difference between this command and `!attack` is that before dealing damage script checks if the defending character dodged the damage.<br>
Default dodge: both characters roll a 5-sided dice and att their stats (attacking and dodging). Defending character dodged if their score is greater than the attacker's.<br>

While characters will be created with default stats, used stats need to be created BEFORE calling this command.<br>
You can view and edit damage calculation at the top of input modifier. Additional info is provided there.<br>
Default calculation: attacking stat + score of rolling a 20-sided dice - defending stat.

Instead of outputting something, it changes the input the way skillcheck does.

## !battle

Syntax: `!battle((character1, character2, ...), (character8, character9, ...))`

Starts a battle between characters in the first and second bracket pair.

Battle automatically sets which side and character attacks at the moment, and makes the NPCs attack their enemies.

During battle you can only:

-   retreat by writing escape, retreat or exit anywhere in the input
-   attack a character from the other side of the battle with `(character)` or `(attacking stat, character, defending stat)`; if you are dodging by default, attacked character will try to dodge with defending stat used as dodging stat

## !heal

Syntax: `!heal(character, <d>value)`

Character must be created and not dead (its hp must be more than 0).

Healing value can be preceded by "d" to roll an n-sided dice.

Outputs healing value and resulting hp.

Examples:<br>
`!heal(Zuibroldun Jodem, 100)` - will heal Zuibroldun Jodem by 100 hp (unless they do not exist or are dead)<br>
`!heal(Zuibroldun Jodem, d100)` - will heal Zuibroldun Jodem by 1 to 100 hp<br>
`!heal(Zuibroldun Jodem, 50:100)` - wil heal Zuibroldun by 50 to 100 hp

## !revive

Syntax: `!revive(reviving character, revived character, value)`

Transfers value of hp from reviving to revived character.<br>
It works both as reviving and transfusion tool.<br>

Outputs both characters' resulting hp.

Reviving character must exist and have at least value+1 hp to perform this action.<br>
Revived character must exist.

## !getState

Syntax: `!getState()`
Outputs current state.
You can use this alongside with setState as saves, but currently there is no way to do it differently than by manually copying it to a file on non-volatile storage, like your hard drive, and then setting it back. This also allows for making your custom state to use in all adventures.

## !setState

Syntax: `!setState(state as json)`

Sets state to the json if it has proper format.

Outputs only error messages.

WARNING: do not change the values you get from `!getState` unless you know what you're doing!<br>
Guide to creating custom states is below.

Note: all commands are case-insensitive.<br>
Thanks to refactor the newest version will throw errors and cut commands from what the AI sees even when something goes wrong.

---

# Levels and leveling

You can change how much xp is needed to level up in shared library script.<br>
You can change whether you want to level your stats<br>
or characters and distribute skillpoints with `!levelStats`(default) in input modifier script.<br>
You can only do it before creating the first character.

The amount of skillpoints granted for level up can be adjusted by `!setstate`.

---

# Custom states

`!setstate` doesn't change the values unless they are mentioned.

Blank template (AKA default starting state):<br>

> {<br>
> "stats": [],<br>
> "dice": 20,<br>
> "startingLevel": 1,<br>
> "startingHP": 100,<br>
> "characters": {},<br>
> "punishment": 5,<br>
> "skillpointsOnLevelUp": 5<br>
> }

"stats": [stats you want to use as strings and separated by a comma]<br>
Example: ["dexterity", "strength", "nanobots"]<br><br>
"dice": number of dice sides<br>
Used when script is rolling an n-sided dice with 1-n values<br><br>
"startingLevel": starting level for the characters<br>
It's the default starting value used when you're adding a character with some stats not specified.<br><br>
"punishment": number<br>
Defines the punishment when dead character is skillchecked.<br><br>
"characters": {characters}
Holds characters' objects.<br><br>
Character object syntax:

> "Name": {<br>
>
> "hp": number,<br>
> "level": number,<br>
> "experience": number,<br>
> "expToNextLvl": number,<br>
> "skillpoints": number,<br>
>
> > "stat1": {<br>
> > "level": number,<br>
> > "experience": number,<br>
> > "expToNextLvl": number<br>
> > },<br>
>
> > "stat2": {<br>
> > "level": number,<br>
> > "experience": number,<br>
> > "expToNextLvl": number<br>
> > }<br>
>
> }

Be wary that AI Dungeon's JSON format doesn't allow trailing commas or newline characters.<br>
When setting up a character this way, check if all of their stats are in the "stats" array.<br>
All characters need an "hp" value set or the code will start throwing errors at every<br>
attack, heal, and revive command.<br>
When not levelling to oblivion, skillcheck, attack, and levelStats commands will do the same if level, experience, expToNextLvl or skillpoints are not specified on the character.<br>
Levelling to oblivion needs experience and expToNextLvl specified on the stats.

Example (when not levelling to oblivion):<br>

> {"characters": {<br>
>
> > "Miguel":<br>
> > {<br>
> > "hp": 100,<br>,
> > "level": 3,<br>
> > "experience": 3,<br>
> > "expToNextLvl": 6,<br>
> > "skillpoints": 0,<br>
> > "dexterity": {"level": 3},<br>
> > "strength": {"level": 1}<br>
> > },<br>
>
> > "Zuibroldun Jodem":<br>
> > {<br>
> > "hp": 1000,<br>
> > "level": 2,<br>
> > "experience": 1,<br>
> > "expToNextLvl": 4,<br>
> > "skillpoints": 8,<br>
> > "dexterity": {"level": 5},<br>
> > "demonic powers": {"level": 100},<br>
> > "fire force": {"level": 7}<br>
> > }<br>
>
> }}

Note: default parser doesn't allow newline characters<br><br>
Formatted example (you can test it yourself):<br>

> !setState({"characters": {"Miguel":{"hp": 100,"level": 3,"experience": 3,"expToNextLvl": 6,"skillpoints": 0,"dexterity": {"level": 3},"strength": {"level": 1}},"Zuibroldun Jodem":{"hp": 1000,"level": 2,"experience": 1,"expToNextLvl": 4,"skillpoints": 8,"dexterity": {"level": 5},"demonic powers": {"level": 100},"fire force": {"level": 7}}}})

<br>Other values of state:<br>
"out": overwrites output, leave as empty string to not do it<br>
"ctxt": overwrites what AI sees as your input, leave as empty string to not do it<br>
"memory": your memory<br><br>
For example<br>

> !setState({"memory":""})<br>

will clear your memory, while<br>

> !setState({"dice":15})<br>

will leave it as is.<br>

### Generally it's best to write desired state in external program and then remove all newline characters. This may not be needed in the future, but is now.

---

# Feature roadmap

![Roadmap](images/roadmap.png "Roadmap")

You can vote on what do you want me to do next [here](https://forms.gle/SqfzW5hZjzNZDVH37)

---

# Installation

[Video tutorial](https://youtu.be/rwzCD6qZLi4)

1. Create a scenario.
2. Get into Scripts menu. (You need to use browser for this.)
3. Copy files contents to corresponding fragments: sharedLibrary.js to Shared Library, inputModifier.js to Input Modifier and so on.
4. Adjust the in-script settings. They are: damage function, damageOutputs, ignoreZeroDiv, shouldPunish, levellingToOblivion, defendingCharacterLevels in Input Modifier and experienceCalculation function in Shared Library.
5. Play the created scenario. You should now be able to use the commands.
