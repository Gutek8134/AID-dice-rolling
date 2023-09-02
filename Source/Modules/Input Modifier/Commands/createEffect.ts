import { Effect } from "../../Shared Library/Effect";
import {
    EffectToString,
    ElementInArray,
    isInStats,
} from "../../Shared Library/Utils";
import { state } from "../../proxy_state";
import { restrictedStatNames } from "../constants";
import { CutCommandFromContext } from "./commandutils";

const createEffect = (
    commandArguments: string,
    currIndices: number[],
    modifiedText: string
): string => {
    CutCommandFromContext(modifiedText, currIndices);

    //Looks for pattern name, stat=value, duration, unique?,
    const exp: RegExp =
        /^(?<name>[\w ']+)(?<modifiers>(?:, [\w ']+ *= *-?\d+)+), (?<duration>\d+)(?:, (?<unique>unique))?(?:, (?<appliedOn>a|attack|d|defense|b|battle start))?(?:, (?<appliedTo>self|enemy))?$/i;
    const match: RegExpMatchArray | null = commandArguments.match(exp);

    //Error checking
    if (!match || !match.groups) {
        state.message =
            "Create Effect: Arguments were not given in proper format.";
        return modifiedText;
    }

    if (!state.effects) state.effects = {};
    if (ElementInArray(match.groups.name, Object.keys(state.effects))) {
        state.message = `Create Effect: Effect ${match.groups.name} already exists.`;
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
        if (ElementInArray(modifier[0], restrictedStatNames)) {
            state.message += `\nCreate Effect: ${modifier[0]} cannot be set.`;
            error = true;
            continue;
        }
        //Stats must exist prior
        if (!isInStats(modifier[0])) {
            state.message += `\nCreate Effect: Stat ${modifier[0]} does not exist.`;
            error = true;
        }

        if (ElementInArray(modifier[0], existingModifiers)) {
            state.message += `\nCreate Effect: Stat ${modifier[0]} appears more than once.`;
            error = true;
        } else existingModifiers.push(modifier[0]);
    }
    if (error) return modifiedText;

    let appliedOn: "attack" | "defense" | "battle start" | "not applied";
    switch (match.groups.appliedOn) {
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
    switch (match.groups.appliedTo) {
        default:
        case "self":
            appliedTo = "self";
            break;
        case "enemy":
            appliedTo = "enemy";
            break;
    }

    const effect: Effect = new Effect(
        match.groups.name.trim(),
        initModifiers,
        Number(match.groups.duration.trim()),
        match.groups.unique.length > 0,
        appliedOn,
        appliedTo
    );

    modifiedText = `\nEffect ${
        effect.name
    } created with attributes:\n${EffectToString(effect)}.`;
    return modifiedText;
};

export default createEffect;
