# COMMANDS

## addCharacter

Syntax: !addCharacter(name, stat = value, stat2=value, stat3 = value, ..., statN=value)

Creates a character with given stats.
There can be additional whitespace around "=" sign, but nowhere else.

If another character already has or had a stat not mentioned here, it is set to starting value.

## setStats

Syntax: !addCharacter(name, stat = value, stat2=value, stat3 = value, ..., statN=value)

Sets an already created character's stats.
There can be additional whitespace around "=" sign, but nowhere else.

## showStats

Syntax: !showStats(name)

Shows stats of a specified character.
Works only on created characters.

## skillcheck

Syntax: !skillcheck(stat, name, thresholds)

### Thresholds syntax:

    a) number - outcome - success or failure
    b) number : number - outcome - success, nothing happens, failure
    c) number : number : number - outcome - critical success, success, failure, critical failure
    d) number : number : number : number - outcome - critical success, success, nothing happens, failure, critical failure
    e) number = outcome1 : number = outcome2 : number = outcome3 : ... : number = outcomeN - custom outcomes. If score is lower than the lowest threshold, nothing happens.

Stat must be an already created one. Stats are automatically set when they are set on any character.

## getState:

Syntax: !getState()
Outputs current state.

## setState

Syntax: !setState(state as json)

Sets state to the json if it has proper format.

Outputs only error messages.

WARNING: do not change the values you get from !getState() unless you know what you're doing!
I plan on writing a documentation on creating custom states.

Note: all commands are case-insensitive and matched by regular expressions along with their values. This means an improperly written command will not be executed but rather sent to AI.

---

# Installation

1. Create a scenario
2. Get into Scripts menu
3. Copy files contents to corresponding fragments: sharedLibrary.js to Shared Library, inputModifier to Input Modifier and so on.
4. Play the created scenario. You should now be able to use the commands.
