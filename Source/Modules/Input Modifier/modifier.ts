import { state } from "../proxy_state";
import SetupState from "./SetupState";
import { turn } from "./turn";
import { defaultDodge } from "./constants";
import skillcheck from "./Commands/skillcheck";
import battle from "./Commands/battle";
import attack from "./Commands/attack";
import sattack from "./Commands/sattack";
import heal from "./Commands/heal";
import revive from "./Commands/revive";
import addItem from "./Commands/addItem";
import gainItem from "./Commands/gainItem";
import equip from "./Commands/equip";
import unequip from "./Commands/unequip";
import showInventory from "./Commands/showInventory";
import addCharacter from "./Commands/addCharacter";
import addNPC from "./Commands/addNPC";
import setStats from "./Commands/setStats";
import showStats from "./Commands/showStats";
import levelStats from "./Commands/levelStats";
import getState from "./Commands/getState";
import setState from "./Commands/setState";
import alterItem from "./Commands/alterItem";
import { RemoveEffect, RunEffect } from "../Shared Library/Effect";
import { Character } from "../Shared Library/Character";
import alterEffect from "./Commands/alterEffect";
import createEffect from "./Commands/createEffect";
import applyEffect from "./Commands/applyEffect";
import removeEffect from "./Commands/removeEffect";

export const DEBUG: boolean = false;
export const InfoOutput: "out" | "message" = "out";

const CommandsAccessibleInBattle: string[] = [
    "heal",
    "revive",
    "additem",
    "alteritem",
    "gainitem",
    "showinventory",
    "altereffect",
    "createeffect",
    "applyeffect",
    "removeeffect",
    "equip",
    "unequip",
    "setstats",
    "showstats",
    "levelstats",
    "setstate",
    "getstate",
];

