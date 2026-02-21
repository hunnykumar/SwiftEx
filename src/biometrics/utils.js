import AsyncStorage from "@react-native-async-storage/async-storage";
import * as bcrypt from 'bcryptjs';
import { POSTFIX, SALTS } from "../Dashboard/constants";

export async function AddPassCode(passcode) {
    const getSalt = bcrypt.genSaltSync(SALTS);
    const encryptData = bcrypt.hashSync(passcode + POSTFIX, getSalt);
    await AsyncStorage.setItem("pin", JSON.stringify(encryptData));
}

export async function CheckPasscode(passcode) {
    const getPass = await AsyncStorage.getItem("pin");
    return bcrypt.compareSync(passcode + POSTFIX, JSON.parse(getPass));
}