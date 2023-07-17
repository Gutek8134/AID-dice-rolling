import { state } from "../../Tests/proxy_state";

const showInventory = (
    commandArguments: string,
    modifiedText: string
): string => {
    if (commandArguments !== "") {
        state.message =
            "Show Inventory: showInventory doesn't take any arguments";
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
