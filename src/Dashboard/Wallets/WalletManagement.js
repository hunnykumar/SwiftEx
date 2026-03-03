import AccessNativeStorage from "./AccessNativeStorage";
import { alert } from "../reusables/Toasts";

export const checkWalletExistOrNot = async (walletName) => {
    const allWallets = await AccessNativeStorage.getAllWallets();
    if (Array.isArray(allWallets)) {
        const result = allWallets.some(obj =>
            obj.name.toLowerCase() === walletName.toLowerCase()
        );
        if (result) {
            alert("error","Wallet with same name already exists.");
        }
        return result;
    }
    return false;
}