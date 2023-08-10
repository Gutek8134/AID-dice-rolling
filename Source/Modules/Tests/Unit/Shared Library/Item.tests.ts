import { Item } from "../../../Shared Library/Item";

describe("Item creation", () => {
    it("Should create item with predefined stats", () => {
        const values: [string, string | number][] = [
            ["slot", "head"],
            ["dexterity", -5],
            ["nano machines", 3],
            ["effect", "bleeding"],
        ];
        const item = new Item("Staff of Zalos", values);
        const expected: { [key: string]: any } = {
            slot: "head",
            effects: ["bleeding"],
            modifiers: {
                dexterity: -5,
                "nano machines": 3,
            },
            name: "Staff of Zalos",
            type: "item",
        };

        for (const key in item) {
            expect(item).toHaveProperty(key);
            expect(item[key]).toEqual(expected[key]);
        }
    });
});
