## Description

This project gives you tools to play AI Dungeon like an RPG loosely based on Dungeons&Dragons.<br>
[Installation Guide](https://github.com/Gutek8134/AID-dice-rolling#installation).

# COMMANDS

Since commands are deleted from AI's view (called "context") you need to add any character (preferably space) for it to make custom outputs.<br>
(Please avoid using more than one command per input, as the script will become unpredictable.)

## !addCharacter

Syntax: `!addCharacter(name, stat = value, stat2=value, stat3 = value, ..., statN=value)`

Creates a character with given stats.
There can be additional whitespace around "=" sign, but nowhere else.

If another character already has or had a stat not mentioned here, it is set to starting value.

## !setStats

Syntax: `!setStats(character, stat = value, stat2=value, stat3 = value, ..., statN=value)`

Sets an already created character's stats.
There can be additional whitespace around "=" sign, but nowhere else.

## !showStats

Syntax: `!showStats(character)`

Shows stats of a specified character.
Works only on created characters.

## !skillcheck

Syntax: `!skillcheck(stat, name, thresholds)`

### Thresholds syntax:

    a) number - outcome - success or failure
    b) number : number - outcome - success, nothing happens, failure
    c) number : number : number - outcome - critical success, success, failure, critical failure
    d) number : number : number : number - outcome - critical success, success, nothing happens, failure, critical failure
    e) number = outcome1 : number = outcome2 : number = outcome3 : ... : number = outcomeN - custom outcomes. If score is lower than the lowest threshold, nothing happens.

Stat must be an already created one. Stats are automatically created when they are set on any character. If you create a character with a new stat, others don't have it automatically set. When stat is not set, it is assumed its value is 0.

## !getState

Syntax: `!getState()`
Outputs current state.
You can use this alongside with setState as saves, but currently there is no way to do it differently than by manually copying it to a file on non-volatile storage, like your hard drive, and then setting it back. This also allows for making your custom state to use in all adventures.

## !setState

Syntax: `!setState(state as json)`

Sets state to the json if it has proper format.

Outputs only error messages.

WARNING: do not change the values you get from `!getState()` unless you know what you're doing!<br>
Guide to creating custom states is below.

Note: all commands are case-insensitive and matched by regular expressions along with their values. This means an improperly written command will not be executed but rather sent to AI.

---

# Custom states

Blank template (AKA default starting state):<br>

> {\
> "stats": [],\
>  "dice": 20,\
>  "startingLevel": 1,\
>  "characters": {}<br>
> }

"stats": [stats you want to use as strings and separated by a comma]<br>
Example: ["dexterity", "strength", "nanobots"]<br><br>
"dice": number of dice sides<br>
Used when script is rolling an n-sided dice with 1-n values<br><br>
"startingLevel": starting level for the characters<br>
It's the default starting value used when you're adding a character with some stats not specified.<br><br>
"characters": {characters}
Holds characters' objects.<br><br>
Character object syntax:

> "Name": {<br>
>
> > "stat1": {<br>
> > "level": number<br>
> > },<br>
>
> > "stat2": {<br>
> > "level": number<br>
> > }<br>
>
> }

Be wary that AI Dungeon's JSON format doesn't allow trailing commas or newline characters.<br>
When setting up a character this way, check if all of their stats are in the "stats" array.

Example:<br>

> {"characters": {<br>
>
> > "Miguel":<br>
> > {<br>
> > "dexterity": {"level": 3},<br>
> > "strength": {"level": 1}<br>
> > },<br>
>
> > "Zuibroldun Jodem":<br>
> > {<br>
> > "dexterity": {"level": 5},<br>
> > "demonic powers": {"level": 100},<br>
> > "fire force": {"level": 7}<br>
> > }<br>
>
> }}

Note: default parser doesn't allow newline characters<br><br>
Formatted example (you can test it yourself):<br>

> !setState({"characters": {"Miguel":{"dexterity": {"level": 3},"strength": {"level": 1}},"Zuibroldun Jodem":{"dexterity": {"level": 5},"demonic powers": {"level": 100},"fire force": {"level": 7}}}})

<br>Other values of state:<br>
"out": overwrites output, leave as empty string to not do it<br>
"ctxt": overwrites what AI sees as your input, leave as empty string to not do it<br>
"memory": your memory; setState will not change it unless you mention this parameter<br><br>
For example<br>

> !setState({"memory":""})<br>

will clear your memory, while<br>

> !setState({"dice":15})<br>

will leave it as is.<br>

### Generally it's best to write desired state in external program and then remove all newline characters. This may not be needed in the future, but is now.

---

# Installation

1. Create a scenario.
2. Get into Scripts menu.
3. Copy files contents to corresponding fragments: sharedLibrary.js to Shared Library, inputModifier to Input Modifier and so on.
4. Play the created scenario. You should now be able to use the commands.
