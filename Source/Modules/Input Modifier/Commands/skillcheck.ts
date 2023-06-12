import { Character } from "../../Shared Library/Character";
import { ElementInArray, diceRoll } from "../../Shared Library/Utils";
import { state } from "../../Tests/proxy_state";
import { GetStatWithMods, IncrementExp } from "../characterutils";
import { shouldPunish } from "../constants";
import { CutCommand } from "./commandutils";

const skillcheck = (
    commandArguments: string,
    currIndices: number[],
    references: { modifiedText: string }
) => {
    //Error checking
    if (
        commandArguments === undefined ||
        commandArguments === null ||
        commandArguments === ""
    ) {
        state.message = "No arguments found.";
        CutCommand(references.modifiedText, currIndices);
        return;
    }

    const textCopy: string = references.modifiedText;

    //Checks for format stat, character, thresholds , outputs groups character and thresholds, that are matched later
    const exp: RegExp =
        /(?<stat>[\w ']+), (?<character>[\w\s']+), (?<thresholds>.+)/i;

    //Checks for thresholds type
    const thresholdCheck: RegExp =
        /(?<thresholdsC>\d+ *= *.+(?: *: *\d+ *= *.+)+)|(?<thresholds4>\d+ *: *\d+ *: *\d+ *: *\d+)|(?<thresholds3>\d+ *: *\d+ *: *\d+)|(?<thresholds2>\d+ *: *\d+)|(?<thresholds1>\d+)/i;

    const match: RegExpMatchArray | null = commandArguments.match(exp);
    //console.log(match);

    //Firstly, checks if something matched
    if (match === null || !match.groups) {
        state.message =
            "Skillcheck: Arguments were not given in proper format.";
        CutCommand(references.modifiedText, currIndices);
        return;
    }

    //Regex matched, so program is rolling the dice
    const roll: number = diceRoll(state.dice);

    //Grabbing necessary info
    const statName: string = match.groups.stat;
    const characterName: string = match.groups.character;

    //Testing if stat exists, throwing error otherwise
    if (!ElementInArray(statName, state.stats)) {
        state.message = "Skillcheck: Specified stat does not exist";
        CutCommand(references.modifiedText, currIndices);
        return;
    }

    //Shortening access path to character object
    let character: Character | undefined = state.characters[characterName];

    //If you didn't create a character earlier, they get all stats at starting level from state
    if (character === undefined) {
        state.characters[characterName] = new Character();
        character = state.characters[characterName];
    }

    //Don't have a stat? No problem! You'll have a 0 instead! That's even worse than the default starting value!
    const characterStatLevelWithMods: number = GetStatWithMods(
        character,
        statName
    );
    let usedCharacterStatLevel = characterStatLevelWithMods;

    //Punishing
    if (character.hp < 1 && shouldPunish) {
        state.message = `Skillcheck: Testing against dead character. Punishment: -${state.punishment} (temporary).`;
        usedCharacterStatLevel -= state.punishment;
    }

    //console.log(char + ", " + stat + ": "+ charStat);

    //Grabs thresholds
    const thresholds = commandArguments.match(thresholdCheck);
    if (thresholds === null) {
        state.message = "Thresholds are not in proper format";
        CutCommand(references.modifiedText, currIndices);
        return;
    }
    //console.log(thresholds);

    const bonus = characterStatLevelWithMods - character.stats[statName].level;
    // console.log("skill bonus:", bonus);

    //Tricky part, checking every group for data
    for (const key in thresholds.groups) {
        //Grabbing necessary info
        const thresholdsAsString: string = thresholds.groups[key];

        //null check
        if (
            thresholdsAsString !== undefined &&
            currIndices !== undefined &&
            character !== undefined
        ) {
            const score: number = roll + usedCharacterStatLevel;
            let mess: string = `Skillcheck performed: ${characterName} with ${statName}: ${usedCharacterStatLevel}${
                bonus === 0
                    ? ""
                    : " (base " + character.stats[statName].level + ")"
            } rolled ${roll}. ${usedCharacterStatLevel} + ${roll} = ${score}. `;

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
                        "Skillcheck: no group has been matched. \nIDK how did you make it, but think about creating an issue.";
                    return;
            }
            //#endregion threshold check

            //Modifying context and input. Custom thresholds are handled differently, so they are separated
            if (!custom) {
                state.ctxt =
                    references.modifiedText.substring(0, currIndices[0]) +
                    "Outcome: " +
                    outcome +
                    references.modifiedText.substring(currIndices[1]);

                references.modifiedText =
                    references.modifiedText.substring(0, currIndices[0]) +
                    mess +
                    outcome;
            } else {
                state.ctxt =
                    references.modifiedText.substring(0, currIndices[0]) +
                    CustomOutcome(score, thresholdsAsNumberStringArr) +
                    references.modifiedText.substring(currIndices[1]);

                references.modifiedText =
                    references.modifiedText.substring(0, currIndices[0]) +
                    mess +
                    CustomOutcome(score, thresholdsAsNumberStringArr);
            }
        }
    }
    references.modifiedText += IncrementExp(characterName, statName);
    references.modifiedText += textCopy.substring(currIndices[1]);
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
    return temp.substring(0, temp.length - 1);
};

export default skillcheck;
