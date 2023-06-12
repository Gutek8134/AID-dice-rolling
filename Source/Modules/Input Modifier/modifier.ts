import { state } from "../Tests/proxy_state";
import SetupState from "./SetupState";
import { turn } from "./turn";
import { defaultDodge } from "./constants";
import skillcheck from "./Commands/skillcheck";

export const DEBUG: boolean = false;

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
        const temp = text.match(
            /\((?:(?<attackStat>[\w ']+), *)?(?<defendingCharacter>[\w\s']+)(?:, *(?<defenseStat>[\w ']+))?\)/i
        )?.[0];
        if (temp !== undefined)
            modifiedText =
                modifiedText.substring(0, text.indexOf(temp)) +
                modifiedText.substring(text.indexOf(temp) + temp.length);
        if (!state.active?.length) {
            const temp = Number(state.currentSide?.substring(4)) + 1;
            state.currentSide = `side${temp >= 3 ? 1 : temp}`;
            const side: string[] = state[state.currentSide];
            state.active = [...side];
        }
        turn({ textCopy });
        logs();
        return { text: modifiedText };
    }
    //#endregion battle handling

    //#region globalCommand
    //Checks for pattern !command(args)
    const globalExp = /!(?<command>[^\s()]+)\((?<arguments>.*)\)/i;
    const globalMatch = text.match(globalExp);

    //If something matched, calls functions with further work
    if (globalMatch !== null && globalMatch.groups) {
        const temp = text.indexOf(globalMatch[0]);

        //Creates indices, because d flag is not allowed
        const currIndices = [temp, temp + globalMatch[0].length];

        //Matches the command and forwards arguments to them
        switch (globalMatch.groups.command.toLowerCase()) {
            case "skillcheck":
                skillcheck(globalMatch.groups.arguments, currIndices, {
                    modifiedText,
                });
                break;

            case "battle":
                battle(globalMatch.groups.arguments);
                break;

            case "attack":
                if (!defaultDodge) attack(globalMatch.groups.arguments);
                else sattack(globalMatch.groups.arguments);
                break;

            case "sattack":
                if (defaultDodge) attack(globalMatch.groups.arguments);
                else sattack(globalMatch.groups.arguments);
                break;

            case "heal":
                heal(globalMatch.groups.arguments);
                break;

            case "revive":
                revive(globalMatch.groups.arguments);
                break;

            case "additem":
                addItem(globalMatch.groups.arguments);
                break;

            case "gainitem":
                gainItem(globalMatch.groups.arguments);
                break;

            case "equip":
                equip(globalMatch.groups.arguments);
                break;

            case "unequip":
                unequip(globalMatch.groups.arguments);
                break;

            case "showinventory":
                showInventory(globalMatch.groups.arguments);
                break;

            case "addcharacter":
                addCharacter(globalMatch.groups.arguments);
                break;

            case "addnpc":
                addNPC(globalMatch.groups.arguments);
                break;

            case "setstats":
                setStats(globalMatch.groups.arguments);
                break;

            case "showstats":
                showStats(globalMatch.groups.arguments);
                break;

            case "levelstats":
                levelStats(globalMatch.groups.arguments);
                break;

            case "getstate":
                getState(globalMatch.groups.arguments);
                break;

            case "setstate":
                setState(globalMatch.groups.arguments);
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
