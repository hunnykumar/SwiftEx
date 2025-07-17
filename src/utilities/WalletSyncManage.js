import DeviceInfo from "react-native-device-info";
import { authRequest, GET, POST } from "../Dashboard/exchange/crypto-exchange-front-end-main/src/api";
import { alert } from "../Dashboard/reusables/Toasts";
import messaging from '@react-native-firebase/messaging'

export async function WalletSync(stellarPublicKey, multiChainPublicKey) {
    try {
        const deviceStatus = await deviceSync();
        if (deviceStatus.status) {
            const { res, err } = await authRequest("/users/updatePublicKey", POST, {
                publicKey: stellarPublicKey,
                wallletPublicKey: multiChainPublicKey
            });
            if (res.success) {
                alert("success", "Your device is synced....");
            }
        }
        else {
            alert("error", "Unable to sync device....");
        }
    } catch (error) {
        console.log("---currentWalletSync>Error>>>", error)
    }
}


const deviceSync = async () => {
    try {
        const token = await messaging().getToken();
        const device_info = {
            'deviceBrand': await DeviceInfo.getBrand(),
            'deviceModel': await DeviceInfo.getModel(),
            'systemVersion': await DeviceInfo.getSystemVersion(),
            "deviceUniqueID": await DeviceInfo.getUniqueIdSync(),
            "deviceIP": await DeviceInfo.getIpAddressSync(),
            "deviceType": await DeviceInfo.getDeviceType(),
            "deviceMacAddress": await DeviceInfo.getMacAddress()
        }
        const { err } = await authRequest("/users/syncDevice", POST, { fcmRegToken: token, deviceInfo: device_info });
        if (err) {
            return {
                status: false,
                res: err.message
            };
        }
        else {
            return {
                status: true,
                res: "Your device is synced"
            };
        }

    } catch (err) {
        console.log("error while sync device: ", err)
        return {
            status: false,
            res: err
        };
    }
};