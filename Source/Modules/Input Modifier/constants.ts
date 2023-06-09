//You can edit this list to edit what will be displayed when dealing x damage.
//Format is [minimum damage, "displayed message"].
//Note that it is used in sentence like
//Miguel attacked Zuibroldun Jodem dealing {value from here} (x).
export const damageOutputs: [number, string][] = [
    [1, "light damage"],
    [15, "medium damage"],
    [30, "significant damage"],
    [60, "heavy damage"],
    [100, "a killing blow"],
];

//Contains every type of equipment you can wear and have
export const equipmentParts: string[] = [
    "helmet",
    "armor",
    "leggins",
    "weapon",
    "artifact",
];

export const ignoredValues: string[] = [
    "hp",
    "level",
    "experience",
    "expToNextLvl",
    "skillpoints",
    "isNpc",
    "items",
    "type",
];

//!Does not check whether stats are equal to 0 when attacking. Change only if your damage function does not contain division or you've checked it properly.
export const ignoreZeroDiv: boolean = false;

//!Sets whether dead characters should be punished upon skillchecking
export const shouldPunish: boolean = true;

//!If set to true, !attack will work as !sAttack and vice versa
export const defaultDodge: boolean = false;

//!Switches between levelling each stat separately (true) and levelling character then distributing free points (false)
export const levellingToOblivion: boolean = false;

//!Should defending character also gain XP when !attack is used?
export const defendingCharacterLevels: boolean = false;