const RunCommand = (
    textCopy: string,
    globalMatch: RegExpMatchArray,
    currIndices: number[]
): string => {
    let modifiedText = textCopy;
    if (globalMatch.groups) {
        if (
            state.inBattle &&
            !CommandsAccessibleInBattle.includes(
                globalMatch.groups.command.toLocaleLowerCase()
            )
        ) {
            state[
                InfoOutput
            ] = `Command ${globalMatch.groups.command} is not accessible in battle.`;
            return textCopy;
        }
        switch (globalMatch.groups.command.toLowerCase()) {
            case "skillcheck":
                modifiedText = skillcheck(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "battle":
                modifiedText = battle(
                    globalMatch.groups.arguments,
                    modifiedText
                );
                break;

            case "attack":
                modifiedText = !defaultDodge
                    ? attack(
                          globalMatch.groups.arguments,
                          currIndices,
                          textCopy,
                          modifiedText
                      )
                    : sattack(
                          globalMatch.groups.arguments,
                          currIndices,
                          textCopy,
                          modifiedText
                      );
                break;

            case "sattack":
                modifiedText = defaultDodge
                    ? attack(
                          globalMatch.groups.arguments,
                          currIndices,
                          textCopy,
                          modifiedText
                      )
                    : sattack(
                          globalMatch.groups.arguments,
                          currIndices,
                          textCopy,
                          modifiedText
                      );
                break;

            case "heal":
                modifiedText = heal(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "revive":
                modifiedText = revive(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "additem":
                modifiedText = addItem(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "alteritem":
                modifiedText = alterItem(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "gainitem":
                modifiedText = gainItem(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "altereffect":
                modifiedText = alterEffect(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "createeffect":
                modifiedText = createEffect(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "applyeffect":
                modifiedText = applyEffect(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "removeeffect":
                modifiedText = removeEffect(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "equip":
                modifiedText = equip(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "unequip":
                modifiedText = unequip(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "showinventory":
                modifiedText = showInventory(
                    globalMatch.groups.arguments,
                    modifiedText
                );
                break;

            case "addcharacter":
                modifiedText = addCharacter(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "addnpc":
                modifiedText = addNPC(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "setstats":
                modifiedText = setStats(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "showstats":
                modifiedText = showStats(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "levelstats":
                modifiedText = levelStats(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "getstate":
                modifiedText = getState(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            case "setstate":
                modifiedText = setState(
                    globalMatch.groups.arguments,
                    currIndices,
                    modifiedText
                );
                break;

            default:
                state[InfoOutput] = "Command not found.";
                break;
        }
    }
    return modifiedText;
};

export const modifier = (text: string): { text: string; stop?: boolean } => {
    //#region logs
    const logs = (): void => {
        //!Debug info, uncomment when you need
        if (DEBUG) {
            //console.log(`Og: ${textCopy}`);
            console.log(`In: ${modifiedText}`);
            console.log(`Context: ${state.ctxt}`);
            console.log(`Out: ${state.out}`);
            console.log(`Message: ${state[InfoOutput]}`);
            //console.log(state.side1, state.side2);
            //console.log(state.characters);
            //console.log(state.inBattle);
            /*for (key in state.characters) {
          console.log(`\n\n${key}:\n${state.characters[key]}`);
        }*/
            console.log("------------");
        }
    };
    //#endregion logs

    SetupState();
    //Resets values
    state.out = state.ctxt = "";
    state.seenOutput = false;
    state[InfoOutput] = "";
    let modifiedText = text,
        textCopy = text;

    //#region battle handling
    if (state.inBattle) {
        const battleMatch: RegExpMatchArray | null = text.match(
            /!(?<command>[^\s()]+)\((?<arguments>.*)\)|\((?:(?<attackStat>[\w ']+), *)?(?<defendingCharacter>[\w\s']+)(?:, *(?<defenseStat>[\w ']+))?\)/i
        );
        if (battleMatch && battleMatch.groups) {
            //Command overrides turn
            if (battleMatch.groups.command) {
                const temp = text.indexOf(battleMatch[0]);
                //Creates indices, because d flag is not allowed
                const currIndices = [temp, temp + battleMatch[0].length];
                battleMatch.groups.arguments =
                    battleMatch.groups.arguments.trim();
                modifiedText = RunCommand(textCopy, battleMatch, currIndices);
            } else {
                modifiedText =
                    modifiedText.substring(0, text.indexOf(battleMatch[0])) +
                    modifiedText.substring(
                        text.indexOf(battleMatch[0]) + battleMatch.length
                    );
                if (!state.active?.length) {
                    const temp = Number(state.currentSide?.substring(4)) + 1;
                    state.currentSide = `side${temp >= 3 ? 1 : temp}`;
                    const side: string[] = state[state.currentSide];
                    state.active = [...side];
                }
                turn(textCopy);
            }
        }
        logs();
        return { text: modifiedText };
    }
    //#endregion battle handling

    if (state.runEffectsOutsideBattle)
        for (const characterName of Object.keys(state.characters)) {
            const character: Character = state.characters[characterName];
            if (!character.activeEffects) character.activeEffects = [];
            for (const effect of character.activeEffects) {
                if (effect.impact === "every turn")
                    RunEffect(characterName, effect);
                if (--effect.durationLeft === 0) {
                    if (effect.impact === "on end") {
                        RunEffect(characterName, effect);
                    }
                    modifiedText += RemoveEffect(characterName, effect.name);
                }
            }
        }
    //#region globalCommand
    //Checks for pattern !command(args)
    const globalExp = /!(?<command>[^\s()]+)\((?<arguments>.*)\)/i;
    const globalMatch = text.match(globalExp);

    //If something matched, calls functions with further work
    if (globalMatch && globalMatch.groups) {
        const temp = text.indexOf(globalMatch[0]);

        //Creates indices, because d flag is not allowed
        const currIndices = [temp, temp + globalMatch[0].length];
        globalMatch.groups.arguments = globalMatch.groups.arguments.trim();

        //Matches the command and forwards arguments to them
        modifiedText = RunCommand(textCopy, globalMatch, currIndices);
    }
    //#endregion globalCommand
    state.in = modifiedText;
    logs();
    // You must return an object with the text property defined.
    return { text: modifiedText };
};
