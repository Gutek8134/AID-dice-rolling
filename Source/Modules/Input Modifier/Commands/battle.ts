import { Character } from "../../Shared Library/Character";
import { Effect, InstanceEffect } from "../../Shared Library/Effect";
import { ElementInArray, diceRoll } from "../../Shared Library/Utils";
import { state } from "../../proxy_state";
import { InfoOutput } from "../modifier";
import { turn } from "../turn";

const battle = (commandArguments: string, modifiedText: string): string => {
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
    const exp: RegExp =
        /\((?<group1>[\w\s']+(?:, *[\w\s']+)*)\), *\((?<group2>[\w\s']+(?:, *[\w\s']+)*)\)/i;
    const match: RegExpMatchArray | null = modifiedText.match(exp);

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
    const side1CharactersNames: string[] = Array.from(
        new Set<string>(
            match.groups.group1
                .trim()
                .split(",")
                .map((el) => el.trim())
        )
    );

    const side2CharactersNames: string[] = Array.from(
        new Set<string>(
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
        if (ElementInArray(characterName, Object.keys(state.characters))) {
            if (state.characters[characterName].hp <= 0) {
                state[
                    InfoOutput
                ] = `Battle: Character ${characterName} is dead and cannot participate in battle.`;
                return modifiedText;
            }
            if (ElementInArray(characterName, side2CharactersNames)) {
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
        if (!ElementInArray(characterName, Object.keys(state.characters))) {
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
        const character: Character = state.characters[characterName];
        for (const item of Object.values(character.items)) {
            for (const effectName of item.effects) {
                const effect: Effect = state.effects[effectName];
                if (effect.appliedOn === "battle start")
                    if (effect.appliedTo === "self")
                        state.out += InstanceEffect(characterName, effect);
                    else if (effect.appliedTo === "enemy")
                        state.out += InstanceEffect(
                            side2CharactersNames[
                                diceRoll(side2CharactersNames.length) - 1
                            ],
                            effect
                        );
            }
        }
    }

    for (const characterName of side2CharactersNames) {
        const character: Character = state.characters[characterName];
        for (const item of Object.values(character.items)) {
            for (const effectName of item.effects) {
                const effect: Effect = state.effects[effectName];
                if (effect.appliedOn === "battle start")
                    if (effect.appliedTo === "self")
                        state.out += InstanceEffect(characterName, effect);
                    else if (effect.appliedTo === "enemy")
                        state.out += InstanceEffect(
                            side1CharactersNames[
                                diceRoll(side1CharactersNames.length) - 1
                            ],
                            effect
                        );
            }
        }
    }

    //Setting up values for automatic turns
    state.side1 = side1CharactersNames;
    state.side2 = side2CharactersNames;
    state.currentSide = `side${diceRoll(2)}`;
    state.active = [...state[state.currentSide]];
    state.inBattle = true;

    const nextActiveCharacterIndex = diceRoll(state.active.length) - 1;
    state.activeCharacterName = state.active[nextActiveCharacterIndex];
    state.activeCharacter = state.characters[state.activeCharacterName];
    state[InfoOutput] += `\nCurrent turn: ${state.activeCharacterName}`;

    if (state.activeCharacter.isNpc) turn("");
    return modifiedText;
};

export default battle;
