import { Character } from "../Shared Library/Character";
import { damage, dodge } from "../Shared Library/Utils";
import { state } from "../Tests/proxy_state";
import { GetStatWithMods, IncrementExp } from "./characterutils";
import {
    damageOutputs,
    defendingCharacterLevels,
    ignoreZeroDiv,
} from "./constants";

export const CustomDamageOutput = (
    damage: number,
    values: Array<[number, string]>
) => {
    let i = 0;
    let out = "no damage";

    while (damage >= values[i][0] && values[i]) {
        out = values[i++][1];
    }

    return out;
};
/**
 * state.ctxt is NOT modified by this function
 *
 * @param attackStatName Name of stat used to attack
 * @param defenseStatName Name of stat used to defend
 * @param outputTargetByRef String variable used for output. May be state.out or modifiedText
 * @param debugPrefix Prefix added to debug messages, preferably command name
 * @returns Object containing attackOutput "a attacked b" and levelOutput "a levelled up"
 */
export const DealDamage = (
    attackingCharacterName: string,
    attackStatName: string,
    defendingCharacterName: string,
    defenseStatName: string,
    debugPrefix: string
): { attackOutput: string; levelOutput: string; contextOutput: string } => {
    //Grabs the info
    let attackingCharacter: Character =
        state.characters[attackingCharacterName];
    let defendingCharacter: Character =
        state.characters[defendingCharacterName];

    //If you didn't create the characters earlier, they get all stats at starting level from state
    if (attackingCharacter === undefined) {
        state.characters[attackingCharacterName] = new Character();
        attackingCharacter = state.characters[attackingCharacterName];
    } else if (attackingCharacter.hp <= 0) {
        state.message = `${debugPrefix}: Character ${attackingCharacterName} cannot attack, because they are dead.`;
        return { attackOutput: "", levelOutput: "", contextOutput: "" };
    }

    if (defendingCharacter === undefined) {
        state.characters[defendingCharacterName] = new Character();
        defendingCharacter = state.characters[defendingCharacterName];
    } else if (defendingCharacter.hp <= 0) {
        state.message = `${debugPrefix}: Character ${defendingCharacterName} cannot be attacked, because they are dead.`;
        return { attackOutput: "", levelOutput: "", contextOutput: "" };
    }

    let attackingCharacterStatLevelWithMods: number = GetStatWithMods(
        attackingCharacter,
        attackStatName
    );
    let defendingCharacterStatLevelWithMods: number = GetStatWithMods(
        defendingCharacter,
        defenseStatName
    );

    //If you don't ignore zero division possibility, stats are set to 1 instead of 0
    if (!ignoreZeroDiv) {
        attackingCharacterStatLevelWithMods =
            attackingCharacterStatLevelWithMods === 0
                ? 1
                : attackingCharacterStatLevelWithMods;
        defendingCharacterStatLevelWithMods =
            defendingCharacterStatLevelWithMods === 0
                ? 1
                : defendingCharacterStatLevelWithMods;
    }

    const attackModifier: number =
        attackingCharacterStatLevelWithMods -
        attackingCharacter.stats[attackStatName].level;
    const defenseModifier: number =
        defendingCharacterStatLevelWithMods -
        defendingCharacter.stats[defenseStatName].level;

    //Calculating damage
    const damageInflicted = damage(
        attackingCharacterStatLevelWithMods,
        defendingCharacterStatLevelWithMods
    );
    //Damaging
    state.characters[defendingCharacterName].hp -= damageInflicted;

    if (state.characters[defendingCharacterName].hp <= 0)
        if (!defendingCharacter.isNpc)
            state.characters[defendingCharacterName].hp = 0;
        else delete state.characters[defendingCharacterName];

    //Gives the player necessary info.
    const attackOutput = `${attackingCharacterName} (${attackStatName}: ${attackingCharacterStatLevelWithMods}${
        attackModifier === 0
            ? ""
            : " (base: " +
              (attackingCharacterStatLevelWithMods - attackModifier) +
              ")"
    }) attacked ${defendingCharacterName} (${defenseStatName}: ${defendingCharacterStatLevelWithMods}${
        defenseModifier === 0
            ? ""
            : " (base: " +
              (defendingCharacterStatLevelWithMods - defenseModifier) +
              ")"
    }) dealing ${CustomDamageOutput(
        damageInflicted,
        damageOutputs
    )} (${damageInflicted}).\n${
        state.characters[defendingCharacterName].hp <= 0
            ? defendingCharacterName +
              (state.characters[defendingCharacterName].isNpc
                  ? " died."
                  : " retreated.")
            : defendingCharacterName +
              " now has " +
              state.characters[defendingCharacterName].hp +
              "hp."
    }`;

    let levelOutput: string = IncrementExp(
        attackingCharacterName,
        attackStatName
    );

    if (defendingCharacterLevels) {
        levelOutput += IncrementExp(defendingCharacterName, defenseStatName);
    }

    //Modifies the context, so AI will not know the exact values
    const contextOutput = `${attackingCharacterName} attacked ${defendingCharacterName} dealing ${CustomDamageOutput(
        damageInflicted,
        damageOutputs
    )}.${
        state.characters[defendingCharacterName].hp <= 0
            ? "\n" + defendingCharacterName + " died."
            : ""
    }`;

    return { attackOutput, levelOutput, contextOutput };
};

