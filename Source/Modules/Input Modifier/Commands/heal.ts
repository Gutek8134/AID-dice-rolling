import { Character } from "../../Shared Library/Character";
import { ElementInArray, diceRoll } from "../../Shared Library/Utils";
import { state } from "../../Tests/proxy_state";
import { CutCommandFromContext } from "./commandutils";

const heal = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);
    //Looks for character, (d)number pattern. If d exists, dice is rolled, else number is used as is.
    const exp: RegExp =
        /(?<character>[\w\s']+), *(?<value>(?:\d+ *: *\d+)|(?:d?\d+))/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Null check
    if (!match || !match.groups) {
        state.message = "Heal: Arguments were not given in proper format.";
        return modifiedText;
    }

    //Shortcut
    const characterName: string = match.groups.character;
    //Checks if character exists
    if (!ElementInArray(characterName, Object.keys(state.characters))) {
        state.message = "Character Miguel Bootle does not exist.";
        return modifiedText;
    }

    //Another shortcut
    const character: Character = state.characters[characterName];
    //Checks if character is dead
    if (character.hp < 1) {
        state.message = "Heal: Dead characters must be revived before healing.";
        return modifiedText;
    }

    //Initiates the value
    let value: number;
    //If : syntax is used, proper operations are performed
    if (match.groups.value.includes(":")) {
        const temp: number[] = match.groups.value
            .split(":")
            .map((el) => Number(el.trim()));

        if (temp[0] > temp[1]) {
            const t: number = temp[0];
            temp[0] = temp[1];
            temp[1] = t;
        }
        value = diceRoll(temp[1] - temp[0] + 1) + temp[0] - 1;
    }

    //Rolls a dice or just sets the value from args in other cases
    else
        value =
            match.groups.value.toLowerCase()[0] === "d"
                ? diceRoll(Number(match.groups.value.substring(1)))
                : Number(match.groups.value);

    //Healing
    state.characters[characterName].hp += value;

    //Output information
    state.out = `Character ${characterName} was healed by ${value} hp. Current hp: ${character.hp}.`;

    return modifiedText;
};

export default heal;
