import { state } from "../Tests/proxy_state";
import { BestStat, GetStatWithMods } from "./characterutils";
import { ElementInArray, damage } from "../Shared Library/Utils";
import { Character } from "../Shared Library/Character";
import { ignoreZeroDiv, damageOutputs } from "./constants";
import { ExitBattle } from "./exitbattle";
import { CustomDamageOutput } from "./fightutils";

export const turn = (textCopy: string) => {
    console.log("Active: ", state.active);
    if (
        !state.attackingCharacter?.isNpc &&
        state.attackingCharacter !== undefined
    ) {
        if (!state.activeCharacterName) {
            state.message = "Turn: active character name not found.";
            return;
        }
        const exp: RegExp =
            /(?:(?<escape>retreat|escape|exit)|(?:\((?<attackStat>[\w ']+), *)?(?<defendingCharacter>[\w\s']+)(?:, *(?<defenseStat>[\w ']+))?\))/i;
        const match: RegExpMatchArray | null = textCopy.match(exp);

        // Player written something wrong
        if (!match || !match.groups) {
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

        const temp: number = Number(state.currentSide?.substring(4)) + 1;
        const attacked: string = `side${temp >= 3 ? 1 : temp}`;
        const attackedSideCharactersNames: string[] = state[attacked];

        const attackingCharacterName: string = state.activeCharacterName;
        const attackingCharacter: Character = state.attackingCharacterName;

        //You ALWAYS have to pick a target
        const defendingCharacterName: string = match.groups.defendingCharacter;
        const defendingCharacterIndex: number =
            attackedSideCharactersNames.findIndex(
                (el: string) => el === defendingCharacterName
            );

        //Grabs values or default for stats
        const attackStat: string =
            match.groups.attackStat ||
            BestStat(state.characters[attackingCharacterName]);

        const defenseStat: string =
            match.groups.defenseStat ||
            BestStat(state.characters[defendingCharacterName]);

        if (!ElementInArray(defendingCharacterName, state[attacked])) {
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

        //(Unless you are not ignoring zero division. In this case zeroes are changed to ones to avoid zero division error.)
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
        //#region levels
        //Checks whether to level up stats or characters
        if (levellingToOblivion) {
            //Increases experience by 1 and checks whether it's enough to level the stat up
            if (
                ++state.attackingCharacter[attackStat].experience >=
                state.attackingCharacter[attackStat].expToNextLvl
            ) {
                //If it is, experience is set to 0,
                state.attackingCharacter[attackStat].experience = 0;
                //level increased and expToNextLevel re-calculated
                state.attackingCharacter[attackStat].expToNextLvl =
                    experienceCalculation(
                        ++state.attackingCharacter[attackStat].level
                    );
                state.out += ` ${attackingCharacterName}'s ${attackStat} has levelled up to level ${state.attackingCharacter[attackStat].level}!`;
            }
        } else {
            //Increases experience by 1 and checks whether it's enough to level the character up
            if (
                ++state.attackingCharacter.experience >=
                state.attackingCharacter.expToNextLvl
            ) {
                //If it is, experience is set to 0,
                state.attackingCharacter.experience = 0;
                //level increased and expToNextLevel re-calculated
                state.attackingCharacter.expToNextLvl = experienceCalculation(
                    ++state.attackingCharacter.level
                );
                //In the case of attackingCharacter levelling up, it also gains free skillpoints
                state.attackingCharacter.skillpoints +=
                    state.skillpointsOnLevelUp;
                state.out += ` ${attackingCharacterName} has levelled up to level ${state.attackingCharacter.level} (free skillpoints: ${state.attackingCharacter.skillpoints})!`;
            }
        }
        if (defendingCharacterLevels && !defendingCharacter.isNpc) {
            //Checks whether to level up stats or characters
            if (levellingToOblivion) {
                //Increases experience by 1 and checks whether it's enough to level the stat up
                if (
                    ++defendingCharacter[defenseStat].experience >=
                    defendingCharacter[defenseStat].expToNextLvl
                ) {
                    //If it is, experience is set to 0,
                    defendingCharacter[defenseStat].experience = 0;
                    //level increased and expToNextLevel re-calculated
                    defendingCharacter[defenseStat].expToNextLvl =
                        experienceCalculation(
                            ++defendingCharacter[defenseStat].level
                        );
                    state.out += ` ${defendingCharacterName}'s ${defenseStat} has levelled up to level ${defendingCharacter[defenseStat].level}!`;
                }
            } else {
                //Increases experience by 1 and checks whether it's enough to level the defendingCharacter up
                if (
                    ++defendingCharacter.experience >=
                    defendingCharacter.expToNextLvl
                ) {
                    //If it is, experience is set to 0,
                    defendingCharacter.experience = 0;
                    //level increased and expToNextLevel re-calculated
                    defendingCharacter.expToNextLvl = experienceCalculation(
                        ++defendingCharacter.level
                    );
                    //In the case of defendingCharacter levelling up, it also gains free skillpoints
                    defendingCharacter.skillpoints +=
                        state.skillpointsOnLevelUp;
                    state.out += ` ${defendingCharacterName} has levelled up to level ${defendingCharacter.level} (free skillpoints: ${defendingCharacter.skillpoints})!`;
                }
            }
        }
        //#endregion levels
        if (state.characters[defendingCharacterName]?.hp <= 0) {
            state.characters[defendingCharacterName].hp = 0;
            //If character's hp falls below 0, they are removed from the battle
            state[attacked].splice(defendingCharacterIndex, 1);
            //NPCs die when they are killed
            if (state.characters[defendingCharacterName].isNpc)
                delete state.characters[defendingCharacterName];
        }
        //Checks if the battle should end after every attack
        if (!state.side1?.length) {
            state.message =
                "HP of all party members dropped to 0. Party retreated.";
            state.out +=
                "\nThe adventurers retreated, overwhelmed by the enemy.";
            state.inBattle = false;
            delete state.attackingCharacter;
            return;
        } else if (!state.side2?.length) {
            state.message = "You have won the battle!";
            state.out += "\nThe adventurers have won the battle.";
            state.inBattle = false;
            delete state.attackingCharacter;
            return;
        }
        state.active.splice(state.attCharInd, 1);
        if (!state.active?.length) {
            const temp = Number(state.currentSide.substring(4)) + 1;
            state.currentSide = `side${temp >= 3 ? 1 : temp}`;
            state.active = [...state[state.currentSide]];
        }
        state.attCharInd = diceRoll(state.active.length) - 1;
        state.activeCharacterName = state.active[state.attCharInd];
        state.attackingCharacter = state.characters[state.activeCharacterName];
    }
    while (
        state.attackingCharacter?.isNpc ||
        state.attackingCharacter === undefined
    ) {
        if (!state.active?.length) {
            const temp = Number(state.currentSide.substring(4)) + 1;
            state.currentSide = `side${temp >= 3 ? 1 : temp}`;
            state.active = [...state[state.currentSide]];
        }
        state.attCharInd = diceRoll(state.active.length) - 1;
        const attChar = (state.activeCharacterName =
            state.active[state.attCharInd]);
        state.attackingCharacter = state.characters[attChar];
        //console.log(state.attackingCharacter);
        if (
            state.attackingCharacter === undefined ||
            !state.attackingCharacter?.isNpc
        ) {
            break;
        }
        const temp = Number(state.currentSide.substring(4)) + 1;
        const attacked = `side${temp >= 3 ? 1 : temp}`;
        const defCharInd = diceRoll(state[attacked].length) - 1;
        console.log(state[attacked], defCharInd);
        const defChar = state[attacked][defCharInd];
        const defendingCharacter = state.characters[defChar];
        const attackStat = BestStat(state.attackingCharacter);
        const defenseStat = BestStat(defendingCharacter);
        const attBonus = calcBonus(attChar, attackStat);
        const defBonus = calcBonus(defChar, defenseStat);
        const attCharStat =
            state.attackingCharacter[attackStat].level + attBonus;
        const defCharStat = defendingCharacter[defenseStat].level + defBonus;
        if (defaultDodge) {
            if (dodge(attCharStat, defCharStat)) {
                state.out += `\n${attChar}(${attackStat}: ${attCharStat}${
                    attBonus === 0
                        ? ""
                        : " (base: " + (attCharStat - attBonus) + ")"
                }) attacked ${defChar}(${defenseStat}: ${defCharStat}${
                    defBonus === 0
                        ? ""
                        : " (base: " + (defCharStat - defBonus) + ")"
                }), but missed.`;
                continue;
            }
        }
        //Calculating damage
        const dam = damage(attCharStat, defCharStat);
        //Damaging
        state.characters[defChar].hp -= dam;
        //Deactivating character
        state.active.splice(state.attCharInd, 1);
        //Gives the player necessary info.
        state.out += `\n${attChar} (${attackStat}: ${attCharStat}${
            attBonus === 0 ? "" : " (base: " + (attCharStat - attBonus) + ")"
        }) attacked ${defChar} (${defenseStat}: ${defCharStat}${
            defBonus === 0 ? "" : " (base: " + (defCharStat - defBonus) + ")"
        }) dealing ${CustomDamageOutput(dam, damageOutputs)} (${dam}).\n${
            state.characters[defChar].hp <= 0
                ? defChar +
                  (state.characters[defChar].isNpc ? " died." : " retreated.")
                : defChar + " now has " + state.characters[defChar].hp + "hp."
        }`;

        //#region  levels
        if (defendingCharacterLevels && !defendingCharacter.isNpc) {
            //Checks whether to level up stats or characters
            if (levellingToOblivion) {
                //Increases experience by 1 and checks whether it's enough to level the stat up
                if (
                    ++defendingCharacter[defenseStat].experience >=
                    defendingCharacter[defenseStat].expToNextLvl
                ) {
                    //If it is, experience is set to 0,
                    defendingCharacter[defenseStat].experience = 0;
                    //level increased and expToNextLevel re-calculated
                    defendingCharacter[defenseStat].expToNextLvl =
                        experienceCalculation(
                            ++defendingCharacter[defenseStat].level
                        );
                    state.out += ` ${defChar}'s ${defenseStat} has levelled up to level ${defendingCharacter[defenseStat].level}!`;
                }
            } else {
                //Increases experience by 1 and checks whether it's enough to level the defendingCharacter up
                if (
                    ++defendingCharacter.experience >=
                    defendingCharacter.expToNextLvl
                ) {
                    //If it is, experience is set to 0,
                    defendingCharacter.experience = 0;
                    //level increased and expToNextLevel re-calculated
                    defendingCharacter.expToNextLvl = experienceCalculation(
                        ++defendingCharacter.level
                    );
                    //In the case of defendingCharacter levelling up, it also gains free skillpoints
                    defendingCharacter.skillpoints +=
                        state.skillpointsOnLevelUp;
                    state.out += ` ${defChar} has levelled up to level ${defendingCharacter.level} (free skillpoints: ${defendingCharacter.skillpoints})!`;
                }
            }
        }
        //#endregion levels

        if (state.characters[defChar].hp <= 0) {
            state.characters[defChar].hp = 0;
            //If character's hp falls below 0, they are removed from the battle
            state[attacked].splice(defCharInd, 1);
            //NPCs die when they are killed
            if (state.characters[defChar].isNpc)
                delete state.characters[defChar];
        }
        //Checks if the battle should end after every attack
        if (!state.side1?.length) {
            state.message =
                "HP of all party members dropped to 0. Party retreated.";
            state.out +=
                "\nThe adventurers retreated, overwhelmed by the enemy.";
            delete state.inBattle;
            delete state.attackingCharacter;
            return;
        } else if (!state.side2?.length) {
            state.message = "You have won the battle!";
            state.out += "\nThe adventurers have won the battle.";
            delete state.inBattle;
            delete state.attackingCharacter;
            return;
        }
        if (!state.active?.length) {
            const temp = Number(state.currentSide.substring(4)) + 1;
            state.currentSide = `side${temp >= 3 ? 1 : temp}`;
            state.active = [...state[state.currentSide]];
        }
    }
    state.message = `Current turn: ${state.activeCharacterName}`;
    console.log("Active: ", state.active);
};
