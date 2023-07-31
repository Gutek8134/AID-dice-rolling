import { Character } from "../../Shared Library/Character";
import { ElementInArray, diceRoll } from "../../Shared Library/Utils";
import { state } from "../../Tests/proxy_state";
import { GetStatWithMods, IncrementExp } from "../characterutils";
import { shouldPunish } from "../constants";
import { DEBUG } from "../modifier";
import { CutCommandFromContext } from "./commandutils";

const skillcheck = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);

    const textCopy: string = modifiedText;

    //Checks for format stat, character, thresholds , outputs groups character and thresholds, that are matched later
    const exp: RegExp =
        /(?<stat>[\w ']+), (?<character>[\w\s']+), (?<thresholds>.+)/i;

    //Checks for thresholds type
    const thresholdCheck: RegExp =
        /^\s*(?:(?<thresholdsC>\d+ *= *.+(?: *: *\d+ *= *.+)+)|(?<thresholds4>\d+ *: *\d+ *: *\d+ *: *\d+)|(?<thresholds3>\d+ *: *\d+ *: *\d+)|(?<thresholds2>\d+ *: *\d+)|(?<thresholds1>\d+))\s*$/i;

    const match: RegExpMatchArray | null = commandArguments.match(exp);
    //console.log(match);

    //Firstly, checks if something matched
    if (match === null || !match.groups) {
        state.message =
            "Skillcheck: Arguments were not given in proper format.";
        return modifiedText;
    }

    //Regex matched, so program is rolling the dice
    const roll: number = diceRoll(state.dice);

    //Grabbing necessary info
    const statName: string = match.groups.stat;
    const characterName: string = match.groups.character;

    //Testing if stat exists, throwing error otherwise
    if (!ElementInArray(statName, state.stats)) {
        state.message = `Skillcheck: Stat ${statName} does not exist.`;
        return modifiedText;
    }

    //Shortening access path to character object
    let character: Character | undefined = state.characters[characterName];

    if (!character) {
        state.message = `Skillcheck: Character ${characterName} doesn't exist.`;
        return modifiedText;
    }

    //Don't have a stat? No problem! You'll have a 0 instead! That's even worse than the default starting value!
    const characterStatLevelWithMods: number = GetStatWithMods(
        character,
        statName
    );
    let effectiveCharacterStatLevel = characterStatLevelWithMods;

    //Punishing
    if (character.hp < 1 && shouldPunish) {
        state.message = `Skillcheck: Testing against dead character. Punishment: -${state.punishment} (temporary).`;
        effectiveCharacterStatLevel -= state.punishment;
    }

    //console.log(char + ", " + stat + ": "+ charStat);

    //Grabs thresholds
    const thresholds = commandArguments.match(thresholdCheck);
    if (!thresholds || !thresholds.groups) {
        state.message = "Skillcheck: Thresholds are not in proper format.";
        return DEBUG ? "Threshold fail" : modifiedText;
    }
    //console.log(thresholds);

    const bonus = characterStatLevelWithMods - character.stats[statName].level;
    // console.log("skill bonus:", bonus);

    //Tricky part, checking every group for data
    for (const key in thresholds.groups) {
        //Grabbing necessary info
        const thresholdsAsString: string = thresholds.groups[key];

        //null check
        if (!thresholdsAsString) continue;

        const score: number = roll + effectiveCharacterStatLevel;
        let mess: string = `Skillcheck performed: ${characterName} with ${statName}: ${effectiveCharacterStatLevel}${
            bonus === 0 ? "" : " (base " + character.stats[statName].level + ")"
        } rolled ${roll}. ${effectiveCharacterStatLevel} + ${roll} = ${score}. `;

        let outcome: string = "";
        let custom: boolean = false;

        let thresholdsAsNumberStringArr: Array<[number, string]> = [];

        //#region threshold check
        //Handling the skillcheck
        switch (key) {
            //One threshold means success or failure
            case "thresholds1": {
                mess += `Difficulty: ${thresholdsAsString} Outcome: `;
                outcome =
                    score >= Number(thresholdsAsString.trim())
                        ? "success."
                        : "failure.";
                break;
            }

            //Two of them - success, nothing, failure
            case "thresholds2": {
                const thresholdsAsNumberArr: number[] = thresholdsAsString
                    .split(":")
                    .map((el) => Number(el.trim()))
                    .sort((a, b) => a - b);

                mess += `Difficulty: ${thresholdsAsNumberArr.join(
                    ", "
                )} Outcome: `;

                if (score >= thresholdsAsNumberArr[1]) {
                    outcome = "success.";
                } else if (score >= thresholdsAsNumberArr[0]) {
                    outcome = "nothing happens.";
                } else {
                    outcome = "failure.";
                }
                break;
            }

            //Three of them - critical success, success, failure or critical failure
            case "thresholds3": {
                const thresholdsAsNumberArr = thresholdsAsString
                    .split(":")
                    .map((el) => Number(el.trim()))
                    .sort((a, b) => a - b);

                mess += `Difficulty: ${thresholdsAsNumberArr.join(
                    ", "
                )} Outcome: `;

                if (score >= thresholdsAsNumberArr[2]) {
                    outcome = "critical success.";
                } else if (score >= thresholdsAsNumberArr[1]) {
                    outcome = "success.";
                } else if (score >= thresholdsAsNumberArr[0]) {
                    outcome = "failure.";
                } else {
                    outcome = "critical failure.";
                }
                break;
            }

            //Four of them - critical success, success, nothing, failure or critical failure
            case "thresholds4": {
                const thresholdsAsNumberArr: number[] = thresholdsAsString
                    .split(":")
                    .map((el) => Number(el.trim()))
                    .sort((a, b) => a - b);
                mess += `Difficulty: ${thresholdsAsNumberArr.join(
                    ", "
                )} Outcome: `;

                if (score >= thresholdsAsNumberArr[3]) {
                    outcome = "critical success.";
                } else if (score >= thresholdsAsNumberArr[2]) {
                    outcome = "success.";
                } else if (score >= thresholdsAsNumberArr[1]) {
                    outcome = "nothing happens.";
                } else if (score >= thresholdsAsNumberArr[0]) {
                    outcome = "failure.";
                } else {
                    outcome = "critical failure.";
                }
                break;
            }

            //Custom thresholds with outcomes
            case "thresholdsC":
                //Converts n1=s1 : n2=s2 to [[n1, s1], [n2, s2]]
                thresholdsAsNumberStringArr = thresholdsAsString
                    .split(":")
                    .map((el) => {
                        const temp = el.split("=").map((el) => el.trim());
                        return [Number(temp[0]), temp[1]];
                    });

                mess += `Difficulty: ${CustomDifficulties(
                    thresholdsAsNumberStringArr
                )} Outcome: `;
                custom = true;
                break;

            //Read message
            default:
                console.error("WTF is this?!");
                state.message =
                    "Skillcheck: no group has been matched.\nIDK how did you make it, but think about creating an issue.";
                return modifiedText;
        }
        //#endregion threshold check

        //Modifying context and input. Custom thresholds are handled differently, so they are separated
        if (!custom) {
            state.ctxt =
                modifiedText.substring(0, currIndices[0]) +
                "Outcome: " +
                outcome +
                modifiedText.substring(currIndices[1]);

            modifiedText =
                modifiedText.substring(0, currIndices[0]) + mess + outcome;
        } else {
            state.ctxt =
                modifiedText.substring(0, currIndices[0]) +
                CustomOutcome(score, thresholdsAsNumberStringArr) +
                modifiedText.substring(currIndices[1]);

            modifiedText =
                modifiedText.substring(0, currIndices[0]) +
                mess +
                CustomOutcome(score, thresholdsAsNumberStringArr);
        }
    }
    modifiedText += IncrementExp(characterName, statName);
    modifiedText += textCopy.substring(currIndices[1]);

    return modifiedText;
};

const CustomOutcome = (
    score: number,
    thresholdsAsStringNumberArr: Array<[number, string]>
): string => {
    let i: number = 0;
    let out: string = "nothing happens.";

    while (score >= thresholdsAsStringNumberArr[i][0]) {
        out = thresholdsAsStringNumberArr[i++][1];
        if (thresholdsAsStringNumberArr[i] === undefined) {
            break;
        }
    }
    return out;
};

const CustomDifficulties = (
    thresholdsAsStringNumberArr: Array<[number, string]>
): string => {
    let temp = "";
    thresholdsAsStringNumberArr.forEach((element) => {
        temp += element[0] + ", ";
    });
    return temp.substring(0, temp.length - 2);
};

export default skillcheck;
