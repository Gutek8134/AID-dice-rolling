import showInventory from "../../../../Input Modifier/Commands/showinventory";
import { state } from "../../../proxy_state";

describe("Command show inventory", () => {
    it("Invalid args error", () => {
        showInventory("aa", "");
        expect(state.message).toEqual(
            "Show Inventory: Command doesn't take any arguments."
        );
    });

    it("Should print out inventory", () => {
        expect(showInventory("", "")).toEqual(
            "Currently your inventory holds: nothing."
        );

        state.inventory = ["item1"];
        expect(showInventory("", "")).toEqual(
            "Currently your inventory holds: item1."
        );

        state.inventory = ["item1", "item2", "item4"];
        expect(showInventory("", "")).toEqual(
            "Currently your inventory holds: item1, item2, item4."
        );
    });
});
