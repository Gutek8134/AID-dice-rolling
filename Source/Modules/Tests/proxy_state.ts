import { Item } from "../Shared Library/Item";
import { Character } from "../Shared Library/Character";

export const state: {
    stats: string[];
    dice: number;
    startingLevel: number;
    startingHP: number;
    characters: { [key: string]: Character };
    punishment: number;
    skillpointsOnLevelUp: number;
    items: { [key: string]: Item };
    inventory: string[];
    ctxt: string;
    out: string;
    message: string;
    inBattle: boolean;
    side1: string[];
    side2: string[];
} = {
    stats: [],
    dice: 20,
    startingLevel: 1,
    startingHP: 100,
    characters: {},
    punishment: 5,
    skillpointsOnLevelUp: 5,
    items: {},
    inventory: [],
    ctxt: "",
    out: "",
    message: "",
    inBattle: false,
    side1: [],
    side2: [],
};
