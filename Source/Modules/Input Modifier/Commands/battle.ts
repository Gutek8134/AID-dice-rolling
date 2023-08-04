import { ElementInArray, diceRoll } from "../../Shared Library/Utils";
import { state } from "../../Tests/proxy_state";
import { turn } from "../turn";

const battle = (commandArguments: string, modifiedText: string): string => {
    //Error checking
    if (
        commandArguments === undefined ||
        commandArguments === null ||
        commandArguments === ""
    ) {
        state.message = "Battle: No arguments found.";
        return modifiedText;
    }

    //Looks for pattern (character1, character2, ...), (character3, character4, ...)
    const exp: RegExp =
        /\((?<group1>[\w\s']+(?:, *[\w\s']+)*)\), *\((?<group2>[\w\s']+(?:, *[\w\s']+)*)\)/i;
    const match: RegExpMatchArray | null = modifiedText.match(exp);

    //Error checking
    if (match === null || !match.groups) {
        state.message = "Battle: Arguments were not given in proper format.";
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
                state.message = `Battle: Character ${characterName} is dead and cannot participate in battle.`;
                return modifiedText;
            }
            if (ElementInArray(characterName, side2CharactersNames)) {
                state.message = `Battle: Character ${characterName} cannot belong to both sides of the battle.`;
                return modifiedText;
            }
        } else {
            //console.log(`${el}\n\n${state.characters}`);
            state.message = `Battle: Character ${characterName} doesn't exist.`;
            return modifiedText;
        }
    }
    for (const characterName of side2CharactersNames) {
        if (!ElementInArray(characterName, Object.keys(state.characters))) {
            state.message = `Battle: Character ${characterName} doesn't exist.`;
            return modifiedText;
        } else if (state.characters[characterName].hp <= 0) {
            state.message = `Battle: Character ${characterName} is dead and cannot participate in battle.`;
            return modifiedText;
        }
    }

    //Setting up values for automatic turns
    state.side1 = side1CharactersNames;
    state.side2 = side2CharactersNames;
    state.currentSide = `side${diceRoll(2)}`;
    state.active = [...state[state.currentSide]];
    state.inBattle = true;
    state.out = "A battle has emerged between two groups!";
    turn(modifiedText);

    return modifiedText;
};

export default battle;
