import { Effect } from "../../Shared Library/Effect";
import {
    EffectToString,
    ElementInArray,
    isInStats,
} from "../../Shared Library/Utils";
import { state } from "../../proxy_state";
import { restrictedStatNames } from "../constants";
import { InfoOutput } from "../modifier";
import { CutCommandFromContext } from "./commandutils";

const alterEffect = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);

    //Looks for pattern name, stat=value, duration, unique?, appliedOn?, appliedTo?, impact?W
    const exp: RegExp =
        /^\s*(?<name>[\w ']+)(?<duration>, \d+)?(?<modifiers>(?:, [\w ']+ *= *-?\d+)+)?(?:, (?<unique>unique|u))?(?:, (?<appliedOn>a|attack|d|defense|b|battle start|n|not applied))?(?:, (?<appliedTo>self|enemy))?(?:, (?<impact>on end|e|every turn|t|continuous|c))?\s*$/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Alter Effect: Arguments were not given in proper format.";
        return modifiedText;
    }

    if (!state.effects) state.effects = {};
    if (!ElementInArray(match.groups.name, Object.keys(state.effects))) {
        state[
            InfoOutput
        ] = `Alter Effect: Effect ${match.groups.name} doesn't exist.`;
        return modifiedText;
    }

    const effect: Effect = state.effects[match.groups.name];
    const oldAttributes = EffectToString(effect);

    let modifiers: Array<[string, number]> = [];

    if (match.groups.modifiers) {
        modifiers = match.groups.modifiers
            .substring(2)
            .split(", ")
            .map((el) => {
                const temp: string[] = el.trim().split("=");
                return [temp[0].trim(), Number(temp[1].trim())];
            });

        let error = false;
        const existingModifiers: string[] = [];
        for (const modifier of modifiers) {
            if (
                ElementInArray(modifier[0], restrictedStatNames) &&
                modifier[0] !== "hp"
            ) {
                state[
                    InfoOutput
                ] += `\nAlter Effect: ${modifier[0]} cannot be set.`;
                error = true;
                continue;
            }
            //Stats must exist prior
            if (!isInStats(modifier[0]) && modifier[0] !== "hp") {
                state[
                    InfoOutput
                ] += `\nAlter Effect: Stat ${modifier[0]} does not exist.`;
                error = true;
            }

            if (ElementInArray(modifier[0], existingModifiers)) {
                state[
                    InfoOutput
                ] += `\nAlter Effect: Stat ${modifier[0]} appears more than once.`;
                error = true;
            } else existingModifiers.push(modifier[0]);
        }
        if (error) return modifiedText;

        let overriddenModifiers: { [key: string]: number } = {};
        for (const [stat, value] of modifiers) {
            overriddenModifiers[stat] = value;
        }

        effect.modifiers = overriddenModifiers;
    }

    if (match.groups.duration) {
        match.groups.duration = match.groups.duration.substring(2);
        if (!Number.isInteger(Number(match.groups.duration))) {
            state[InfoOutput] =
                "Create Effect: Duration is not a whole number.";
            return modifiedText;
        }

        effect.durationLeft = effect.baseDuration = Number(
            match.groups.duration
        );
    }

    if (match.groups.unique)
        switch (match.groups.unique) {
            case "u":
            case "unique":
                effect.applyUnique = true;
                break;
            case "i":
            case "not unique":
                effect.applyUnique = false;
                break;
        }

    if (match.groups.appliedOn)
        switch (match.groups.appliedOn.toLowerCase()) {
            case "a":
            case "attack":
                effect.appliedOn = "attack";
                break;

            case "b":
            case "battle start":
                effect.appliedOn = "battle start";
                break;

            case "d":
            case "defense":
                effect.appliedOn = "defense";
                break;

            case "n":
            case "not applied":
            default:
                effect.appliedOn = "not applied";
                break;
        }

    if (match.groups.appliedTo)
        switch (match.groups.appliedTo.toLowerCase()) {
            default:
            case "self":
                effect.appliedTo = "self";
                break;
            case "enemy":
                effect.appliedTo = "enemy";
                break;
        }

    if (match.groups.impact)
        switch (match.groups.impact.toLowerCase()) {
            default:
            case "c":
            case "continuous":
                effect.impact = "continuous";
                break;

            case "e":
            case "on end":
                effect.impact = "on end";
                break;

            case "t":
            case "every turn":
                effect.impact = "every turn";
                break;
        }

    modifiedText = `\n${
        match.groups.name
    }'s attributes has been altered\nfrom\n${oldAttributes}\nto\n${EffectToString(
        effect
    )}.`;
    return modifiedText;
};

export default alterEffect;
