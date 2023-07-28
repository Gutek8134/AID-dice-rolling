import { state } from "../Tests/proxy_state";
import SetupState from "./SetupState";
import { turn } from "./turn";
import { defaultDodge } from "./constants";
import skillcheck from "./Commands/skillcheck";
import battle from "./Commands/battle";
import attack from "./Commands/attack";
import sattack from "./Commands/sattack";
import heal from "./Commands/heal";
import revive from "./Commands/revive";
import addItem from "./Commands/additem";
import gainItem from "./Commands/gainitem";
import equip from "./Commands/equip";
import unequip from "./Commands/unequip";
import showInventory from "./Commands/showinventory";
import addCharacter from "./Commands/addcharacter";
import addNPC from "./Commands/addnpc";
import setStats from "./Commands/setstats";
import showStats from "./Commands/showstats";
import levelStats from "./Commands/levelStats";
import getState from "./Commands/getstate";
import setState from "./Commands/setstate";
import alterItem from "./Commands/alteritem";

export const DEBUG: boolean = true;

export const modifier = (text: string): { text: string; stop?: boolean } => {
    //#region logs
    const logs = (): void => {
        //!Debug info, uncomment when you need
        if (DEBUG) {
            //console.log(`Og: ${textCopy}`);
            console.log(`In: ${modifiedText}`);
            console.log(`Context: ${state.ctxt}`);
            console.log(`Out: ${state.out}`);
            console.log(`Message: ${state.message}`);
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
    state.message = " ";
    let modifiedText = text,
        textCopy = text;

    //#region battle handling
    if (state.inBattle) {
        const battleMatch = text.match(
            /\((?:(?<attackStat>[\w ']+), *)?(?<defendingCharacter>[\w\s']+)(?:, *(?<defenseStat>[\w ']+))?\)/i
        )?.[0];
        if (battleMatch !== undefined)
            modifiedText =
                modifiedText.substring(0, text.indexOf(battleMatch)) +
                modifiedText.substring(
                    text.indexOf(battleMatch) + battleMatch.length
                );
        if (!state.active?.length) {
            const temp = Number(state.currentSide?.substring(4)) + 1;
            state.currentSide = `side${temp >= 3 ? 1 : temp}`;
            const side: string[] = state[state.currentSide];
            state.active = [...side];
        }
        turn(textCopy);
        logs();
        return { text: modifiedText };
    }
    //#endregion battle handling

    //#region globalCommand
    //Checks for pattern !command(args)
    const globalExp = /!(?<command>[^\s()]+)\((?<arguments>.*)\)/i;
    const globalMatch = text.match(globalExp);

    //If something matched, calls functions with further work
    if (globalMatch && globalMatch.groups) {
        const temp = text.indexOf(globalMatch[0]);

        //Creates indices, because d flag is not allowed
        const currIndices = [temp, temp + globalMatch[0].length];

        //Matches the command and forwards arguments to them
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
                state.message = "Command not found.";
                break;
        }
        if (state.ctxt.length <= 1) state.ctxt = " \n";
    }
    //#endregion globalCommand
    state.in = modifiedText;
    logs();
    // You must return an object with the text property defined.
    return { text: modifiedText };
};
