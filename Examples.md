# Examples

This page includes command examples to aid in using AID Dice rolling in your adventure.


## !addCharacter
Adds a new character to the game
Character with only basic stats and no items or effects:

Command: 
```
!addCharacter(John Doe, hp=100, level=1, strength=1, dexterity=3, constitution=1, intelligence=0, wisdom=2, charisma=0)
```

Output:
```
Character John Doe has been created with stats
hp: 100,
level: 1,
skillpoints: 0,
experience: 0,
to level up: 2(need 2 more),
isNPC: false,
strength: 1,
dexterity: 3,
constitution: 1,
intelligence: 0,
wisdom: 2,
charisma: 0,

Items:
none

Applied effects:
none.
```

## !addNPC
Creates an NPC with given stats.

Command:

```
!addNPC(Zombie, hp=45, level=1, strength=1, dexterity=1, constitution=1, intelligence=1, wisdom=1, charisma=0)
```

Output:
```
Non-Playable Character Zombie has been created with stats
hp: 45,
level: 1,
skillpoints: 0,
experience: 0,
to level up: 2(need 2 more),
isNPC: true,
strength: 1,
dexterity: 1,
constitution: 1,
intelligence: 1,
wisdom: 1,
charisma: 0,

Items:
none

Applied effects:
none.
```


## !addItem
Creates an item with given modifiers.

Command:

```
!addItem(Pistol, primary, dexterity=1)
```

Output:
```
Item Pistol created with attributes:
Pistol:
slot: primary
dexterity: 1
Effects:
none.
```

## !gainItem
Puts a previously created item in inventory,

Command:

```
!gainItem(Pistol[, John Doe])
```

Output:

```
Item Pistol was put into inventory.
```

## !equip
Character equips items from inventory.


Command:

```
!equip(John Doe, Pistol)
```

Output:

```
Character John Doe equipped Pistol.
Item successfully equipped.
```


## !battle
Starts a battle between characters in the first and second bracket pair.

Command:
```
!battle((John Doe), (Zombie))
```

Output:
```
A battle has emerged between two groups!John Doe
```

During a battle, you attack a target character from the opposite team (i.e. an enemy) in the following way:

Example battle turn (the target enemy should be inside the brackets):
```
John Doe attacks the (Zombie) with his Pistol
```

Output:
```
John Doe (dexterity: 4 (base: 3)) attacked Zombie (wisdom: 1) dealing medium damage (22).
Zombie now has 18 hp.
John Doe has levelled up to level 2 (free skillpoints: 5)! zombie
Zombie (wisdom: 1) attacked John Doe (dexterity: 4 (base: 3)) dealing light damage (9).
John Doe now has 75 hp.
Current turn: John Doe
```

When the enemy has no HP left and it's the last enemy, you see the following output:
```
John Doe (dexterity: 4 (base: 3)) attacked Zombie (wisdom: 1) dealing medium damage (20).
Zombie has died.
John Doe has levelled up to level 2 (free skillpoints: 5)!
The adventurers have won the battle.
You have won the battle!
```


## !attack(attacking character, attacking stat, defending character, defending stat)
The specified character attacks the defending character

Command:
```
!attack(John Doe, dexterity, Zombie, strength)
```


## !showInventory()
Shows inventory's contents.

Command:
```
!showInventory()
```

Output:
```
Currently your inventory holds: Flashlight.
```

## !getState()
Outputs current state. 

Command:
```
!getState()
```

Output:
```

----------

{"in":" !addNPC(Zombie, hp=25, level=1, strength=1, dexterity=1, constitution=1, intelligence=1, wisdom=1, charisma=0)","out":"","ctxt":" ","dice":20,"items":{"Pistol":{"name":"Pistol","slot":"primary","type":"item","effects":[],"modifiers":{"dexterity":1}},"Flashlight":{"name":"Flashlight","slot":"secondary","type":"item","effects":[],"modifiers":{"dexterity":1}}},"stats":["strength","dexterity","constitution","intelligence","wisdom","charisma"],"memory":{"context":"Current goal: Reach a rumored safe zone"},"effects":{},"inBattle":false,"inventory":["Flashlight"],"characters":{"Zombie":{"hp":25,"type":"character","isNpc":true,"items":{},"level":1,"stats":{"wisdom":{"type":"stat","level":1},"charisma":{"type":"stat","level":0},"strength":{"type":"stat","level":1},"dexterity":{"type":"stat","level":1},"constitution":{"type":"stat","level":1},"intelligence":{"type":"stat","level":1}},"experience":0,"skillpoints":0,"expToNextLvl":2,"activeEffects":[]},"John Doe":{"hp":100,"type":"character","isNpc":false,"items":{"primary":{"name":"Pistol","slot":"primary","type":"item","effects":[],"modifiers":{"dexterity":1}}},"level":1,"stats":{"wisdom":{"type":"stat","level":2},"charisma":{"type":"stat","level":0},"strength":{"type":"stat","level":1},"dexterity":{"type":"stat","level":3},"constitution":{"type":"stat","level":1},"intelligence":{"type":"stat","level":0}},"experience":0,"skillpoints":0,"expToNextLvl":2,"activeEffects":[]}},"punishment":5,"seenOutput":false,"startingHP":100,"startingLevel":1,"skillpointsOnLevelUp":5,"runEffectsOutsideBattle":false}

----------

```
