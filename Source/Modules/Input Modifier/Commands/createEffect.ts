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

const createEffect = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);

    //Looks for pattern name, stat=value, duration, unique?, appliedOn?, appliedTo?, impact?
    const exp: RegExp =
        /^(?<name>[\w ']+), (?<duration>\d+)(?<modifiers>(?:, [\w ']+ *= *-?\d+)+)(?:, (?<unique>unique|u))?(?:, (?<appliedOn>a|attack|d|defense|b|battle start|n|not applied))?(?:, (?<appliedTo>self|enemy))?(?:, (?<impact>on end|e|every turn|t|continuous|c))?$/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (!match || !match.groups) {
        state[InfoOutput] =
            "Create Effect: Arguments were not given in proper format.";
        return modifiedText;
    }

    if (!state.effects) state.effects = {};
    if (ElementInArray(match.groups.name, Object.keys(state.effects))) {
        state[
            InfoOutput
        ] = `Create Effect: Effect ${match.groups.name} already exists.`;
        return modifiedText;
    }

    const initModifiers: Array<[string, number]> = match.groups.modifiers
        .substring(2)
        .split(", ")
        .map((el) => {
            const temp: string[] = el.trim().split("=");
            return [temp[0].trim(), Number(temp[1].trim())];
        });

    let error = false;
    const existingModifiers: string[] = [];
    for (const modifier of initModifiers) {
        if (
            ElementInArray(modifier[0], restrictedStatNames) &&
            modifier[0] !== "hp"
        ) {
            state[
                InfoOutput
            ] += `\nCreate Effect: ${modifier[0]} cannot be set.`;
            error = true;
            continue;
        }
        //Stats must exist prior
        if (!isInStats(modifier[0]) && modifier[0] !== "hp") {
            state[
                InfoOutput
            ] += `\nCreate Effect: Stat ${modifier[0]} does not exist.`;
            error = true;
        }

        if (ElementInArray(modifier[0], existingModifiers)) {
            state[
                InfoOutput
            ] += `\nCreate Effect: Stat ${modifier[0]} appears more than once.`;
            error = true;
        } else existingModifiers.push(modifier[0]);
    }
    if (error) return modifiedText;

    if (!Number.isInteger(Number(match.groups.duration))) {
        state[InfoOutput] = "Create Effect: Duration is not a whole number.";
        return modifiedText;
    }

    let appliedOn: "attack" | "defense" | "battle start" | "not applied";
    switch (match.groups.appliedOn.toLowerCase()) {
        case "a":
        case "attack":
            appliedOn = "attack";
            break;
        case "b":
        case "battle start":
            appliedOn = "battle start";
            break;
        case "d":
        case "defense":
            appliedOn = "defense";
            break;
        default:
            appliedOn = "not applied";
            break;
    }

    let appliedTo: "self" | "enemy";
    switch (match.groups.appliedTo.toLowerCase()) {
        default:
        case "self":
            appliedTo = "self";
            break;
        case "enemy":
            appliedTo = "enemy";
            break;
    }

    let impact: "on end" | "continuous" | "every turn";
    switch (match.groups.impact.toLowerCase()) {
        default:
        case "c":
        case "continuous":
            impact = "continuous";
            break;

        case "e":
        case "on end":
            impact = "on end";
            break;

        case "t":
        case "every turn":
            impact = "every turn";
            break;
    }

    const effect: Effect = new Effect(
        match.groups.name.trim(),
        initModifiers,
        Number(match.groups.duration.trim()),
        appliedOn,
        appliedTo,
        impact,
        match.groups.unique !== undefined
    );

    state.effects[effect.name] = effect;

    modifiedText = `\nEffect ${
        effect.name
    } created with attributes:\n${EffectToString(effect)}.`;
    return modifiedText;
};

export default createEffect;
