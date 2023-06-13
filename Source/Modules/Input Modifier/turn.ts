import { state } from "../Tests/proxy_state";
import { BestStat, GetStatWithMods, IncrementExp } from "./characterutils";
import {
    ElementInArray,
    damage,
    diceRoll,
    dodge,
} from "../Shared Library/Utils";
import { Character } from "../Shared Library/Character";
import {
    ignoreZeroDiv,
    damageOutputs,
    defendingCharacterLevels,
    defaultDodge,
} from "./constants";
import { CustomDamageOutput } from "./fightutils";
import { DEBUG } from "./modifier";

export const turn = (textCopy: string): void => {
    if (DEBUG) console.log("Active: ", state.active);

    if (!state.activeCharacter) {
        if (!state.active?.length) {
            const temp = Number(state.currentSide?.substring(4)) + 1;
            state.currentSide = `side${temp >= 3 ? 1 : temp}`;
            state.active = [...state[state.currentSide]];
        }

        const nextActiveCharacterIndex = diceRoll(state.active.length) - 1;
        state.activeCharacterName = state.active[nextActiveCharacterIndex];
        state.activeCharacter = state.characters[state.activeCharacterName];
    }

    //Attacking character set and is not an NPC
    if (!state.activeCharacter.isNpc) {
        if (!state.activeCharacterName) {
            state.message = "Turn: active character name not found.";
            return;
        }

        const expression: RegExp =
            /(?:(?<escape>retreat|escape|exit)|(?:\((?<attackStat>[\w ']+), *)?(?<defendingCharacter>[\w\s']+)(?:, *(?<defenseStat>[\w ']+))?\))/i;

        const match: RegExpMatchArray | null = textCopy.match(expression);

        // Player written something wrong
        if (!match || !match?.groups) {
            state.message =
                "Battle turn: In battle you can only retreat or attack.\nFor further information read !battle section of README.";
            return;
        }

        // Retreat, escape or exit were in input, party retreats
        if (match.groups.escape) {
            state.out += "\nParty retreated from the fight.";
            ExitBattle();
            return;
        }

        const attackingCharacterName: string = state.activeCharacterName;

        //You ALWAYS have to pick a target
        const defendingCharacterName: string = match.groups.defendingCharacter;

        //Grabs values or default for stats
        const attackStat: string =
            match.groups.attackStat ||
            BestStat(state.characters[attackingCharacterName]);

        const defenseStat: string =
            match.groups.defenseStat ||
            BestStat(state.characters[defendingCharacterName]);

        takeTurn(
            attackingCharacterName,
            defendingCharacterName,
            attackStat,
            defenseStat
        );
    }

    while (
        state.activeCharacter?.isNpc ||
        state.activeCharacter === undefined
    ) {
        const attackingCharacterName: string | undefined =
            state.activeCharacterName;

        if (!attackingCharacterName) {
            state.message =
                "Battle turn: ERROR active character name is undefined";
            return;
        }

        //Gets names of possibly attacked characters
        const sideNumber: number = Number(state.currentSide?.substring(4)) + 1;
        const attacked: "side1" | "side2" =
            sideNumber >= 3 || sideNumber == 1 ? "side1" : "side2";
        const attackedSideCharactersNames: string[] = state[attacked] ?? [];

        //Randomly chooses one
        const defendingCharacterIndex =
            diceRoll(attackedSideCharactersNames.length) - 1;
        const defendingCharacterName =
            attackedSideCharactersNames[defendingCharacterIndex];
        const defendingCharacter = state.characters[defendingCharacterName];

        //Gets necessary values
        const attackStat = BestStat(state.activeCharacter);
        const defenseStat = BestStat(defendingCharacter);

        takeTurn(
            attackingCharacterName,
            defendingCharacterName,
            attackStat,
            defenseStat
        );
    }
};

const takeTurn = (
    attackingCharacterName: string,
    defendingCharacterName: string,
    attackStat: string,
    defenseStat: string
): void => {
    //Gets names of possibly attacked characters to check whether the target is one
    const sideNumber: number = Number(state.currentSide?.substring(4)) + 1;
    const attacked: "side1" | "side2" =
        sideNumber >= 3 || sideNumber == 1 ? "side1" : "side2";
    const attackedSideCharactersNames: string[] = state[attacked] ?? [];

    const attackingCharacter: Character =
        state.characters[attackingCharacterName];

    //You ALWAYS have to pick a target
    const defendingCharacterIndex: number =
        attackedSideCharactersNames.findIndex(
            (el: string) => el === defendingCharacterName
        );

    if (!ElementInArray(defendingCharacterName, attackedSideCharactersNames)) {
        state.message = `Battle turn: character ${defendingCharacterName} doesn't belong to the other side of the battle.`;
        return;
    }

    const defendingCharacter: Character =
        state.characters[defendingCharacterName];

    let attackingCharacterStatLevelWithMods: number = GetStatWithMods(
        attackingCharacter,
        attackStat
    );
    let defendingCharacterStatLevelWithMods: number = GetStatWithMods(
        defendingCharacter,
        defenseStat
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
        attackingCharacter.stats[attackStat].level;
    const defenseModifier: number =
        defendingCharacterStatLevelWithMods -
        defendingCharacter.stats[defenseStat].level;

    if (defaultDodge) {
        if (
            dodge(
                attackingCharacterStatLevelWithMods,
                defendingCharacterStatLevelWithMods
            )
        ) {
            state.out += `\n${attackingCharacterName}(${attackStat}: ${attackingCharacterStatLevelWithMods}${
                attackModifier === 0
                    ? ""
                    : " (base: " +
                      (attackingCharacterStatLevelWithMods - attackModifier) +
                      ")"
            }) attacked ${defendingCharacterName}(${defenseStat}: ${defendingCharacterStatLevelWithMods}${
                defenseModifier === 0
                    ? ""
                    : " (base: " +
                      (defendingCharacterStatLevelWithMods - defenseModifier) +
                      ")"
            }), but missed.`;

            //End turn on miss
            EndTurn();
            return;
        }
    }

    //Calculating damage
    const damageInflicted: number = damage(
        attackingCharacterStatLevelWithMods,
        defendingCharacterStatLevelWithMods
    );

    //Damaging
    state.characters[defendingCharacterName].hp -= damageInflicted;

    //Gives the player necessary info.
    state.out += `\n${attackingCharacterName} (${attackStat}: ${attackingCharacterStatLevelWithMods}${
        attackModifier === 0
            ? ""
            : " (base: " +
              (attackingCharacterStatLevelWithMods - attackModifier) +
              ")"
    }) attacked ${defendingCharacterName} (${defenseStat}: ${defendingCharacterStatLevelWithMods}${
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

    //Always grants 1 Exp to attacking character, for defending it's up to user
    state.out += IncrementExp(attackingCharacterName, attackStat);

    if (defendingCharacterLevels) {
        state.out += IncrementExp(defendingCharacterName, defenseStat);
    }

    //If character's hp falls below 0, they are removed from the battle
    if (state.characters[defendingCharacterName]?.hp <= 0) {
        state.characters[defendingCharacterName].hp = 0;
        attackedSideCharactersNames.splice(defendingCharacterIndex, 1);

        //NPCs die when they are killed
        if (state.characters[defendingCharacterName].isNpc)
            delete state.characters[defendingCharacterName];
    }

    //Checks if the battle should end after every attack
    if (!state.side1?.length) {
        state.message =
            "HP of all party members dropped to 0. Party retreated.";
        state.out += "\nThe adventurers retreated, overwhelmed by the enemy.";
        state.inBattle = false;
        delete state.activeCharacter;
        return;
    } else if (!state.side2?.length) {
        state.message = "You have won the battle!";
        state.out += "\nThe adventurers have won the battle.";
        state.inBattle = false;
        delete state.activeCharacter;
        return;
    }

    const attackingCharacterIndex: number =
        state.active?.indexOf(attackingCharacterName) ?? 0;

    //Removes current character from active ones and if the active array is empty,
    //populates is with characters from the other side of the battle
    state.active?.splice(attackingCharacterIndex, 1);
    if (!state.active?.length) {
        const temp = Number(state.currentSide?.substring(4)) + 1;
        state.currentSide = `side${temp >= 3 ? 1 : temp}`;
        state.active = [...state[state.currentSide]];
    }

    EndTurn();
};

const EndTurn = (): void => {
    const nextActiveCharacterIndex = diceRoll(state.active?.length ?? 1) - 1;

    const activeCharacterName = state.active?.[nextActiveCharacterIndex];

    if (!activeCharacterName) {
        state.message = "Battle turn: active character is undefined.";
        return;
    }

    state.activeCharacterName = activeCharacterName;
    state.activeCharacter = state.characters[state.activeCharacterName];
    state.message = `Current turn: ${state.activeCharacterName}`;
};

const ExitBattle = (): void => {
    state.inBattle = false;
    delete state.attackingCharacter, state.activeCharacterName;
    delete state.side1, state.side2;
    delete state.currentSide;
};
