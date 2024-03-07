import { state } from "../../proxy_state";
import { InfoOutput } from "../modifier";

const showInventory = (
    commandArguments: string,
    modifiedText: string
): string => {
    if (commandArguments !== "") {
        state[InfoOutput] =
            "Show Inventory: Command doesn't take any arguments.";
        return modifiedText;
    }
    //console.log(state.inventory);
    return (
        "Currently your inventory holds: " +
        (state.inventory.length ? state.inventory.join(", ") : "nothing") +
        "."
    );
};

export default showInventory;
