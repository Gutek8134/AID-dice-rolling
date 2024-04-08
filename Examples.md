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
