# Examples

This page includes command examples to aid in using AID Dice rolling in your adventure.


## !addCharacter
Adds a new character to the game
Character with only basic stats and no items or effects:

Command: 
```
!addCharacter(John Doe, hp=100, level=1, strenght=1, dexterity=3, constitution=1, intelligence=0, wisdom=2, charisma=0)
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
strenght: 1,
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
!addNPC(Zombie, hp=45, level=1, strenght=1, dexterity=1, constitution=1, intelligence=1, wisdom=1, charisma=0)
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
strenght: 1,
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


## !attack(attacking character, attacking stat, defending character, defending stat)
The specified character attacks the defending character

Command:
```
!attack(John Doe, dexterity, Zombie, strength)
```
