import { Item } from "./Shared Library/Item";
import { Character } from "./Shared Library/Character";

export const state: {
    //Options
    stats: string[];
    dice: number;
    startingLevel: number;
    startingHP: number;
    punishment: number;
    skillpointsOnLevelUp: number;

    //Data
    inventory: string[];
    items: { [key: string]: Item };
    characters: { [key: string]: Character };

    //Used in modifiers other than Input
    in: string;
    ctxt: string;
    out: string;
    message: string | { text: string; stop: boolean }[];

    //Battle related
    inBattle: boolean;
    side1?: string[];
    side2?: string[];
    active?: string[];
    currentSide?: string;
    activeCharacterName?: string;
    activeCharacter?: Character;

    //Just so there won't be errors when accessing by [] op
    [key: string]: any;
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
    in: "",
    ctxt: "",
    out: "",
    message: "",
    inBattle: false,
};
