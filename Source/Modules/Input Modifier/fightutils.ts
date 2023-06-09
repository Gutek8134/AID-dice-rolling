export const CustomDamageOutput = (
    damage: number,
    values: Array<[number, string]>
) => {
    let i = 0;
    let out = "no damage";

    while (damage >= values[i][0] && values[i]) {
        out = values[i++][1];
    }

    return out;
};