/**
 * state.ctxt is NOT modified by this function
 * Basically DealDamage, but checks for dodging before damaging
 *
 * @param attackStatName Name of stat used to attack
 * @param defenseStatName Name of stat used to defend
 * @param outputTargetByRef String variable used for output. May be state.out or modifiedText
 * @param debugPrefix Prefix added to debug messages, preferably command name
 * @returns Object containing attackOutput "a attacked b" and levelOutput "a levelled up"
 */
export const DealDamageIfNotDodged = (
    attackingCharacterName: string,
    attackStatName: string,
    defendingCharacterName: string,
    defenseStatName: string,
    debugPrefix: string
): { attackOutput: string; levelOutput: string; contextOutput: string } => {
    //Grabs the info
    let attackingCharacter: Character =
        state.characters[attackingCharacterName];
    let defendingCharacter: Character =
        state.characters[defendingCharacterName];

    //If you didn't create the characters earlier, they get all stats at starting level from state
    if (attackingCharacter === undefined) {
        state.characters[attackingCharacterName] = new Character();
        attackingCharacter = state.characters[attackingCharacterName];
    } else if (attackingCharacter.hp <= 0) {
        state.message = `${debugPrefix}: Character ${attackingCharacterName} cannot attack, because they are dead.`;
        return { attackOutput: "", levelOutput: "", contextOutput: "" };
    }

    if (defendingCharacter === undefined) {
        state.characters[defendingCharacterName] = new Character();
        defendingCharacter = state.characters[defendingCharacterName];
    } else if (defendingCharacter.hp <= 0) {
        state.message = `${debugPrefix}: Character ${defendingCharacterName} cannot be attacked, because they are dead.`;
        return { attackOutput: "", levelOutput: "", contextOutput: "" };
    }

    let attackingCharacterStatLevelWithMods: number = GetStatWithMods(
        attackingCharacter,
        attackStatName
    );
    let defendingCharacterStatLevelWithMods: number = GetStatWithMods(
        defendingCharacter,
        defenseStatName
    );

    const attackModifier: number =
        attackingCharacterStatLevelWithMods -
        attackingCharacter.stats[attackStatName].level;
    const defenseModifier: number =
        defendingCharacterStatLevelWithMods -
        defendingCharacter.stats[defenseStatName].level;

    //Checks if the character dodged the attack
    if (
        dodge(
            attackingCharacterStatLevelWithMods,
            defendingCharacterStatLevelWithMods
        )
    ) {
        const attackOutput: string = `${attackingCharacterName}(${attackingCharacterStatLevelWithMods}${
            attackModifier === 0
                ? ""
                : " (base: " +
                  (attackingCharacterStatLevelWithMods - attackModifier) +
                  ")"
        }) attacked ${defendingCharacterName}(${defendingCharacterStatLevelWithMods}${
            defenseModifier === 0
                ? ""
                : " (base: " +
                  (defendingCharacterStatLevelWithMods - defenseModifier) +
                  ")"
        }), but missed.`;

        return {
            attackOutput,
            levelOutput: "",
            contextOutput: `${attackingCharacterName} attacked ${defendingCharacterName}, but missed.`,
        };
    }

    return DealDamage(
        attackingCharacterName,
        attackStatName,
        defendingCharacterName,
        defenseStatName,
        debugPrefix
    );
};
