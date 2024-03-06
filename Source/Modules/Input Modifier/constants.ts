//You can edit this list to edit what will be displayed when dealing x damage.
//Format is [minimum damage, "displayed message"].
//Note that it is used in sentence like
//Miguel attacked Zuibroldun Jodem dealing {value from here} (x).
export let damageOutputs: [number, string][] = [
    [1, "light damage"],
    [15, "medium damage"],
    [30, "significant damage"],
    [60, "heavy damage"],
    [100, "a killing blow"],
];

export let restrictedStatNames: string[] = [
    "hp",
    "level",
    "experience",
    "expToNextLvl",
    "skillpoints",
    "isNpc",
    "items",
    "type",
    "name",
];

//!Does not check whether stats are equal to 0 when attacking. Change only if your damage function does not contain division or you've checked it properly.
export let ignoreZeroDiv: boolean = false;

//!Sets whether dead characters should be punished upon skillchecking
export let shouldPunish: boolean = true;

//!If set to true, !attack will work as !sAttack and vice versa
export let defaultDodge: boolean = false;

//!Switches between levelling each stat separately (true) and levelling character then distributing free points (false)
export let levellingToOblivion: boolean = false;

//!Should defending character also gain XP when !attack is used?
export let defendingCharacterLevels: boolean = false;

//Debug purposes only
export const SetDamageOutputs = (inValue: [number, string][]) => {
    damageOutputs = inValue;
};
export const SetIgnoredValues = (inValue: string[]) => {
    restrictedStatNames = inValue;
};
export const SetIgnoreZeroDiv = (inValue: boolean) => {
    ignoreZeroDiv = inValue;
};
export const SetShouldPunish = (inValue: boolean) => {
    shouldPunish = inValue;
};
export const SetDefaultDodge = (inValue: boolean) => {
    defaultDodge = inValue;
};
export const SetLevellingToOblivion = (inValue: boolean) => {
    levellingToOblivion = inValue;
};
export const SetDefendingCharacterLevels = (inValue: boolean) => {
    defendingCharacterLevels = inValue;
};
